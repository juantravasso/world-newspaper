import "server-only";

import {
  createHash,
} from "node:crypto";

const PEXELS_SEARCH_URL =
  "https://api.pexels.com/v1/search";

const RESULTS_PER_QUERY =
  5;

const REQUEST_TIMEOUT_MS =
  8_000;

type PexelsSearchResponse = {
  photos?: Array<{
    src?: {
      large?:
        string;
    };
  }>;
};

/**
 * Busca uma foto no Pexels para a palavra-chave
 * informada. `seed` decide, de forma estável,
 * qual dos resultados usar — histórias diferentes
 * com a mesma busca não caem sempre na mesma foto.
 * Retorna null quando não há chave configurada,
 * a busca falha ou não há resultado.
 */
export async function searchPexelsImage(
  query:
    string,

  seed:
    string,
): Promise<string | null> {
  const apiKey =
    process.env
      .PEXELS_API_KEY
      ?.trim();

  if (!apiKey) {
    return null;
  }

  try {
    const url =
      new URL(
        PEXELS_SEARCH_URL,
      );

    url.searchParams.set(
      "query",
      query,
    );

    url.searchParams.set(
      "per_page",
      String(
        RESULTS_PER_QUERY,
      ),
    );

    url.searchParams.set(
      "orientation",
      "landscape",
    );

    const response =
      await fetch(
        url,
        {
          headers: {
            Authorization:
              apiKey,
          },

          signal:
            AbortSignal.timeout(
              REQUEST_TIMEOUT_MS,
            ),
        },
      );

    if (
      !response.ok
    ) {
      if (
        response.status ===
        429
      ) {
        console.warn(
          "[PEXELS] limite de requisições atingido",
        );
      }

      return null;
    }

    const data =
      await response.json() as
        PexelsSearchResponse;

    const photos =
      (
        data.photos ??
        []
      ).filter(
        (photo) =>
          Boolean(
            photo.src
              ?.large,
          ),
      );

    if (
      photos.length ===
      0
    ) {
      return null;
    }

    const index =
      hashToIndex(
        seed,
        photos.length,
      );

    return (
      photos[index]
        ?.src
        ?.large ??
      null
    );
  } catch (
    error
  ) {
    console.warn(
      "[PEXELS] falha ao buscar imagem",
      error instanceof
        Error
        ? error.message
        : error,
    );

    return null;
  }
}

function hashToIndex(
  seed:
    string,

  length:
    number,
): number {
  const hash =
    createHash(
      "sha256",
    )
      .update(
        seed,
      )
      .digest();

  return (
    hash.readUInt32BE(
      0,
    ) %
    length
  );
}
