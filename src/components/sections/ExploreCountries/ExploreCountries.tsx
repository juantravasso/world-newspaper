"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";
import { CountryLatestNews } from "./CountryLatestNews";
import { CountryFlag, Box, Text } from "@/components";

export type ExploreCountriesProps = {
  countries: CountryWithLatestNews[];

  category?: NewsCategory;

  title?: string;
};

export function ExploreCountries({
  countries,
  category,
  title = "Explore por país",
}: ExploreCountriesProps) {
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(countries[0]?.code ?? "");

  const selectedCountry =
    countries.find(
      (country) =>
        country.code === selectedCountryCode,
    ) ?? countries[0];

  const visibleCountry = useMemo(() => {
    if (!selectedCountry) {
      return undefined;
    }

    if (!category) {
      return selectedCountry;
    }

    return {
      ...selectedCountry,

      news: selectedCountry.news.filter(
        (news) => news.category === category,
      ),
    };
  }, [selectedCountry, category]);

  if (!visibleCountry) {
    return null;
  }

  return (
    <Box
      as="section"
      aria-labelledby="explore-countries-title"
      className="mt-14 w-full"
    >
      <Box
        display="flex"
        align="center"
        justify="between"
        gap="md"
      >
        <Text
          id="explore-countries-title"
          preset="sectionTitle"
        >
          {title}
        </Text>

        <Link
          href="/paises"
          className="shrink-0 transition-opacity hover:opacity-70"
        >
          <Text
            as="span"
            preset="button"
            tone="accent"
          >
            Ver todos
          </Text>
        </Link>
      </Box>

      <Box
        as="ul"
        className="
          mt-5 grid grid-flow-col
          auto-cols-[minmax(10rem,1fr)]
          gap-3 overflow-x-auto pb-3
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          lg:grid-flow-row
          lg:grid-cols-6
          lg:overflow-visible
          lg:pb-0
        "
      >
        {countries.map((country) => {
          const isSelected =
            country.code === selectedCountryCode;

          return (
            <Box
              as="li"
              key={country.code}
              className="min-w-0"
            >
              <Box
                as="button"
                type="button"
                display="flex"
                align="center"
                gap="sm"
                width="full"
                border={
                  isSelected
                    ? "strong"
                    : "default"
                }
                radius="control"
                paddingX="md"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedCountryCode(
                    country.code,
                  )
                }
                className={[
                  "h-16 min-w-40 text-left",
                  "transition-all duration-200",
                  "lg:min-w-0",
                  isSelected
                    ? "bg-primary-soft shadow-card"
                    : "bg-card hover:bg-surface-muted",
                ].join(" ")}
              >
                <CountryFlag
                  code={country.code}
                  countryName={country.name}
                  decorative
                />

                <Text
                  as="span"
                  preset="label"
                  tone={
                    isSelected
                      ? "accent"
                      : "default"
                  }
                  clamp={1}
                >
                  {country.name}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      <CountryLatestNews
        country={visibleCountry}
        category={category}
      />
    </Box>
  );
}