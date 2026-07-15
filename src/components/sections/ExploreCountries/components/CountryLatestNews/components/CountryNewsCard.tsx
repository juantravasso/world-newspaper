import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  EditorialImage,
} from "@/components/EditorialImage";

import {
  Text,
} from "@/components/Text";

import type {
  CountryNewsCard as CountryNewsCardData,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  getCategoryStyles,
  getCategorySymbol,
  getNewsFallbackStyles,
} from "../CountryLatestNews.data";

export type CountryNewsCardProps = {
  news: CountryNewsCardData;
};

export function CountryNewsCard({
  news,
}: CountryNewsCardProps) {
  return (
    <Link
      href={news.href}
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
        className="
          group flex h-full flex-col
          transition-all duration-200
          hover:-translate-y-1
          hover:border-border-strong
          hover:shadow-card-hover
        "
      >
        <EditorialImage
          src={news.imageUrl}
          alt={news.title}
          sizes="
            (max-width: 767px) 100vw,
            (max-width: 1279px) 50vw,
            33vw
          "
          className="aspect-[16/8]"
          imageClassName="
            group-hover:scale-105
          "
          fallback={
            <Box
              display="flex"
              align="center"
              justify="center"
              className={[
                "absolute inset-0",
                getNewsFallbackStyles(
                  news.category,
                ),
              ].join(" ")}
            >
              <Text
                as="span"
                preset="pageTitle"
                tone="inverse"
                aria-hidden="true"
              >
                {getCategorySymbol(
                  news.category,
                )}
              </Text>
            </Box>
          }
        />

        <Box
          preset="stack"
          padding="md"
          className="flex-1"
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
              {news.source}
            </Text>
          </Box>

          <Text
            preset="cardTitle"
            clamp={3}
            wrap="pretty"
            className="
              mt-4 transition-colors
              group-hover:text-primary
            "
          >
            {news.title}
          </Text>

          {news.excerpt && (
            <Text
              preset="bodySmall"
              tone="muted"
              clamp={2}
              wrap="pretty"
              className="mt-3"
            >
              {news.excerpt}
            </Text>
          )}

          <Text
            preset="metadata"
            tone="muted"
            className="
              mt-auto block pt-5
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

type CategoryBadgeProps = {
  category: NewsCategory;
  children: ReactNode;
};

function CategoryBadge({
  category,
  children,
}: CategoryBadgeProps) {
  return (
    <Box
      as="span"
      radius="pill"
      paddingX="sm"
      paddingY="xs"
      className={
        getCategoryStyles(category)
      }
    >
      <Text
        as="span"
        preset="categoryLabel"
        tone="inherit"
      >
        {children}
      </Text>
    </Box>
  );
}
