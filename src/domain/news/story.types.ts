import type {
  CountryCode,
  NewsCategory,
} from "./news.types";

export type NewsArticle = {
  id: string;

  sourceId: string;
  sourceName: string;

  title: string;
  excerpt: string;

  url: string;
  imageUrl?: string;

  category: NewsCategory;

  countryCode: CountryCode;
  language: string;

  publishedAtISO: string | null;
};

export type NewsStory = {
  id: string;

  headline: string;
  summary: string;

  category: NewsCategory;
  categoryLabel: string;

  countryCode: CountryCode;

  imageUrl?: string;
  publishedAtISO: string | null;

  articles: NewsArticle[];
};