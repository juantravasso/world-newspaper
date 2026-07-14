import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "./news.types";

export type NewsWithCountry = CountryNewsCard & {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  countrySlug: string;
};

export function getNewsFromCountries(
  countries: CountryWithLatestNews[],
  category?: NewsCategory,
): NewsWithCountry[] {
  return countries
    .flatMap((country) =>
      country.news.map((news) => ({
        ...news,
        countryCode: country.code,
        countryName: country.name,
        countryFlag: country.flag,
        countrySlug: country.slug,
      })),
    )
    .filter((news) => {
      if (!category) {
        return true;
      }

      return news.category === category;
    });
}