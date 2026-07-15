import type {
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import type {
  ContinentId,
} from "./geography.types";

export function filterCountriesByContinent(
  countries: CountryWithLatestNews[],
  continent: ContinentId,
): CountryWithLatestNews[] {
  const activeCountries = countries.filter(
    (country) => country.active,
  );

  if (continent === "world") {
    return activeCountries;
  }

  return activeCountries.filter(
    (country) =>
      country.regions.includes(continent),
  );
}