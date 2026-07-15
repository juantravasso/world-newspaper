import type {
  NewsCategory,
} from "@/domain/news/news.types";

export const categoryLabels:
  Record<NewsCategory, string> = {
    football: "Futebol",
    politics: "Política",
    economy: "Economia",
  };

export const categoryRouteSegments:
  Record<NewsCategory, string> = {
    football: "futebol",
    politics: "politica",
    economy: "economia",
  };

export function getCategoryStyles(
  category: NewsCategory,
): string {
  const styles:
    Record<NewsCategory, string> = {
      football:
        "bg-football-soft text-football-foreground",

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
      football:
        "bg-gradient-to-br from-brand-emphasis via-brand to-success",

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
      football: "⚽",
      politics: "🏛️",
      economy: "📈",
    };

  return symbols[category];
}
