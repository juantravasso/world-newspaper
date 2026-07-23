import "server-only";

import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findCountryByCode,
  listCountryCatalog,
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

const TIMELINE_PAGE_SIZE =
  12;

const MILLISECONDS_PER_DAY =
  24 *
  60 *
  60 *
  1_000;

export type StoryTimelinePeriod =
  | "24h"
  | "7d"
  | "30d"
  | "all";

export type StoryTimelineFilters = {
  category?:
    NewsCategory;

  countryCode?:
    CountryCode;

  period:
    StoryTimelinePeriod;

  page:
    number;
};

export type StoryTimelineItem = {
  story:
    NewsStory;

  country:
    CountryCatalogItem;

  sourceCount:
    number;

  publishedAtLabel:
    string;
};

export type StoryTimelineResult = {
  filters:
    StoryTimelineFilters;

  items:
    StoryTimelineItem[];

  total:
    number;

  totalPages:
    number;

  page:
    number;

  pageSize:
    number;

  activeCountries:
    CountryCatalogItem[];
};

export async function getStoryTimeline(
  filters:
    StoryTimelineFilters,
): Promise<
  StoryTimelineResult
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

  const activeCountryCodes =
    new Set(
      storedStories.map(
        (story) =>
          story.countryCode,
      ),
    );

  const activeCountries =
    listCountryCatalog()
      .filter(
        (country) =>
          activeCountryCodes.has(
            country.code,
          ),
      );

  const cutoff =
    getPeriodCutoff(
      filters.period,
    );

  const filteredStories =
    storedStories.filter(
      (story) => {
        if (
          filters.category &&
          story.category !==
            filters.category
        ) {
          return false;
        }

        if (
          filters.countryCode &&
          story.countryCode !==
            filters.countryCode
        ) {
          return false;
        }

        if (
          cutoff &&
          getTimestamp(
            story.publishedAtISO,
          ) <
            cutoff.getTime()
        ) {
          return false;
        }

        return true;
      },
    );

  const total =
    filteredStories.length;

  const totalPages =
    Math.ceil(
      total /
      TIMELINE_PAGE_SIZE,
    );

  const page =
    totalPages ===
    0
      ? 1
      : clampInteger(
          filters.page,
          1,
          totalPages,
        );

  const start =
    (
      page -
      1
    ) *
    TIMELINE_PAGE_SIZE;

  const items =
    filteredStories
      .slice(
        start,
        start +
          TIMELINE_PAGE_SIZE,
      )
      .flatMap(
        toTimelineItem,
      );

  return {
    filters: {
      ...filters,
      page,
    },

    items,

    total,

    totalPages,

    page,

    pageSize:
      TIMELINE_PAGE_SIZE,

    activeCountries,
  };
}

function toTimelineItem(
  story:
    NewsStory,
): StoryTimelineItem[] {
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

function getPeriodCutoff(
  period:
    StoryTimelinePeriod,
): Date | null {
  const daysByPeriod:
    Partial<
      Record<
        StoryTimelinePeriod,
        number
      >
    > = {
    "24h":
      1,

    "7d":
      7,

    "30d":
      30,
  };

  const days =
    daysByPeriod[
      period
    ];

  if (!days) {
    return null;
  }

  return new Date(
    Date.now() -
    days *
      MILLISECONDS_PER_DAY,
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
