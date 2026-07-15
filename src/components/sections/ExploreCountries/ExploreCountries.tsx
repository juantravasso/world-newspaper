"use client";

import Link from "next/link";

import {
  Box, Text,
} from "@/components";

import {
  CountriesGrid,
  CountryLatestNews,
  ExploreCountriesHeader,
} from "./components";

import {
  useCountriesCarousel,
} from "./hooks/useCountriesCarousel";

import type {
  ExploreCountriesProps,
} from "./ExploreCountries.types";

export function ExploreCountries({
  countries,
  category,
  title = "Explore por país",
  showViewAll = true,
}: ExploreCountriesProps) {
  const {
    currentPage,
    totalPages,

    selectedCountryCode,
    selectedCountry,
    visibleCountries,

    canNavigate,

    goToPreviousPage,
    goToNextPage,
    selectCountry,
  } = useCountriesCarousel({
    countries,
  });

  if (
    countries.length === 0 ||
    !selectedCountry
  ) {
    return null;
  }

  return (
    <Box
      as="section"
      aria-labelledby="explore-countries-title"
      className="mt-14 w-full"
    >
      <ExploreCountriesHeader
        title={title}
        currentPage={currentPage}
        totalPages={totalPages}
        canNavigate={canNavigate}
        showViewAll={showViewAll}
        onPrevious={
          goToPreviousPage
        }
        onNext={
          goToNextPage
        }
      />

      <CountriesGrid
        countries={visibleCountries}
        selectedCountryCode={
          selectedCountryCode
        }
        onCountrySelect={
          selectCountry
        }
      />

      {showViewAll && (
        <Link
          href="/paises"
          className="
            mt-4 block w-fit
            transition-opacity
            hover:opacity-70
            sm:hidden
          "
        >
          <Text
            as="span"
            preset="button"
            tone="accent"
          >
            Ver todos os países
          </Text>
        </Link>
      )}

      <CountryLatestNews
        country={selectedCountry}
        category={category}
      />
    </Box>
  );
}