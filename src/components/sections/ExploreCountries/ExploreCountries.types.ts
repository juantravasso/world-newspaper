import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

export type ExploreCountriesProps = {
  countries: CountryWithLatestNews[];

  category?: NewsCategory;

  title?: string;

  /**
   * Exibe o link para /paises.
   *
   * @default true
   */
  showViewAll?: boolean;
};