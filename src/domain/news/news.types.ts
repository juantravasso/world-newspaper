import type {
  CountryRegionId,
} from "@/domain/geography";

export type NewsCategory =
  | "football"
  | "politics"
  | "economy";

export type CountryCode =
  // América
  | "AR"
  | "BR"
  | "CA"
  | "CO"
  | "MX"
  | "US"

  // Europa
  | "DE"
  | "ES"
  | "FR"
  | "GB"
  | "IT"
  | "PT"

  // África
  | "EG"
  | "KE"
  | "MA"
  | "NG"
  | "ZA"

  // Ásia
  | "CN"
  | "ID"
  | "IN"
  | "JP"
  | "KR"

  // Oceania
  | "AU"
  | "FJ"
  | "NZ"

  // Oriente Médio
  | "AE"
  | "IL"
  | "JO"
  | "QA"
  | "SA"
  | "TR";

export type CountryNewsCard = {
  id: string;
  title: string;
  excerpt: string;

  category: NewsCategory;
  categoryLabel: string;

  source: string;
  publishedAt: string;

  href: string;
  imageUrl?: string;
};

export type CountryWithLatestNews = {
  code: CountryCode;
  name: string;
  slug: string;

  /**
   * Pode ser mantida enquanto seus componentes
   * ainda utilizarem emojis.
   */
  flag: string;

  language: string;
  active: boolean;

  /**
   * Permite que um país apareça
   * em mais de uma região.
   */
  regions: CountryRegionId[];

  news: CountryNewsCard[];
};

export type MockNewsSource = {
  id: string;
  name: string;
  websiteUrl: string;
  rssUrl: string | null;
};