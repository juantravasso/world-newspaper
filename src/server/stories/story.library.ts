import "server-only";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import type {
  ReaderLibraryRequest,
  ReaderLibraryResponse,
  ReaderLibraryStoryItem,
} from "@/domain/reader/reader-library.types";

import {
  findCountryByCode,
} from "@/server/countries/country-catalog";

import {
  formatRelativeTime,
  getStorySourceCount,
} from "@/server/news/story-presentation";

import {
  findStoredStories,
  findStoredStoriesByIds,
} from "@/server/stories/story.persistence";

const RECENT_CANDIDATES =
  60;

const CANDIDATES_PER_FAVORITE =
  24;

const MAX_FAVORITE_GROUPS =
  12;

const RECOMMENDATION_LIMIT =
  12;

const MILLISECONDS_PER_HOUR =
  60 *
  60 *
  1_000;

export async function getReaderLibraryData(
  request:
    ReaderLibraryRequest,
): Promise<
  ReaderLibraryResponse
> {
  const [
    savedStories,
    historyStories,
    candidates,
  ] =
    await Promise.all(
      [
        findStoredStoriesByIds(
          request.savedStoryIds,
        ),

        findStoredStoriesByIds(
          request.historyStoryIds,
        ),

        findRecommendationCandidates(
          request,
        ),
      ],
    );

  const saved =
    savedStories.flatMap(
      toLibraryItem,
    );

  const history =
    historyStories.flatMap(
      toLibraryItem,
    );

  const excludedStoryIds =
    new Set([
      ...request.savedStoryIds,
      ...request.historyStoryIds,
    ]);

  const recommendations =
    candidates
      .filter(
        (story) =>
          !excludedStoryIds.has(
            story.id,
          ),
      )
      .map(
        (story) => ({
          story,

          score:
            getRecommendationScore(
              story,
              request.favoriteCategories,
              request.favoriteCountryCodes,
            ),
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.score -
            first.score ||
          getTimestamp(
            second.story
              .publishedAtISO,
          ) -
            getTimestamp(
              first.story
                .publishedAtISO,
            ),
      )
      .slice(
        0,
        RECOMMENDATION_LIMIT,
      )
      .flatMap(
        ({ story }) =>
          toLibraryItem(
            story,
          ),
      );

  return {
    saved,
    history,
    recommendations,
  };
}

/*
 * O score prioriza país favorito, depois categoria
 * favorita, depois recência — então as mais recentes
 * de cada recorte favorito, mais as mais recentes em
 * geral, cobrem o topo do ranking sem ler a tabela
 * inteira.
 */
async function findRecommendationCandidates(
  request:
    ReaderLibraryRequest,
): Promise<NewsStory[]> {
  const groups =
    await Promise.all(
      [
        findStoredStories(
          {
            take:
              RECENT_CANDIDATES,
          },
        ),

        ...request.favoriteCountryCodes
          .slice(
            0,
            MAX_FAVORITE_GROUPS,
          )
          .map(
            (countryCode) =>
              findStoredStories(
                {
                  countryCode,

                  take:
                    CANDIDATES_PER_FAVORITE,
                },
              ),
          ),

        ...request.favoriteCategories.map(
          (category) =>
            findStoredStories(
              {
                category,

                take:
                  CANDIDATES_PER_FAVORITE,
              },
            ),
        ),
      ],
    );

  return [
    ...new Map(
      groups
        .flat()
        .map(
          (story) =>
            [
              story.id,
              story,
            ] as const,
        ),
    ).values(),
  ];
}

function toLibraryItem(
  story:
    NewsStory,
): ReaderLibraryStoryItem[] {
  const country =
    findCountryByCode(
      story.countryCode,
    );

  return [
    {
      story,

      country:
        country
          ? {
              code:
                country.code,

              name:
                country.name,

              slug:
                country.slug,
            }
          : null,

      sourceCount:
        getStorySourceCount(
          story,
        ),

      publishedAtLabel:
        formatRelativeTime(
          story.publishedAtISO,
        ),
    },
  ];
}

function getRecommendationScore(
  story:
    NewsStory,

  favoriteCategories:
    NewsCategory[],

  favoriteCountryCodes:
    CountryCode[],
): number {
  let score =
    0;

  if (
    favoriteCategories.includes(
      story.category,
    )
  ) {
    score +=
      10_000;
  }

  if (
    favoriteCountryCodes.includes(
      story.countryCode,
    )
  ) {
    score +=
      14_000;
  }

  score +=
    getStorySourceCount(
      story,
    ) *
    500;

  score +=
    story.articles.length *
    150;

  const timestamp =
    getTimestamp(
      story.publishedAtISO,
    );

  if (
    timestamp >
    0
  ) {
    const ageInHours =
      Math.max(
        0,
        (
          Date.now() -
          timestamp
        ) /
          MILLISECONDS_PER_HOUR,
      );

    score +=
      Math.max(
        0,
        336 -
          ageInHours,
      );
  }

  return score;
}

function getTimestamp(
  value:
    string | null,
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(
      value,
    ).getTime();

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp;
}
