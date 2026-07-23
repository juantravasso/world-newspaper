import "server-only";

import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findCountryByCode,
} from "@/server/countries/country-catalog";

import type {
  CountryCatalogItem,
} from "@/server/countries/country-catalog";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  formatRelativeTime,
  getStorySourceCount,
} from "@/server/news/story-presentation";

import {
  findStoredStories,
} from "@/server/stories/story.persistence";

const RELATED_STORIES_LIMIT =
  6;

export type StoryReaderRelatedItem = {
  story:
    NewsStory;

  country:
    CountryCatalogItem;

  sourceCount:
    number;

  publishedAtLabel:
    string;
};

export type StoryReaderNavigationItem = {
  id:
    string;

  headline:
    string;

  categoryLabel:
    string;

  country:
    CountryCatalogItem | null;
};

export type StoryReaderData = {
  story:
    NewsStory;

  country:
    CountryCatalogItem | null;

  sourceCount:
    number;

  publishedAtLabel:
    string;

  relatedStories:
    StoryReaderRelatedItem[];

  newerStory:
    StoryReaderNavigationItem | null;

  olderStory:
    StoryReaderNavigationItem | null;
};

export async function getStoryReaderData(
  storyId:
    string,
): Promise<
  StoryReaderData | null
> {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    WORLD_NEWS_CACHE_TAG,
  );

  const stories =
    await findStoredStories();

  const currentIndex =
    stories.findIndex(
      (story) =>
        story.id ===
        storyId,
    );

  if (
    currentIndex <
    0
  ) {
    return null;
  }

  const story =
    stories[
      currentIndex
    ];

  const country =
    findCountryByCode(
      story.countryCode,
    );

  const relatedStories =
    stories
      .filter(
        (candidate) =>
          candidate.id !==
          story.id,
      )
      .map(
        (candidate) => ({
          story:
            candidate,

          score:
            getRelatedStoryScore(
              story,
              candidate,
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
        RELATED_STORIES_LIMIT,
      )
      .flatMap(
        ({ story:
          relatedStory,
        }) => {
          const relatedCountry =
            findCountryByCode(
              relatedStory
                .countryCode,
            );

          if (
            !relatedCountry
          ) {
            return [];
          }

          return [
            {
              story:
                relatedStory,

              country:
                relatedCountry,

              sourceCount:
                getStorySourceCount(
                  relatedStory,
                ),

              publishedAtLabel:
                formatRelativeTime(
                  relatedStory
                    .publishedAtISO,
                ),
            },
          ];
        },
      );

  return {
    story,
    country,

    sourceCount:
      getStorySourceCount(
        story,
      ),

    publishedAtLabel:
      formatRelativeTime(
        story.publishedAtISO,
      ),

    relatedStories,

    newerStory:
      toNavigationItem(
        stories[
          currentIndex -
            1
        ],
      ),

    olderStory:
      toNavigationItem(
        stories[
          currentIndex +
            1
        ],
      ),
  };
}

function getRelatedStoryScore(
  currentStory:
    NewsStory,

  candidate:
    NewsStory,
): number {
  let score =
    0;

  if (
    candidate.countryCode ===
    currentStory.countryCode
  ) {
    score +=
      10_000;
  }

  if (
    candidate.category ===
    currentStory.category
  ) {
    score +=
      6_000;
  }

  score +=
    getStorySourceCount(
      candidate,
    ) *
    300;

  score +=
    candidate.articles.length *
    100;

  const ageInHours =
    Math.max(
      0,
      (
        Date.now() -
        getTimestamp(
          candidate
            .publishedAtISO,
        )
      ) /
        (
          60 *
          60 *
          1_000
        ),
    );

  score +=
    Math.max(
      0,
      168 -
        ageInHours,
    );

  return score;
}

function toNavigationItem(
  story:
    NewsStory | undefined,
): StoryReaderNavigationItem | null {
  if (!story) {
    return null;
  }

  return {
    id:
      story.id,

    headline:
      story.headline,

    categoryLabel:
      story.categoryLabel,

    country:
      findCountryByCode(
        story.countryCode,
      ),
  };
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
