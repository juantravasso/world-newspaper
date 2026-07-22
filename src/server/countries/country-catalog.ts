import africaSourcesJson from "@/data/news/africa.sources.json";
import asiaSourcesJson from "@/data/news/asia.sources.json";
import centralAmericaSourcesJson from "@/data/news/central-america.sources.json";
import europeSourcesJson from "@/data/news/europe.sources.json";
import middleEastSourcesJson from "@/data/news/middle-east.sources.json";
import northAmericaSourcesJson from "@/data/news/north-america.sources.json";
import oceaniaSourcesJson from "@/data/news/oceania.sources.json";
import southAmericaSourcesJson from "@/data/news/south-america.sources.json";

import type {
  CountryRegionId,
} from "@/domain/geography";

import type {
  CountryCode,
} from "@/domain/news/news.types";

import type {
  NewsSourcesCatalog,
} from "@/server/news/news-source.types";

export type CountryCatalogItem = {
  code: CountryCode;
  name: string;
  slug: string;
  flag: string;
  language: string;
  regions: CountryRegionId[];
};

type CatalogEntry = {
  catalog: NewsSourcesCatalog;
  defaultRegions: CountryRegionId[];
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

const countryCatalog =
  buildCountryCatalog();

export function listCountryCatalog():
  CountryCatalogItem[] {
  return countryCatalog;
}

export function findCountryBySlug(
  value:
    string,
): CountryCatalogItem | null {
  const normalizedValue =
    normalizeSearchText(
      value,
    );

  return (
    countryCatalog.find(
      (country) =>
        normalizeSearchText(
          country.slug,
        ) ===
        normalizedValue,
    ) ??
    null
  );
}

export function findCountryByCode(
  code:
    CountryCode,
): CountryCatalogItem | null {
  return (
    countryCatalog.find(
      (country) =>
        country.code ===
        code,
    ) ??
    null
  );
}

export function findCountriesMatchingText(
  value:
    string,
): CountryCatalogItem[] {
  const normalizedValue =
    normalizeSearchText(
      value,
    );

  if (!normalizedValue) {
    return [];
  }

  return countryCatalog.filter(
    (country) => {
      const searchableValue = [
        country.name,
        country.slug,
        country.code,
      ]
        .map(
          normalizeSearchText,
        )
        .join(" ");

      return searchableValue.includes(
        normalizedValue,
      );
    },
  );
}

function buildCountryCatalog():
  CountryCatalogItem[] {
  const countries =
    new Map<
      CountryCode,
      CountryCatalogItem
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

  return [
    ...countries.values(),
  ].sort(
    (
      first,
      second,
    ) =>
      first.name.localeCompare(
        second.name,
        "pt-BR",
      ),
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
