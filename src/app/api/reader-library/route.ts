import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  ReaderLibraryRequest,
} from "@/domain/reader/reader-library.types";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

import {
  getReaderLibraryData,
} from "@/server/stories/story.library";

const MAX_STORY_IDS =
  100;

export async function POST(
  request:
    Request,
) {
  try {
    const body =
      await request.json() as
        unknown;

    const normalizedRequest =
      normalizeRequest(
        body,
      );

    const data =
      await getReaderLibraryData(
        normalizedRequest,
      );

    return Response.json(
      {
        ok:
          true,

        data,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[READER LIBRARY ERROR]",
      error,
    );

    return Response.json(
      {
        ok:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a seleção do leitor.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}

function normalizeRequest(
  value:
    unknown,
): ReaderLibraryRequest {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return {
      savedStoryIds:
        [],

      historyStoryIds:
        [],

      favoriteCategories:
        [],

      favoriteCountryCodes:
        [],
    };
  }

  const objectValue =
    value as
      Record<
        string,
        unknown
      >;

  return {
    savedStoryIds:
      normalizeStringArray(
        objectValue.savedStoryIds,
      ),

    historyStoryIds:
      normalizeStringArray(
        objectValue.historyStoryIds,
      ),

    favoriteCategories:
      normalizeCategories(
        objectValue.favoriteCategories,
      ),

    favoriteCountryCodes:
      normalizeCountryCodes(
        objectValue.favoriteCountryCodes,
      ),
  };
}

function normalizeStringArray(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
            "string",
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  ].slice(
    0,
    MAX_STORY_IDS,
  );
}

function normalizeCategories(
  value:
    unknown,
): NewsCategory[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is NewsCategory =>
      item ===
        "football" ||
      item ===
        "politics" ||
      item ===
        "economy",
  );
}

function normalizeCountryCodes(
  value:
    unknown,
): CountryCode[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  const validCountryCodes =
    new Set(
      listCountryCatalog().map(
        (country) =>
          country.code,
      ),
    );

  return value
    .filter(
      (
        item,
      ): item is CountryCode =>
        typeof item ===
          "string" &&
        validCountryCodes.has(
          item as
            CountryCode,
        ),
    )
    .slice(
      0,
      12,
    );
}
