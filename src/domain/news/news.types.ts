import type {
  CountryRegionId,
} from "@/domain/geography";
import type {
  NewsStory,
} from "./story.types";

export type NewsCategory =
  | "football"
  | "politics"
  | "economy";

export type CountryCode =
  // América
  | "AR"
  | "BO"
  | "BR"
  | "BZ"
  | "CA"
  | "CL"
  | "CO"
  | "CR"
  | "EC"
  | "GT"
  | "GY"
  | "HN"
  | "MX"
  | "NI"
  | "PA"
  | "PE"
  | "PY"
  | "SR"
  | "SV"
  | "US"
  | "UY"
  | "VE"

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

  sourceId: string;
  source: string;

  publishedAt: string;
  publishedAtISO: string | null;

  href: string;
  imageUrl?: string;
};

export type CountryWithLatestNews = {
  code: CountryCode;
  name: string;
  slug: string;

  flag: string;
  language: string;
  active: boolean;

  regions:
    CountryRegionId[];

  news:
    CountryNewsCard[];

  stories:
    NewsStory[];
};

export type MockNewsSource = {
  id: string;
  name: string;
  websiteUrl: string;
  rssUrl: string | null;
};
