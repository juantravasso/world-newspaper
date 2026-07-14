import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";
import type { NewsWithCountry } from "@/domain/news/news.helpers";
import { CategoryBadge } from "../CategoryBadge";

export type FeaturedNewsCardProps = {
  news: NewsWithCountry;
};

export function FeaturedNewsCard({
  news,
}: FeaturedNewsCardProps) {
  return (
    <Link
      href={news.href}
      className="block"
      aria-label={`Ler notícia: ${news.title}`}
    >
      <Box
        as="article"
        preset="card"
        className="group"
      >
        <Box
          position="relative"
          overflow="hidden"
          className="
            flex min-h-64 items-end
            bg-gradient-to-br
            from-brand-emphasis
            via-brand
            to-[#07152d]
            p-5
            sm:min-h-80
            lg:min-h-[22rem]
          "
        >
          <Box
            display="flex"
            align="center"
            gap="xs"
            className="absolute left-5 top-5 z-10"
          >
            <Box
              display="flex"
              align="center"
              gap="xs"
              background="card"
              radius="pill"
              paddingX="sm"
              paddingY="xs"
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

            <CategoryBadge category={news.category}>
              {news.categoryLabel}
            </CategoryBadge>
          </Box>
        </Box>

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
            {news.source} • {news.publishedAt}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}