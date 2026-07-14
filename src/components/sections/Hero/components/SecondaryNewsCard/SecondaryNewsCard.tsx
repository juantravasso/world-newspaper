import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";
import type { NewsWithCountry } from "@/domain/news/news.helpers";
import { CategoryBadge } from "../CategoryBadge";


export type SecondaryNewsCardProps = {
  news: NewsWithCountry;
};

export function SecondaryNewsCard({
  news,
}: SecondaryNewsCardProps) {
  return (
    <Link
      href={news.href}
      className="block h-full"
      aria-label={`Ler notícia: ${news.title}`}
    >
      <Box
        as="article"
        preset="card"
        padding="lg"
        className="
          group flex h-full flex-col
          transition-all duration-200
          hover:-translate-y-0.5
          hover:shadow-card-hover
        "
      >
        <Box
          display="flex"
          align="center"
          gap="sm"
          className="flex-wrap"
        >
          <CategoryBadge category={news.category}>
            {news.categoryLabel}
          </CategoryBadge>

          <Text
            as="span"
            preset="categoryLabel"
            tone="muted"
          >
            {news.countryFlag} {news.countryName}
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
          className="mt-auto block pt-8"
        >
          {news.source} • {news.publishedAt}
        </Text>
      </Box>
    </Link>
  );
}