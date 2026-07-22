import type {
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import type {
  RegionId,
} from "./geography.types";

export function filterCountriesByRegion(
  countries:
    CountryWithLatestNews[],

  region:
    RegionId,
): CountryWithLatestNews[] {
  const activeCountries =
    countries.filter(
      (country) =>
        country.active,
    );

  if (
    region ===
    "world"
  ) {
    return activeCountries;
  }

  return activeCountries.filter(
    (country) =>
      country.regions.includes(
        region,
      ),
  );
}