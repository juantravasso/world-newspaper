import americaSourcesJson from "@/data/news/america.sources.json";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import {
  buildCountriesFromCatalog,
} from "./build-region-countries";

import type {
  NewsSourcesCatalog,
} from "./news-source.types";

const americaSources =
  americaSourcesJson as
    NewsSourcesCatalog;

export function buildAmericaCountriesWithNews(
  category?: NewsCategory,
) {
  return buildCountriesFromCatalog(
    americaSources,
    {
      category,
      defaultRegions: [
        "america",
      ],
    },
  );
}
