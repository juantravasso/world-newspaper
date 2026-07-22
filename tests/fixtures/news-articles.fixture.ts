import type {
  NewsArticle,
} from "@/domain/news/story.types";

const DEFAULT_PUBLICATION_DATE =
  "2026-07-21T12:00:00.000Z";

const baseArticle:
  NewsArticle = {
  id: "article-base",

  sourceId: "source-base",
  sourceName: "Fonte Base",

  title:
    "Senado aprova novo projeto tributário",

  excerpt:
    "O Senado aprovou um novo projeto tributário após votação.",

  url:
    "https://example.com/article-base",

  category: "politics",

  countryCode: "BR",
  language: "pt-BR",

  publishedAtISO:
    DEFAULT_PUBLICATION_DATE,
};

export function createNewsArticle(
  overrides:
    Partial<NewsArticle> = {},
): NewsArticle {
  return {
    ...baseArticle,
    ...overrides,
  };
}
