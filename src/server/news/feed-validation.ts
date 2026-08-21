import "server-only";

const VALIDATION_TIMEOUT_MS =
  10_000;

const MAX_VALIDATION_BYTES =
  2_000_000;

export type FeedValidationResult =
  | {
      valid:
        true;

      itemCount:
        number;
    }
  | {
      valid:
        false;

      message:
        string;
    };

/**
 * Busca a URL informada e confirma que é um
 * feed RSS/Atom real com pelo menos um item,
 * antes de deixar salvar no catálogo.
 */
export async function validateFeedUrl(
  url:
    string,
): Promise<FeedValidationResult> {
  let parsedUrl:
    URL;

  try {
    parsedUrl =
      new URL(
        url,
      );
  } catch {
    return {
      valid:
        false,

      message:
        "URL inválida.",
    };
  }

  if (
    parsedUrl.protocol !==
      "http:" &&
    parsedUrl.protocol !==
      "https:"
  ) {
    return {
      valid:
        false,

      message:
        "A URL precisa usar http ou https.",
    };
  }

  try {
    const response =
      await fetch(
        parsedUrl,
        {
          headers: {
            Accept:
              "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",

            "User-Agent":
              "WorldNewspaper/0.1 RSS Aggregator",
          },

          signal:
            AbortSignal.timeout(
              VALIDATION_TIMEOUT_MS,
            ),
        },
      );

    if (
      !response.ok
    ) {
      return {
        valid:
          false,

        message:
          `A URL respondeu com status ${response.status}.`,
      };
    }

    const contentLength =
      Number(
        response.headers.get(
          "content-length",
        ) ??
        0,
      );

    if (
      contentLength >
      MAX_VALIDATION_BYTES
    ) {
      return {
        valid:
          false,

        message:
          "O feed é grande demais para ser validado.",
      };
    }

    const text =
      await response.text();

    if (
      Buffer.byteLength(
        text,
        "utf8",
      ) >
      MAX_VALIDATION_BYTES
    ) {
      return {
        valid:
          false,

        message:
          "O feed é grande demais para ser validado.",
      };
    }

    const head =
      text.slice(
        0,
        2_000,
      );

    const looksLikeFeed =
      /<rss[\s>]/i.test(
        head,
      ) ||
      /<feed[\s>]/i.test(
        head,
      );

    if (
      !looksLikeFeed
    ) {
      return {
        valid:
          false,

        message:
          "A resposta não parece ser um feed RSS ou Atom.",
      };
    }

    const itemCount =
      (
        text.match(
          /<item[\s>]/gi,
        ) ??
        []
      ).length +
      (
        text.match(
          /<entry[\s>]/gi,
        ) ??
        []
      ).length;

    if (
      itemCount ===
      0
    ) {
      return {
        valid:
          false,

        message:
          "O feed foi encontrado, mas não tem nenhum item.",
      };
    }

    return {
      valid:
        true,

      itemCount,
    };
  } catch (
    error
  ) {
    return {
      valid:
        false,

      message:
        error instanceof
        Error
          ? `Não foi possível acessar a URL: ${error.message}`
          : "Não foi possível acessar a URL.",
    };
  }
}
