import africaSourcesJson from "@/data/news/africa.sources.json";
import asiaSourcesJson from "@/data/news/asia.sources.json";
import centralAmericaSourcesJson from "@/data/news/central-america.sources.json";
import europeSourcesJson from "@/data/news/europe.sources.json";
import middleEastSourcesJson from "@/data/news/middle-east.sources.json";
import northAmericaSourcesJson from "@/data/news/north-america.sources.json";
import oceaniaSourcesJson from "@/data/news/oceania.sources.json";
import southAmericaSourcesJson from "@/data/news/south-america.sources.json";

import {
  cacheLife,
  cacheTag,
} from "next/cache";

import type {
  CountryRegionId,
} from "@/domain/geography";

import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findStoredStories,
} from "@/server/stories/story.persistence";

import type {
  CountryNewsSourceConfig,
  NewsSourcesCatalog,
} from "./news-source.types";

const MAX_STORIES_PER_COUNTRY =
  18;

type CatalogEntry = {
  catalog:
    NewsSourcesCatalog;

  defaultRegions:
    CountryRegionId[];
};

type CountryMetadata = {
  code:
    CountryNewsSourceConfig["code"];

  name:
    string;

  slug:
    string;

  flag:
    string;

  language:
    string;

  regions:
    CountryRegionId[];
};

const catalogEntries:
  CatalogEntry[] = [
  {
    catalog:
      northAmericaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "north-america",
    ],
  },

  {
    catalog:
      centralAmericaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "central-america",
    ],
  },

  {
    catalog:
      southAmericaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "south-america",
    ],
  },

  {
    catalog:
      europeSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "europe",
    ],
  },

  {
    catalog:
      africaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "africa",
    ],
  },

  {
    catalog:
      asiaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "asia",
    ],
  },

  {
    catalog:
      oceaniaSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "oceania",
    ],
  },

  {
    catalog:
      middleEastSourcesJson as
        NewsSourcesCatalog,

    defaultRegions: [
      "oriente-medio",
    ],
  },
];

export async function buildWorldCountriesFromStorage(
  category?:
    NewsCategory,
): Promise<
  CountryWithLatestNews[]
> {
  "use cache";

  cacheLife("minutes");
  cacheTag(
    "world-news",
  );

  const storedStories =
    await findStoredStories();

  const countryMetadata =
    buildCountryMetadata();

  const storiesByCountry =
    groupStoriesByCountry(
      storedStories,
      category,
    );

  return [
    ...countryMetadata.values(),
  ].map(
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

      const news =
        stories.flatMap(
            storyToCountryNewsCards,
        );

      return {
        code:
          country.code,

        name:
          country.name,

        slug:
          country.slug,

        flag:
          country.flag,

        language:
          country.language,

        active:
          true,

        regions:
          country.regions,

        news,
        stories,
      };
    },
  );
}

/**
 * Lê os catálogos JSON apenas para obter
 * metadados dos países.
 *
 * Nenhum RSS é consultado aqui.
 */
function buildCountryMetadata():
  Map<
    CountryNewsSourceConfig["code"],
    CountryMetadata
  > {
  const countries =
    new Map<
      CountryNewsSourceConfig["code"],
      CountryMetadata
    >();

  for (
    const {
      catalog,
      defaultRegions,
    } of catalogEntries
  ) {
    for (
      const country of
      catalog.countries
    ) {
      const regions =
        country.regions ??
        defaultRegions;

      const existingCountry =
        countries.get(
          country.code,
        );

      if (!existingCountry) {
        countries.set(
          country.code,
          {
            code:
              country.code,

            name:
              country.name,

            slug:
              country.slug,

            flag:
              country.flag,

            language:
              country.language,

            regions: [
              ...new Set(
                regions,
              ),
            ],
          },
        );

        continue;
      }

      countries.set(
        country.code,
        {
          ...existingCountry,

          regions: [
            ...new Set([
              ...existingCountry.regions,
              ...regions,
            ]),
          ],
        },
      );
    }
  }

  return countries;
}

function groupStoriesByCountry(
  stories:
    NewsStory[],

  category:
    NewsCategory | undefined,
): Map<
  CountryNewsSourceConfig["code"],
  NewsStory[]
> {
  const storiesByCountry =
    new Map<
      CountryNewsSourceConfig["code"],
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

/**
 * Cria o formato antigo de card a partir
 * de uma story armazenada.
 *
 * Isso mantém compatibilidade com os
 * componentes que ainda usam country.news.
 */
function storyToCountryNewsCards(
  story:
    NewsStory,
): CountryNewsCard[] {
  const primaryArticle =
    story.articles[0];

  if (!primaryArticle) {
    return [];
  }

  return [
    {
      id:
        primaryArticle.id,

      title:
        story.headline,

      excerpt:
        story.summary,

      category:
        story.category,

      categoryLabel:
        story.categoryLabel,

      sourceId:
        primaryArticle.sourceId,

      source:
        createSourceLabel(
          story,
        ),

      publishedAt:
        formatRelativeTime(
          story.publishedAtISO ??
          primaryArticle.publishedAtISO,
        ),

      publishedAtISO:
        story.publishedAtISO ??
        primaryArticle.publishedAtISO,

      href:
        primaryArticle.url,

      imageUrl:
        story.imageUrl ??
        primaryArticle.imageUrl,
    },
  ];
}

function createSourceLabel(
  story:
    NewsStory,
): string {
  const sourceNames = [
    ...new Set(
      story.articles
        .map(
          (article) =>
            article.sourceName,
        )
        .filter(Boolean),
    ),
  ];

  if (
    sourceNames.length ===
    0
  ) {
    return "Fonte não informada";
  }

  if (
    sourceNames.length ===
    1
  ) {
    return sourceNames[0];
  }

  return [
    sourceNames[0],
    `+${sourceNames.length - 1}`,
  ].join(" ");
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

function formatRelativeTime(
  value:
    string | null,
): string {
  if (!value) {
    return "data não informada";
  }

  const publicationDate =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      publicationDate.getTime(),
    )
  ) {
    return "data não informada";
  }

  const difference =
    Date.now() -
    publicationDate.getTime();

  if (
    difference <=
    0
  ) {
    return "agora";
  }

  const minutes =
    Math.max(
      1,
      Math.floor(
        difference /
        60_000,
      ),
    );

  if (
    minutes <
    60
  ) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
      60,
    );

  if (
    hours <
    24
  ) {
    return `há ${hours} h`;
  }

  const days =
    Math.floor(
      hours /
      24,
    );

  return `há ${days} d`;
}