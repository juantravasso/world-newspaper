import africaSourcesJson from "@/data/news/africa.sources.json";
import americaSourcesJson from "@/data/news/america.sources.json";
import asiaSourcesJson from "@/data/news/asia.sources.json";
import europeSourcesJson from "@/data/news/europe.sources.json";
import middleEastSourcesJson from "@/data/news/middle-east.sources.json";
import oceaniaSourcesJson from "@/data/news/oceania.sources.json";

import type {
  CountryRegionId,
} from "@/domain/geography";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  buildCountriesFromCatalog,
} from "./build-region-countries";

import type {
  NewsSourcesCatalog,
} from "./news-source.types";

type CatalogEntry = {
  catalog:
    NewsSourcesCatalog;

  defaultRegions:
    CountryRegionId[];
};

const catalogEntries:
  CatalogEntry[] = [
    {
      catalog:
        americaSourcesJson as
          NewsSourcesCatalog,

      defaultRegions: [
        "america",
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

export async function buildWorldCountriesWithNews(
  category?: NewsCategory,
): Promise<
  CountryWithLatestNews[]
> {
  const catalogResults =
    await Promise.all(
      catalogEntries.map(
        ({
          catalog,
          defaultRegions,
        }) =>
          buildCountriesFromCatalog(
            catalog,
            {
              category,
              defaultRegions,
            },
          ),
      ),
    );

  return mergeCountries(
    catalogResults.flat(),
  );
}

function mergeCountries(
  countries:
    CountryWithLatestNews[],
): CountryWithLatestNews[] {
  const byCode =
    new Map<
      string,
      CountryWithLatestNews
    >();

  for (const country of countries) {
    const existing =
      byCode.get(
        country.code,
      );

    if (!existing) {
      byCode.set(
        country.code,
        country,
      );

      continue;
    }

    byCode.set(
      country.code,
      {
        ...existing,

        regions:
          [
            ...new Set([
              ...existing.regions,
              ...country.regions,
            ]),
          ],

        news:
          [
            ...existing.news,
            ...country.news,
          ],
      },
    );
  }

  return [
    ...byCode.values(),
  ];
}
