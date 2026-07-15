import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import {
  categoryLabels,
} from "../CountryLatestNews.data";

export type EmptyNewsStateProps = {
  countryName: string;
  category?: NewsCategory;
};

export function EmptyNewsState({
  countryName,
  category,
}: EmptyNewsStateProps) {
  const message = category
    ? `Nenhuma notícia de ${categoryLabels[category].toLowerCase()} disponível para ${countryName}.`
    : `Nenhuma notícia disponível para ${countryName}.`;

  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="xl"
      className="mt-5 text-center"
    >
      <Text tone="muted">
        {message}
      </Text>
    </Box>
  );
}
