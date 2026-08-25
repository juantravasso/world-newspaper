import "server-only";

const VOYAGE_EMBEDDINGS_URL =
  "https://api.voyageai.com/v1/embeddings";

/*
 * voyage-3.5-lite: modelo multilíngue de propósito
 * geral, com output_dimension reduzido (512 em vez
 * do padrão 1024) — suficiente para achar "mesmo
 * fato" entre países, e mais barato/rápido de
 * comparar do que a dimensão cheia.
 */
const VOYAGE_MODEL =
  "voyage-3.5-lite";

const OUTPUT_DIMENSION =
  512;

const REQUEST_TIMEOUT_MS =
  20_000;

/*
 * A Voyage aceita vários textos por chamada.
 * Mantemos os lotes pequenos para não estourar
 * o limite de tamanho de requisição nem perder
 * tudo se um lote falhar.
 */
const BATCH_SIZE =
  32;

type VoyageEmbeddingsResponse = {
  data?: Array<{
    embedding?:
      number[];

    index?:
      number;
  }>;
};

export type EmbedTextsResult = {
  storyId:
    string;

  embedding:
    number[];
};

/**
 * Calcula o embedding de cada texto informado.
 * Itens que falharem (erro de rede, resposta
 * inesperada) simplesmente não aparecem no
 * resultado — quem chama decide se tenta de novo
 * na próxima execução.
 */
export async function embedStoryTexts(
  items: Array<{
    storyId:
      string;

    text:
      string;
  }>,
): Promise<EmbedTextsResult[]> {
  const apiKey =
    process.env
      .VOYAGE_API_KEY
      ?.trim();

  if (
    !apiKey ||
    items.length ===
      0
  ) {
    return [];
  }

  const results:
    EmbedTextsResult[] =
    [];

  for (
    let start = 0;
    start <
    items.length;
    start +=
      BATCH_SIZE
  ) {
    const batch =
      items.slice(
        start,
        start +
          BATCH_SIZE,
      );

    const batchResults =
      await embedBatch(
        batch,
        apiKey,
      );

    results.push(
      ...batchResults,
    );
  }

  return results;
}

/*
 * Contas sem forma de pagamento cadastrada na
 * Voyage ficam com um limite bem baixo (ex: 3
 * requisições/minuto) — os tokens grátis
 * continuam valendo, só a velocidade cai. Espera
 * e tenta de novo em vez de simplesmente desistir.
 */
const MAX_RATE_LIMIT_RETRIES =
  3;

const DEFAULT_RETRY_DELAY_MS =
  21_000;

async function embedBatch(
  batch: Array<{
    storyId:
      string;

    text:
      string;
  }>,

  apiKey:
    string,
): Promise<EmbedTextsResult[]> {
  for (
    let attempt = 0;
    attempt <=
    MAX_RATE_LIMIT_RETRIES;
    attempt++
  ) {
    try {
      const response =
        await fetch(
          VOYAGE_EMBEDDINGS_URL,
          {
            method:
              "POST",

            headers: {
              Authorization: `Bearer ${apiKey}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  input:
                    batch.map(
                      (item) =>
                        item.text,
                    ),

                  model:
                    VOYAGE_MODEL,

                  output_dimension:
                    OUTPUT_DIMENSION,

                  input_type:
                    "document",
                },
              ),

            signal:
              AbortSignal.timeout(
                REQUEST_TIMEOUT_MS,
              ),
          },
        );

      if (
        response.status ===
          429 &&
        attempt <
          MAX_RATE_LIMIT_RETRIES
      ) {
        const delayMs =
          getRetryDelayMs(
            response,
          );

        console.warn(
          `[VOYAGE] limite de taxa atingido, tentando de novo em ${delayMs}ms`,
        );

        await sleep(
          delayMs,
        );

        continue;
      }

      if (
        !response.ok
      ) {
        console.warn(
          `[VOYAGE] lote falhou com status ${response.status}`,
        );

        return [];
      }

      const data =
        await response.json() as
          VoyageEmbeddingsResponse;

      return (
        data.data ??
        []
      ).flatMap(
        (entry) => {
          const index =
            entry.index;

          const embedding =
            entry.embedding;

          if (
            index ===
              undefined ||
            !embedding ||
            !batch[index]
          ) {
            return [];
          }

          return [
            {
              storyId:
                batch[
                  index
                ]!.storyId,

              embedding,
            },
          ];
        },
      );
    } catch (
      error
    ) {
      console.warn(
        "[VOYAGE] falha ao calcular embeddings",
        error instanceof
          Error
          ? error.message
          : error,
      );

      return [];
    }
  }

  return [];
}

function getRetryDelayMs(
  response:
    Response,
): number {
  const header =
    response.headers.get(
      "retry-after",
    );

  const parsed =
    header ?
      Number(
        header,
      )
      : NaN;

  return Number.isFinite(
    parsed,
  ) &&
    parsed >
      0
    ? parsed *
        1_000
    : DEFAULT_RETRY_DELAY_MS;
}

function sleep(
  ms:
    number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms,
      ),
  );
}

/**
 * Similaridade de cosseno entre dois vetores de
 * mesma dimensão. Assume que ambos já vieram do
 * mesmo modelo/output_dimension.
 */
export function cosineSimilarity(
  first:
    number[],

  second:
    number[],
): number {
  let dotProduct =
    0;

  let firstMagnitude =
    0;

  let secondMagnitude =
    0;

  const length =
    Math.min(
      first.length,
      second.length,
    );

  for (
    let index = 0;
    index <
    length;
    index++
  ) {
    const firstValue =
      first[
        index
      ]!;

    const secondValue =
      second[
        index
      ]!;

    dotProduct +=
      firstValue *
      secondValue;

    firstMagnitude +=
      firstValue *
      firstValue;

    secondMagnitude +=
      secondValue *
      secondValue;
  }

  const denominator =
    Math.sqrt(
      firstMagnitude,
    ) *
    Math.sqrt(
      secondMagnitude,
    );

  return denominator ===
    0
    ? 0
    : dotProduct /
        denominator;
}
