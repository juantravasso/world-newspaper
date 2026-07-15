"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  CountryCode,
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import {
  COUNTRIES_PER_PAGE,
} from "../ExploreCountries.constants";

type UseCountriesCarouselProps = {
  countries: CountryWithLatestNews[];
};

export function useCountriesCarousel({
  countries,
}: UseCountriesCarouselProps) {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    selectedCountryCode,
    setSelectedCountryCode,
  ] = useState<CountryCode | undefined>(
    countries[0]?.code,
  );

  const totalPages = Math.ceil(
    countries.length /
      COUNTRIES_PER_PAGE,
  );

  /*
   * Evita uma página inválida caso a lista
   * de países mude sem o componente ser recriado.
   */
  const safeCurrentPage =
    totalPages > 0
      ? Math.min(
          currentPage,
          totalPages - 1,
        )
      : 0;

  const visibleCountries = useMemo(() => {
    const startIndex =
      safeCurrentPage *
      COUNTRIES_PER_PAGE;

    const endIndex =
      startIndex +
      COUNTRIES_PER_PAGE;

    return countries.slice(
      startIndex,
      endIndex,
    );
  }, [
    countries,
    safeCurrentPage,
  ]);

  const selectedCountry =
    countries.find(
      (country) =>
        country.code ===
        selectedCountryCode,
    ) ??
    visibleCountries[0] ??
    countries[0];

  function goToPage(
    nextPage: number,
  ): void {
    if (totalPages <= 1) {
      return;
    }

    const normalizedPage =
      (
        nextPage +
        totalPages
      ) % totalPages;

    setCurrentPage(
      normalizedPage,
    );

    const firstCountryOnPage =
      countries[
        normalizedPage *
          COUNTRIES_PER_PAGE
      ];

    setSelectedCountryCode(
      firstCountryOnPage?.code,
    );
  }

  function goToPreviousPage(): void {
    goToPage(
      safeCurrentPage - 1,
    );
  }

  function goToNextPage(): void {
    goToPage(
      safeCurrentPage + 1,
    );
  }

  function selectCountry(
    countryCode: CountryCode,
  ): void {
    setSelectedCountryCode(
      countryCode,
    );
  }

  return {
    currentPage: safeCurrentPage,
    totalPages,

    selectedCountryCode,
    selectedCountry,
    visibleCountries,

    canNavigate:
      totalPages > 1,

    goToPreviousPage,
    goToNextPage,
    selectCountry,
  };
}