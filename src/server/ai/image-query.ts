import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/*
 * Mesmo modelo barato usado na tradução — gerar
 * 3-5 palavras-chave a partir de uma manchete
 * curta não precisa de um modelo mais caro.
 */
const IMAGE_QUERY_MODEL =
  "claude-haiku-4-5";

const MAX_QUERY_LENGTH =
  120;

let cachedClient:
  Anthropic | null =
  null;

function getClient():
  Anthropic | null {
  const apiKey =
    process.env
      .ANTHROPIC_API_KEY
      ?.trim();

  if (!apiKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient =
      new Anthropic(
        {
          apiKey,
        },
      );
  }

  return cachedClient;
}

/**
 * Pede pra IA 3-5 palavras-chave em inglês que
 * descrevam o assunto concreto da notícia (pessoas,
 * lugar, evento), pra usar como busca no Pexels em
 * vez do termo genérico categoria+país. Nunca lança
 * — se a chave não estiver configurada, a chamada
 * falhar, ou a resposta vier vazia, retorna `null` e
 * quem chama cai pro termo genérico.
 */
export async function generateImageSearchQuery(
  headline:
    string,

  summary:
    string,
): Promise<string | null> {
  const client =
    getClient();

  if (!client) {
    return null;
  }

  try {
    const response =
      await client.messages.create(
        {
          model:
            IMAGE_QUERY_MODEL,

          max_tokens:
            64,

          system:
            "Você gera termos de busca de banco de imagens (Pexels) a partir de notícias. " +
            "Responda só com 3 a 5 palavras-chave em inglês, separadas por espaço, sem pontuação, " +
            "descrevendo o assunto concreto da notícia (pessoas, lugar, tipo de evento) — nunca nomes " +
            "próprios de pessoas específicas, já que fotos de pessoas reais não aparecem em bancos de " +
            "imagem stock. Não escreva nada além das palavras-chave.",

          messages: [
            {
              role:
                "user",

              content: `Manchete: ${headline}\n\nResumo: ${summary}`,
            },
          ],
        },
      );

    const textBlock =
      response.content.find(
        (
          block,
        ) =>
          block.type ===
          "text",
      );

    if (
      !textBlock ||
      textBlock.type !==
        "text"
    ) {
      return null;
    }

    const query =
      textBlock.text
        .trim()
        .replace(
          /[\r\n]+/g,
          " ",
        );

    if (
      !query ||
      query.length >
        MAX_QUERY_LENGTH
    ) {
      return null;
    }

    return query;
  } catch (
    error
  ) {
    console.warn(
      "[IMAGE QUERY] falha ao gerar termo de busca",
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }
}
