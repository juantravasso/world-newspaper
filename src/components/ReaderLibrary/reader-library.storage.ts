"use client";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  ReaderLibraryState,
} from "@/domain/reader/reader-library.types";

const STORAGE_KEY =
  "world-newspaper:reader-library";

const CHANGE_EVENT =
  "world-newspaper:reader-library-change";

const MAX_SAVED_STORIES =
  100;

const MAX_HISTORY_ENTRIES =
  50;

export const EMPTY_READER_LIBRARY:
  ReaderLibraryState = {
  version:
    1,

  savedStoryIds:
    [],

  history:
    [],

  favoriteCategories:
    [],

  favoriteCountryCodes:
    [],
};

const EMPTY_READER_LIBRARY_SNAPSHOT =
  JSON.stringify(
    EMPTY_READER_LIBRARY,
  );

export function readReaderLibrarySnapshot():
  string {
  if (
    typeof window ===
    "undefined"
  ) {
    return EMPTY_READER_LIBRARY_SNAPSHOT;
  }

  return (
    window.localStorage.getItem(
      STORAGE_KEY,
    ) ??
    EMPTY_READER_LIBRARY_SNAPSHOT
  );
}

export function getServerReaderLibrarySnapshot():
  string {
  return EMPTY_READER_LIBRARY_SNAPSHOT;
}

export function parseReaderLibrarySnapshot(
  snapshot:
    string,
): ReaderLibraryState {
  try {
    const parsedValue =
      JSON.parse(
        snapshot,
      ) as
        Partial<
          ReaderLibraryState
        >;

    return normalizeReaderLibrary(
      parsedValue,
    );
  } catch {
    return EMPTY_READER_LIBRARY;
  }
}

export function readReaderLibrary():
  ReaderLibraryState {
  return parseReaderLibrarySnapshot(
    readReaderLibrarySnapshot(),
  );
}

export function writeReaderLibrary(
  state:
    ReaderLibraryState,
): ReaderLibraryState {
  const normalizedState =
    normalizeReaderLibrary(
      state,
    );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalizedState,
    ),
  );

  window.dispatchEvent(
    new CustomEvent(
      CHANGE_EVENT,
    ),
  );

  return normalizedState;
}

export function subscribeToReaderLibrary(
  listener:
    () => void,
): () => void {
  function handleStorage(
    event:
      StorageEvent,
  ): void {
    if (
      event.key ===
      STORAGE_KEY
    ) {
      listener();
    }
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    CHANGE_EVENT,
    listener,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      CHANGE_EVENT,
      listener,
    );
  };
}

export function toggleSavedStory(
  state:
    ReaderLibraryState,

  storyId:
    string,
): ReaderLibraryState {
  const normalizedStoryId =
    storyId.trim();

  if (!normalizedStoryId) {
    return state;
  }

  const isSaved =
    state.savedStoryIds.includes(
      normalizedStoryId,
    );

  const savedStoryIds =
    isSaved
      ? state.savedStoryIds.filter(
          (currentStoryId) =>
            currentStoryId !==
            normalizedStoryId,
        )
      : [
          normalizedStoryId,

          ...state.savedStoryIds.filter(
            (currentStoryId) =>
              currentStoryId !==
              normalizedStoryId,
          ),
        ].slice(
          0,
          MAX_SAVED_STORIES,
        );

  return {
    ...state,
    savedStoryIds,
  };
}

export function addHistoryEntry(
  state:
    ReaderLibraryState,

  storyId:
    string,
): ReaderLibraryState {
  const normalizedStoryId =
    storyId.trim();

  if (!normalizedStoryId) {
    return state;
  }

  return {
    ...state,

    history: [
      {
        storyId:
          normalizedStoryId,

        readAtISO:
          new Date()
            .toISOString(),
      },

      ...state.history.filter(
        (entry) =>
          entry.storyId !==
          normalizedStoryId,
      ),
    ].slice(
      0,
      MAX_HISTORY_ENTRIES,
    ),
  };
}

export function toggleFavoriteCategory(
  state:
    ReaderLibraryState,

  category:
    NewsCategory,
): ReaderLibraryState {
  const isFavorite =
    state.favoriteCategories.includes(
      category,
    );

  return {
    ...state,

    favoriteCategories:
      isFavorite
        ? state.favoriteCategories.filter(
            (currentCategory) =>
              currentCategory !==
              category,
          )
        : [
            ...state.favoriteCategories,
            category,
          ],
  };
}

export function toggleFavoriteCountry(
  state:
    ReaderLibraryState,

  countryCode:
    CountryCode,
): ReaderLibraryState {
  const isFavorite =
    state.favoriteCountryCodes.includes(
      countryCode,
    );

  return {
    ...state,

    favoriteCountryCodes:
      isFavorite
        ? state.favoriteCountryCodes.filter(
            (currentCode) =>
              currentCode !==
              countryCode,
          )
        : [
            ...state.favoriteCountryCodes,
            countryCode,
          ].slice(
            0,
            12,
          ),
  };
}

function normalizeReaderLibrary(
  value:
    Partial<
      ReaderLibraryState
    >,
): ReaderLibraryState {
  return {
    version:
      1,

    savedStoryIds:
      normalizeStringArray(
        value.savedStoryIds,
        MAX_SAVED_STORIES,
      ),

    history:
      Array.isArray(
        value.history,
      )
        ? value.history
            .flatMap(
              (entry) => {
                if (
                  !entry ||
                  typeof entry !==
                    "object"
                ) {
                  return [];
                }

                const storyId =
                  (
                    entry as {
                      storyId?:
                        unknown;
                    }
                  ).storyId;

                const readAtISO =
                  (
                    entry as {
                      readAtISO?:
                        unknown;
                    }
                  ).readAtISO;

                if (
                  typeof storyId !==
                    "string" ||
                  !storyId.trim()
                ) {
                  return [];
                }

                return [
                  {
                    storyId:
                      storyId.trim(),

                    readAtISO:
                      typeof readAtISO ===
                        "string"
                        ? readAtISO
                        : new Date(
                            0,
                          ).toISOString(),
                  },
                ];
              },
            )
            .filter(
              (
                entry,
                index,
                entries,
              ) =>
                entries.findIndex(
                  (candidate) =>
                    candidate.storyId ===
                    entry.storyId,
                ) ===
                index,
            )
            .slice(
              0,
              MAX_HISTORY_ENTRIES,
            )
        : [],

    favoriteCategories:
      normalizeCategories(
        value.favoriteCategories,
      ),

    favoriteCountryCodes:
      normalizeCountryCodes(
        value.favoriteCountryCodes,
      ),
  };
}

function normalizeStringArray(
  value:
    unknown,

  limit:
    number,
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
        .filter(
          Boolean,
        ),
    ),
  ].slice(
    0,
    limit,
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

  return value
    .filter(
      (
        item,
      ): item is CountryCode =>
        typeof item ===
        "string",
    )
    .slice(
      0,
      12,
    );
}