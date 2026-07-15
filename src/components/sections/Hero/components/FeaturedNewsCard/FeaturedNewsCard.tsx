import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  EditorialImage,
} from "@/components/EditorialImage";

import {
  BorderBeam,
} from "@/components/effects/BorderBeam";

import {
  Text,
} from "@/components/Text";

import type {
  NewsWithCountry,
} from "@/domain/news/news.helpers";

import {
  getNewsImageUrl,
} from "@/domain/news/news.images";

import {
  CategoryBadge,
} from "../CategoryBadge";

export type FeaturedNewsCardProps = {
  news: NewsWithCountry;
};

export function FeaturedNewsCard({
  news,
}: FeaturedNewsCardProps) {
  const imageUrl =
    getNewsImageUrl(
      news.category,
      news.imageUrl,
    );

  return (
    <Link
      href={news.href}
      className="
        block rounded-card
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
        position="relative"
        className="group isolate"
      >
        <BorderBeam />

        <EditorialImage
          src={imageUrl}
          alt={news.title}
          priority
          sizes="
            (max-width: 1023px) 100vw,
            65vw
          "
          className="
            min-h-64
            sm:min-h-80
            lg:min-h-[22rem]
          "
          imageClassName="
            group-hover:scale-105
          "
          fallback={
            <div
              className="
                absolute inset-0
                bg-gradient-to-br
                from-brand-emphasis
                via-brand
                to-[#07152d]
              "
            />
          }
        >
          <Box
            display="flex"
            align="center"
            gap="xs"
            className="
              absolute left-5 top-5
              flex-wrap
            "
          >
            <Box
              display="flex"
              align="center"
              gap="xs"
              background="card"
              radius="pill"
              paddingX="sm"
              paddingY="xs"
              className="
                shadow-card
                backdrop-blur-md
              "
            >
              <Text
                as="span"
                preset="bodySmall"
                aria-hidden="true"
              >
                {news.countryFlag}
              </Text>

              <Text
                as="span"
                preset="categoryLabel"
                tone="brand"
              >
                {news.countryName}
              </Text>
            </Box>

            <CategoryBadge
              category={news.category}
            >
              {news.categoryLabel}
            </CategoryBadge>
          </Box>
        </EditorialImage>

        <Box padding="lg">
          <Text
            preset="eyebrow"
            tone="accent"
          >
            Destaque
          </Text>

          <Text
            preset="featuredTitle"
            wrap="balance"
            className="
              mt-3 transition-colors
              group-hover:text-primary
            "
          >
            {news.title}
          </Text>

          <Text
            preset="metadata"
            tone="muted"
            className="mt-2 block"
          >
            {news.source} •{" "}
            {news.publishedAt}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}
