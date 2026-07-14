import type { NewsWithCountry } from "@/domain/news/news.helpers";

export type HeroProps = {
  title: string;
  description: string;

  featuredNews: NewsWithCountry;
  secondaryNews: NewsWithCountry[];

  regionLabel?: string;
};