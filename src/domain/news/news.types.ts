export type NewsCategory = "football" | "politics" | "economy";

export type CountryCode =
  | "AR"
  | "BO"
  | "BR"
  | "CL"
  | "CO"
  | "EC"
  | "GY"
  | "PY"
  | "PE"
  | "SR"
  | "UY"
  | "VE";

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
  flag: string;
  language: string;
  active: boolean;
  news: CountryNewsCard[];
};

export type MockNewsSource = {
  id: string;
  name: string;
  websiteUrl: string;
  rssUrl: string | null;
};
