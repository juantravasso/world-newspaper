"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Box,
  ContinentSelector,
  ExploreCountries,
  Hero,
  Text,
} from "@/components";

import type {
  ContinentId,
} from "@/domain/geography";

import {
  filterCountriesByContinent,
} from "@/domain/geography";

import {
  getNewsFromCountries,
  selectHeroNews,
} from "@/domain/news/news.helpers";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

export type NewsByContinentProps = {
  countries:
    CountryWithLatestNews[];

  title: string;
  description: string;

  category?: NewsCategory;

  exploreTitle?: string;

  defaultContinent?:
    ContinentId;
};

export function NewsByContinent({
  countries,
  title,
  description,
  category,
  exploreTitle =
    "Explore por país",
  defaultContinent = "world",
}: NewsByContinentProps) {
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

  const visibleNews =
    useMemo(
      () =>
        getNewsFromCountries(
          visibleCountries,
          category,
        ),
      [
        visibleCountries,
        category,
      ],
    );

  const {
    featuredNews,
    secondaryNews,
  } = useMemo(
    () =>
      selectHeroNews(
        visibleNews,
      ),
    [visibleNews],
  );

  return (
    <>
      <Hero
        title={title}
        description={description}
        featuredNews={
          featuredNews
        }
        secondaryNews={
          secondaryNews
        }
        emptyMessage={
          visibleNews.length > 0
            ? "Existem notícias para esta região, mas nenhuma possui imagem extraída para o destaque."
            : "Ainda não existem notícias cadastradas para esta região."
        }
        actions={
          <ContinentSelector
            value={
              selectedContinent
            }
            onValueChange={
              setSelectedContinent
            }
          />
        }
      />

      {visibleCountries.length >
      0 ? (
        <ExploreCountries
          key={`${selectedContinent}-${category ?? "all"}`}
          countries={
            visibleCountries
          }
          category={category}
          title={exploreTitle}
        />
      ) : (
        <Box
          background="surfaceMuted"
          border="default"
          radius="card"
          padding="xl"
          className="mt-14 text-center"
        >
          <Text
            preset="sectionTitle"
          >
            Nenhum país disponível
          </Text>

          <Text
            tone="muted"
            className="mt-2"
          >
            Ainda não existem países
            cadastrados para esta
            região.
          </Text>
        </Box>
      )}
    </>
  );
}
