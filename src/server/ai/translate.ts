import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/*
 * Haiku é suficiente e barato para traduzir
 * manchete + resumo curtos — não é uma tarefa
 * que precise de um modelo mais caro.
 */
const TRANSLATION_MODEL =
  "claude-haiku-4-5";

const MAX_HEADLINE_LENGTH =
  400;

const MAX_SUMMARY_LENGTH =
  2_000;

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

export type TranslateToPortugueseResult =
  | {
      translated:
        true;

      headline:
        string;

      summary:
        string;
    }
  | {
      translated:
        false;
    };

/**
 * Traduz manchete + resumo de uma story
 * estrangeira para português. Nunca lança —
 * se a chave não estiver configurada, a
 * chamada falhar, ou a resposta vier vazia
 * ou malformada, retorna `translated: false`
 * e quem chama simplesmente não grava nada
 * (tenta de novo na próxima execução).
 */
export async function translateStoryToPortuguese(
  input: {
    headline:
      string;

    summary:
      string;

    language:
      string;
  },
): Promise<TranslateToPortugueseResult> {
  const client =
    getClient();

  if (!client) {
    return {
      translated:
        false,
    };
  }

  try {
    const response =
      await client.messages.create(
        {
          model:
            TRANSLATION_MODEL,

          max_tokens:
            1_024,

          system:
            "Você traduz manchetes e resumos de notícias para português do Brasil. " +
            "Responda só com um objeto JSON válido, sem markdown, no formato " +
            '{"headline": "...", "summary": "..."}. ' +
            "Mantenha nomes próprios como estão. Não adicione opinião nem comentário.",

          messages: [
            {
              role:
                "user",

              content: `Idioma original: ${input.language}\n\nManchete: ${input.headline}\n\nResumo: ${input.summary}`,
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
      return {
        translated:
          false,
      };
    }

    return parseTranslationResponse(
      textBlock.text,
    );
  } catch (
    error
  ) {
    console.warn(
      "[TRANSLATE] falha ao traduzir story",
      error instanceof
        Error
        ? error.message
        : error,
    );

    return {
      translated:
        false,
    };
  }
}

function parseTranslationResponse(
  rawText:
    string,
): TranslateToPortugueseResult {
  try {
    const jsonText =
      extractJsonObject(
        rawText,
      );

    if (!jsonText) {
      return {
        translated:
          false,
      };
    }

    const parsed =
      JSON.parse(
        jsonText,
      ) as
        Record<
          string,
          unknown
        >;

    const headline =
      typeof parsed.headline ===
        "string"
        ? parsed.headline.trim()
        : "";

    const summary =
      typeof parsed.summary ===
        "string"
        ? parsed.summary.trim()
        : "";

    if (
      !headline ||
      !summary ||
      headline.length >
        MAX_HEADLINE_LENGTH ||
      summary.length >
        MAX_SUMMARY_LENGTH
    ) {
      return {
        translated:
          false,
      };
    }

    return {
      translated:
        true,

      headline,
      summary,
    };
  } catch {
    return {
      translated:
        false,
    };
  }
}

function extractJsonObject(
  rawText:
    string,
): string | null {
  const start =
    rawText.indexOf(
      "{",
    );

  const end =
    rawText.lastIndexOf(
      "}",
    );

  if (
    start ===
      -1 ||
    end ===
      -1 ||
    end <
      start
  ) {
    return null;
  }

  return rawText.slice(
    start,
    end +
      1,
  );
}
