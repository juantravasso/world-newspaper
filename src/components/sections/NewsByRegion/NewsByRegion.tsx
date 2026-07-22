"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Box,
  
  ExploreCountries,
  Hero,
  RegionSelector,
  Text,
} from "@/components";

import type {
  RegionId,
} from "@/domain/geography";

import {
  filterCountriesByRegion,
} from "@/domain/geography";

import {
  getNewsFromCountries,
  selectHeroNews,
} from "@/domain/news/news.helpers";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";


export type NewsByRegionProps = {
  countries:
    CountryWithLatestNews[];

  title: string;
  description: string;

  category?: NewsCategory;

  exploreTitle?: string;

  defaultRegion?:
    RegionId;
};

export function NewsByRegion({
  countries,
  title,
  description,
  category,
  exploreTitle =
    "Explore por país",
  defaultRegion = "world",
}: NewsByRegionProps) {
  const [
    selectedRegion,
    setSelectedRegion,
  ] = useState<RegionId>(
    defaultRegion,
  );

  const visibleCountries =
    useMemo(
      () =>
        filterCountriesByRegion(
          countries,
          selectedRegion,
        ),
      [
        countries,
        selectedRegion,
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
          <RegionSelector
            value={
              selectedRegion
            }
            onValueChange={
              setSelectedRegion
            }
          />
        }
      />

      {visibleCountries.length >
      0 ? (
        <ExploreCountries
          key={`${selectedRegion}-${category ?? "all"}`}
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
