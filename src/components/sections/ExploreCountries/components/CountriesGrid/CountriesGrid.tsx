import {
  Box,
} from "@/components/Box";

import type {
  CountryCode,
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import {
  CountryCard,
} from "../CountryCard";

export type CountriesGridProps = {
  countries: CountryWithLatestNews[];

  selectedCountryCode:
    | CountryCode
    | undefined;

  onCountrySelect: (
    countryCode: CountryCode,
  ) => void;
};

export function CountriesGrid({
  countries,
  selectedCountryCode,
  onCountrySelect,
}: CountriesGridProps) {
  return (
    <Box
      as="ul"
      aria-label="Países disponíveis"
      className="
        mt-5 grid
        grid-cols-2 gap-3
        md:grid-cols-3
        lg:grid-cols-6
      "
    >
      {countries.map((country) => (
        <CountryCard
          key={country.code}
          country={country}
          isSelected={
            country.code ===
            selectedCountryCode
          }
          onSelect={
            onCountrySelect
          }
        />
      ))}
    </Box>
  );
}