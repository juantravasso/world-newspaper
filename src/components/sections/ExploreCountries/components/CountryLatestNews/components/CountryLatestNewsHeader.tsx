import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  CountryFlag,
} from "@/components/CountryFlag";

import {
  Text,
} from "@/components/Text";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  categoryLabels,
  categoryRouteSegments,
} from "../CountryLatestNews.data";

export type CountryLatestNewsHeaderProps = {
  country:
    CountryWithLatestNews;

  category?: NewsCategory;
};

export function CountryLatestNewsHeader({
  country,
  category,
}: CountryLatestNewsHeaderProps) {
  const sectionTitle = category
    ? `${categoryLabels[category]} em ${country.name}`
    : `Últimas notícias de ${country.name}`;

  const allNewsHref = category
    ? `/paises/${country.slug}/${categoryRouteSegments[category]}`
    : `/paises/${country.slug}`;

  return (
    <Box
      display="flex"
      align="center"
      justify="between"
      gap="md"
    >
      <Box
        display="flex"
        align="center"
        gap="sm"
        className="min-w-0"
      >
        <CountryFlag
          code={country.code}
          countryName={country.name}
          className="h-7 w-10"
        />

        <Text
          id="country-latest-news-title"
          preset="sectionTitle"
          clamp={1}
        >
          {sectionTitle}
        </Text>
      </Box>

      <Link
        href={allNewsHref}
        className="
          shrink-0 rounded-control
          outline-none transition-opacity
          hover:opacity-70
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
        "
      >
        <Text
          as="span"
          preset="button"
          tone="accent"
        >
          Ver todas
        </Text>
      </Link>
    </Box>
  );
}
