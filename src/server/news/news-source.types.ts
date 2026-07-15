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
  sources: NewsSourceConfig[];
};

export type AmericaSourcesCatalog = {
  countries:
    CountryNewsSourceConfig[];
};
