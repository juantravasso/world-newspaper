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
} from "@/server/stories/story.persistence";

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
  const stories =
    await findStoredStories();

  const storiesById =
    new Map(
      stories.map(
        (story) => [
          story.id,
          story,
        ],
      ),
    );

  const saved =
    request.savedStoryIds
      .flatMap(
        (storyId) => {
          const story =
            storiesById.get(
              storyId,
            );

          return story
            ? toLibraryItem(
                story,
              )
            : [];
        },
      );

  const history =
    request.historyStoryIds
      .flatMap(
        (storyId) => {
          const story =
            storiesById.get(
              storyId,
            );

          return story
            ? toLibraryItem(
                story,
              )
            : [];
        },
      );

  const excludedStoryIds =
    new Set([
      ...request.savedStoryIds,
      ...request.historyStoryIds,
    ]);

  const recommendations =
    stories
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
