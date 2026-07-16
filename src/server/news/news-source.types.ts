import type {
  CountryRegionId,
} from "@/domain/geography";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

export type NewsFeedConfig = {
  url: string;

  /**
   * Use quando o feed já representa
   * uma seção específica do veículo.
   */
  category?: NewsCategory;

  /**
   * Permite manter uma URL no catálogo
   * sem executá-la temporariamente.
   */
  enabled?: boolean;
};

export type NewsSourceConfig = {
  id: string;
  name: string;
  websiteUrl: string;
  feeds: NewsFeedConfig[];
};

export type CountryNewsSourceConfig = {
  code: CountryCode;
  name: string;
  slug: string;
  flag: string;
  language: string;

  /**
   * Opcional para preservar o catálogo
   * americano já existente.
   */
  regions?: CountryRegionId[];

  sources:
    NewsSourceConfig[];
};

export type NewsSourcesCatalog = {
  countries:
    CountryNewsSourceConfig[];
};

/**
 * Compatibilidade com imports antigos.
 */
export type AmericaSourcesCatalog =
  NewsSourcesCatalog;
