export type NewsCategory =
  | "football"
  | "politics"
  | "economy";

export type CountryNews = {
  id: string;
  title: string;
  category: NewsCategory;
  categoryLabel: string;
  source: string;
  publishedAt: string;
  href: string;
  imageUrl?: string;
};

export type Country = {
  code: string;
  name: string;
  slug: string;
  flag: string;
  news: CountryNews[];
};