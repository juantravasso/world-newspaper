import type {
  NewsCategory,
} from "./news.types";

const newsPlaceholderByCategory:
  Record<NewsCategory, string> = {
    football:
      "/images/news/football.svg",

    politics:
      "/images/news/politics.svg",

    economy:
      "/images/news/economy.svg",
  };

export function getNewsImageUrl(
  category: NewsCategory,
  imageUrl?: string,
): string {
  return (
    imageUrl ??
    newsPlaceholderByCategory[
      category
    ]
  );
}
