import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

import type {
  NewsWithCountry,
} from "@/domain/news/news.helpers";

import {
  CategoryBadge,
} from "../CategoryBadge";

export type SecondaryNewsCardProps = {
  news: NewsWithCountry;
};

export function SecondaryNewsCard({
  news,
}: SecondaryNewsCardProps) {
  const storyHref =
  `/noticias/${encodeURIComponent(
    news.storyId,
  )}`;
  return (
    <Link
      href={storyHref}
      prefetch={false}
      className="
        block h-full rounded-card
        outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
      "
      aria-label={`Ler notícia: ${news.title}`}
    >
      <Box
        as="article"
        preset="card"
        padding="lg"
        position="relative"
        overflow="hidden"
        className="
          group flex h-full flex-col
          transition-colors duration-150
          hover:border-foreground
        "
      >
        <Box
          position="relative"
          className="z-10 flex h-full flex-col"
        >
          <Box
            display="flex"
            align="center"
            gap="sm"
            className="flex-wrap"
          >
            <CategoryBadge
              category={news.category}
            >
              {news.categoryLabel}
            </CategoryBadge>

            <Text
              as="span"
              preset="categoryLabel"
              tone="muted"
            >
              {news.countryFlag}{" "}
              {news.countryName}
            </Text>
          </Box>

          <Text
            preset="cardTitle"
            clamp={3}
            className="
              mt-5 transition-colors
              group-hover:text-primary
            "
          >
            {news.title}
          </Text>

          <Text
            preset="metadata"
            tone="muted"
            className="
              mt-auto block pt-8
            "
          >
            {news.source} •{" "}
            {news.publishedAt}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}
