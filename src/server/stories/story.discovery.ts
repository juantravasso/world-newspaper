import "server-only";

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
  findCountriesMatchingText,
  findCountryByCode,
  findCountryBySlug,
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
  storyToCountryNewsCards,
} from "@/server/news/story-presentation";

import {
  findStoredStories,
} from "@/server/stories/story.persistence";

const DEFAULT_SEARCH_PAGE_SIZE =
  12;

const MAX_SEARCH_PAGE_SIZE =
  24;

const COUNTRY_PAGE_STORY_LIMIT =
  60;

const TRENDING_WINDOW_DAYS =
  7;

const MILLISECONDS_PER_HOUR =
  60 *
  60 *
  1_000;

const MILLISECONDS_PER_DAY =
  24 *
  MILLISECONDS_PER_HOUR;

export type StoryDiscoveryItem = {
  story:
    NewsStory;

  country:
    CountryCatalogItem;

  sourceCount:
    number;

  publishedAtLabel:
    string;
};

export type StorySearchResult = {
  query:
    string;

  page:
    number;

  pageSize:
    number;

  total:
    number;

  totalPages:
    number;

  items:
    StoryDiscoveryItem[];
};

export type CountryStoryPageData = {
  country:
    CountryWithLatestNews;

  totalStories:
    number;

  sourceCount:
    number;

  latestPublishedAtISO:
    string | null;
};

export async function searchStories(
  query:
    string,

  requestedPage:
    number = 1,

  requestedPageSize:
    number =
      DEFAULT_SEARCH_PAGE_SIZE,
): Promise<
  StorySearchResult
> {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    WORLD_NEWS_CACHE_TAG,
  );

  const normalizedQuery =
    normalizeSearchText(
      query,
    );

  const pageSize =
    clampInteger(
      requestedPageSize,
      1,
      MAX_SEARCH_PAGE_SIZE,
    );

  if (
    normalizedQuery.length <
    2
  ) {
    return {
      query:
        query.trim(),

      page:
        1,

      pageSize,

      total:
        0,

      totalPages:
        0,

      items:
        [],
    };
  }

  const matchingCountryCodes =
    new Set(
      findCountriesMatchingText(
        query,
      ).map(
        (country) =>
          country.code,
      ),
    );

  const storedStories =
    await findStoredStories();

  const matchingStories =
    storedStories.filter(
      (story) =>
        storyMatchesQuery(
          story,
          normalizedQuery,
          matchingCountryCodes,
        ),
    );

  const total =
    matchingStories.length;

  const totalPages =
    Math.ceil(
      total /
      pageSize,
    );

  const page =
    totalPages ===
    0
      ? 1
      : clampInteger(
          requestedPage,
          1,
          totalPages,
        );

  const offset =
    (
      page -
      1
    ) *
    pageSize;

  const items =
    matchingStories
      .slice(
        offset,
        offset +
          pageSize,
      )
      .flatMap(
        toStoryDiscoveryItem,
      );

  return {
    query:
      query.trim(),

    page,

    pageSize,

    total,

    totalPages,

    items,
  };
}

export async function getTrendingStories(
  requestedLimit:
    number = 6,
): Promise<
  StoryDiscoveryItem[]
> {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    WORLD_NEWS_CACHE_TAG,
  );

  const limit =
    clampInteger(
      requestedLimit,
      1,
      12,
    );

  const storedStories =
    await findStoredStories();

  const currentTime =
    Date.now();

  const recentCutoff =
    currentTime -
    TRENDING_WINDOW_DAYS *
      MILLISECONDS_PER_DAY;

  const recentStories =
    storedStories.filter(
      (story) =>
        getTimestamp(
          story.publishedAtISO,
        ) >=
        recentCutoff,
    );

  const candidates =
    recentStories.length >=
    limit
      ? recentStories
      : storedStories.slice(
          0,
          100,
        );

  return candidates
    .map(
      (story) => ({
        story,

        score:
          getTrendingScore(
            story,
            currentTime,
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
      limit,
    )
    .flatMap(
      ({ story }) =>
        toStoryDiscoveryItem(
          story,
        ),
    );
}

export async function getCountryStoryPage(
  countrySlug:
    string,

  category?:
    NewsCategory,
): Promise<
  CountryStoryPageData | null
> {
  "use cache";

  cacheLife(
    "minutes",
  );

  cacheTag(
    WORLD_NEWS_CACHE_TAG,
  );

  const countryMetadata =
    findCountryBySlug(
      countrySlug,
    );

  if (!countryMetadata) {
    return null;
  }

  const storedStories =
    await findStoredStories();

  const stories =
    storedStories
      .filter(
        (story) =>
          story.countryCode ===
            countryMetadata.code &&
          (
            !category ||
            story.category ===
              category
          ),
      )
      .slice(
        0,
        COUNTRY_PAGE_STORY_LIMIT,
      );

  const sourceIds =
    new Set(
      stories.flatMap(
        (story) =>
          story.articles.map(
            (article) =>
              article.sourceId,
          ),
      ),
    );

  return {
    country: {
      ...countryMetadata,

      active:
        true,

      news:
        stories.flatMap(
          storyToCountryNewsCards,
        ),

      stories,
    },

    totalStories:
      stories.length,

    sourceCount:
      sourceIds.size,

    latestPublishedAtISO:
      stories[0]
        ?.publishedAtISO ??
      null,
  };
}

function storyMatchesQuery(
  story:
    NewsStory,

  normalizedQuery:
    string,

  matchingCountryCodes:
    Set<
      NewsStory["countryCode"]
    >,
): boolean {
  if (
    matchingCountryCodes.has(
      story.countryCode,
    )
  ) {
    return true;
  }

  const searchableValues = [
    story.headline,
    story.summary,
    story.category,
    story.categoryLabel,

    ...story.articles.flatMap(
      (article) => [
        article.title,
        article.excerpt,
        article.sourceName,
        article.language,
      ],
    ),
  ];

  return searchableValues.some(
    (value) =>
      normalizeSearchText(
        value,
      ).includes(
        normalizedQuery,
      ),
  );
}

function toStoryDiscoveryItem(
  story:
    NewsStory,
): StoryDiscoveryItem[] {
  const country =
    findCountryByCode(
      story.countryCode,
    );

  if (!country) {
    return [];
  }

  return [
    {
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
    },
  ];
}

function getTrendingScore(
  story:
    NewsStory,

  currentTime:
    number,
): number {
  const publicationTimestamp =
    getTimestamp(
      story.publishedAtISO,
    );

  const ageInHours =
    publicationTimestamp >
    0
      ? Math.max(
          0,
          (
            currentTime -
            publicationTimestamp
          ) /
            MILLISECONDS_PER_HOUR,
        )
      : TRENDING_WINDOW_DAYS *
        24;

  const recencyBonus =
    Math.max(
      0,
      TRENDING_WINDOW_DAYS *
        24 -
        ageInHours,
    );

  return (
    getStorySourceCount(
      story,
    ) *
      1_000 +
    story.articles.length *
      100 +
    recencyBonus
  );
}

function normalizeSearchText(
  value:
    string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
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

function clampInteger(
  value:
    number,

  minimum:
    number,

  maximum:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      Math.trunc(
        value,
      ),
    ),
  );
}
