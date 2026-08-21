import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

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

  const countries =
    listCountryCatalog();

  const storiesByCountry =
    await Promise.all(
      countries.map(
        (country) =>
          findStoredStories({
            countryCode:
              country.code,

            category,

            take:
              MAX_STORIES_PER_COUNTRY,
          }),
      ),
    );

  return countries.map(
    (country, index) => {
      const stories =
        storiesByCountry[
          index
        ];

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
