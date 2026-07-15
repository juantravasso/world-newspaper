"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Box,
} from "@/components/Box";

import {
  ContinentSelector,
  getContinentOption,
} from "@/components/ContinentSelector";

import {
  MotionReveal,
} from "@/components/effects/MotionReveal";

import {
  Spotlight,
} from "@/components/effects/Spotlight";

import {
  Text,
} from "@/components/Text";

import {
  WorldImageRing,
} from "@/components/WorldImageRing";

import {
  filterCountriesByContinent,
} from "@/domain/geography";

import type {
  ContinentId,
} from "@/domain/geography";

import type {
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import {
  ExploreCountries,
} from "../ExploreCountries";

export type CountriesDirectoryProps = {
  countries:
    CountryWithLatestNews[];

  defaultContinent?: ContinentId;
};

export function CountriesDirectory({
  countries,
  defaultContinent = "world",
}: CountriesDirectoryProps) {
  const [
    selectedContinent,
    setSelectedContinent,
  ] = useState<ContinentId>(
    defaultContinent,
  );

  const visibleCountries =
    useMemo(
      () =>
        filterCountriesByContinent(
          countries,
          selectedContinent,
        ),
      [
        countries,
        selectedContinent,
      ],
    );

  const selectedOption =
    getContinentOption(
      selectedContinent,
    );

  const countriesTitle =
    selectedContinent === "world"
      ? "Todos os países"
      : `Países — ${selectedOption.label}`;

  return (
    <>
      <Box
        as="section"
        aria-labelledby="countries-page-title"
        position="relative"
        background="card"
        border="default"
        radius="card"
        className="
          isolate w-full
          overflow-visible
          p-6 sm:p-8
        "
      >
        <Spotlight />

        <Box
          position="relative"
          className="
            z-10 grid items-center gap-8
            md:grid-cols-[minmax(0,1fr)_18rem]
            lg:grid-cols-[minmax(0,1fr)_24rem]
          "
        >
          <MotionReveal>
            <Box
              preset="stack"
              gap="xs"
              className="min-w-0"
            >
              <Text
                id="countries-page-title"
                preset="pageTitle"
                wrap="balance"
              >
                Notícias por país
              </Text>

              <Text
                preset="bodyLarge"
                tone="muted"
                wrap="pretty"
                className="max-w-3xl"
              >
                Escolha uma região e
                selecione um país para
                acompanhar suas principais
                notícias.
              </Text>

              <Text
                preset="bodySmall"
                tone="subtle"
              >
                {visibleCountries.length}{" "}
                {visibleCountries.length === 1
                  ? "país disponível"
                  : "países disponíveis"}
              </Text>

              <Box className="mt-5">
                <ContinentSelector
                  value={
                    selectedContinent
                  }
                  onValueChange={
                    setSelectedContinent
                  }
                  showArrows
                />
              </Box>
            </Box>
          </MotionReveal>

          <WorldImageRing
            countries={
              visibleCountries
            }
            maxItems={7}
          />
        </Box>
      </Box>

      {visibleCountries.length > 0 ? (
        <ExploreCountries
          key={selectedContinent}
          countries={
            visibleCountries
          }
          title={countriesTitle}
          showViewAll={false}
        />
      ) : (
        <EmptyCountriesState
          continentLabel={
            selectedOption.label
          }
        />
      )}
    </>
  );
}

type EmptyCountriesStateProps = {
  continentLabel: string;
};

function EmptyCountriesState({
  continentLabel,
}: EmptyCountriesStateProps) {
  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="xl"
      className="mt-14 text-center"
    >
      <Text preset="sectionTitle">
        Nenhum país disponível
      </Text>

      <Text
        tone="muted"
        className="mt-2"
      >
        Ainda não existem países
        cadastrados para{" "}
        {continentLabel}.
      </Text>
    </Box>
  );
}
