import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  storyToCountryNewsCards,
} from "@/server/news/story-presentation";

import {
  findStoredStories,
} from "@/server/stories/story.persistence";

const MAX_STORIES_PER_COUNTRY =
  18;

export async function buildWorldCountriesFromStorage(
  category?:
    NewsCategory,
): Promise<
  CountryWithLatestNews[]
> {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    WORLD_NEWS_CACHE_TAG,
  );

  const storedStories =
    await findStoredStories();

  const storiesByCountry =
    groupStoriesByCountry(
      storedStories,
      category,
    );

  return listCountryCatalog().map(
    (country) => {
      const stories =
        (
          storiesByCountry.get(
            country.code,
          ) ??
          []
        )
          .sort(
            compareStoriesByDateDescending,
          )
          .slice(
            0,
            MAX_STORIES_PER_COUNTRY,
          );

      return {
        ...country,

        active:
          true,

        news:
          stories.flatMap(
            storyToCountryNewsCards,
          ),

        stories,
      };
    },
  );
}

function groupStoriesByCountry(
  stories:
    NewsStory[],

  category:
    NewsCategory | undefined,
): Map<
  NewsStory["countryCode"],
  NewsStory[]
> {
  const storiesByCountry =
    new Map<
      NewsStory["countryCode"],
      NewsStory[]
    >();

  for (
    const story of
    stories
  ) {
    if (
      category &&
      story.category !==
        category
    ) {
      continue;
    }

    const countryStories =
      storiesByCountry.get(
        story.countryCode,
      ) ??
      [];

    countryStories.push(
      story,
    );

    storiesByCountry.set(
      story.countryCode,
      countryStories,
    );
  }

  return storiesByCountry;
}

function compareStoriesByDateDescending(
  first:
    NewsStory,

  second:
    NewsStory,
): number {
  return (
    getTimestamp(
      second.publishedAtISO,
    ) -
    getTimestamp(
      first.publishedAtISO,
    )
  );
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
