import "server-only";

import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  CountryCode,
} from "@/domain/news/news.types";

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
  prisma,
} from "@/server/database/prisma";

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

export type StoryInternationalCoverageItem = {
  storyId:
    string;

  countryCode:
    string;

  countryName:
    string;

  countryFlag:
    string;

  headline:
    string;

  summary:
    string;

  language:
    string;

  translated:
    boolean;

  sourceName:
    string | null;

  sourceUrl:
    string | null;

  publishedAtLabel:
    string;
};

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

  internationalCoverage:
    StoryInternationalCoverageItem[];

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

  const internationalCoverage =
    await getInternationalCoverage(
      story.id,
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
    internationalCoverage,

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

/**
 * Busca direta e indexada em
 * StoryInternationalLink — de propósito, não
 * usa findStoredStories() (que traz a tabela
 * inteira). Cada story linkada é resolvida
 * junto com uma matéria representante e a
 * tradução em português, se já existir.
 */
async function getInternationalCoverage(
  storyId:
    string,
): Promise<
  StoryInternationalCoverageItem[]
> {
  const links =
    await prisma.storyInternationalLink.findMany(
      {
        where: {
          storyId,
        },

        orderBy: {
          similarity:
            "desc",
        },

        select: {
          relatedStoryId:
            true,
        },
      },
    );

  if (
    links.length ===
    0
  ) {
    return [];
  }

  const relatedStoryIds =
    links.map(
      (link) =>
        link.relatedStoryId,
    );

  const [
    relatedStories,
    representativeArticles,
    translations,
  ] =
    await Promise.all(
      [
        prisma.story.findMany(
          {
            where: {
              id: {
                in:
                  relatedStoryIds,
              },
            },

            select: {
              id:
                true,

              headline:
                true,

              summary:
                true,

              countryCode:
                true,

              publishedAt:
                true,
            },
          },
        ),

        prisma.article.findMany(
          {
            where: {
              storyId: {
                in:
                  relatedStoryIds,
              },
            },

            orderBy: [
              {
                publishedAt:
                  "desc",
              },
              {
                id:
                  "asc",
              },
            ],

            select: {
              storyId:
                true,

              sourceName:
                true,

              url:
                true,

              language:
                true,
            },
          },
        ),

        prisma.storyTranslation.findMany(
          {
            where: {
              storyId: {
                in:
                  relatedStoryIds,
              },

              language:
                "pt",
            },

            select: {
              storyId:
                true,

              headline:
                true,

              summary:
                true,
            },
          },
        ),
      ],
    );

  const storyById =
    new Map(
      relatedStories.map(
        (story) =>
          [
            story.id,
            story,
          ] as const,
      ),
    );

  const articleByStoryId =
    new Map<
      string,
      {
        sourceName:
          string;

        url:
          string;

        language:
          string;
      }
    >();

  for (
    const article of
    representativeArticles
  ) {
    if (
      !articleByStoryId.has(
        article.storyId,
      )
    ) {
      articleByStoryId.set(
        article.storyId,
        article,
      );
    }
  }

  const translationByStoryId =
    new Map(
      translations.map(
        (translation) =>
          [
            translation.storyId,
            translation,
          ] as const,
      ),
    );

  return links.flatMap(
    (link) => {
      const relatedStory =
        storyById.get(
          link.relatedStoryId,
        );

      const country =
        relatedStory &&
        findCountryByCode(
          relatedStory.countryCode as
            CountryCode,
        );

      if (
        !relatedStory ||
        !country
      ) {
        return [];
      }

      const article =
        articleByStoryId.get(
          relatedStory.id,
        ) ??
        null;

      const translation =
        translationByStoryId.get(
          relatedStory.id,
        ) ??
        null;

      return [
        {
          storyId:
            relatedStory.id,

          countryCode:
            country.code,

          countryName:
            country.name,

          countryFlag:
            country.flag,

          headline:
            translation?.headline ??
            relatedStory.headline,

          summary:
            translation?.summary ??
            relatedStory.summary,

          language:
            article?.language ??
            country.language,

          translated:
            Boolean(
              translation,
            ),

          sourceName:
            article?.sourceName ??
            null,

          sourceUrl:
            article?.url ??
            null,

          publishedAtLabel:
            formatRelativeTime(
              relatedStory.publishedAt
                ?.toISOString() ??
                null,
            ),
        },
      ];
    },
  );
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
