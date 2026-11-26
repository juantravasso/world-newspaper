import type {
  NewsCategory,
} from "@/domain/news/news.types";

export const categoryLabels:
  Record<NewsCategory, string> = {
    politics: "Política",
    economy: "Economia",
  };

export const categoryRouteSegments:
  Record<NewsCategory, string> = {
    politics: "politica",
    economy: "economia",
  };

export function getCategoryStyles(
  category: NewsCategory,
): string {
  const styles:
    Record<NewsCategory, string> = {
      politics:
        "bg-politics-soft text-politics-foreground",

      economy:
        "bg-economy-soft text-economy-foreground",
    };

  return styles[category];
}

export function getNewsFallbackStyles(
  category: NewsCategory,
): string {
  const styles:
    Record<NewsCategory, string> = {
      politics:
        "bg-gradient-to-br from-info-soft via-[#b7ccff] to-[#8fb2ff]",

      economy:
        "bg-gradient-to-br from-brand via-brand-emphasis to-[#081329]",
    };

  return styles[category];
}

export function getCategorySymbol(
  category: NewsCategory,
): string {
  const symbols:
    Record<NewsCategory, string> = {
      politics: "🏛️",
      economy: "📈",
    };

  return symbols[category];
}
