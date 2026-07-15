import { Box } from "@/components/Box";
import { Text } from "@/components/Text";

import {
  FeaturedNewsCard,
  SecondaryNewsCard,
} from "./components";

import type { HeroProps } from "./Hero.types";

export function Hero({
  title,
  description,
  featuredNews,
  secondaryNews = [],
  actions,
  emptyMessage = "Nenhuma notícia encontrada para esta região.",
}: HeroProps) {
  return (
    <Box
      as="section"
      aria-labelledby="hero-title"
      className="w-full"
    >
      <Box
        display="flex"
        direction="column"
        gap="lg"
        className="
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <Box
          preset="stack"
          gap="xs"
          className="min-w-0"
        >
          <Text
            id="hero-title"
            preset="heroTitle"
            wrap="balance"
            className="max-w-4xl"
          >
            {title}
          </Text>

          <Text
            preset="bodyLarge"
            tone="muted"
            wrap="pretty"
            className="max-w-3xl"
          >
            {description}
          </Text>
        </Box>

        {actions && (
          <Box className="w-full shrink-0 sm:w-auto">
            {actions}
          </Box>
        )}
      </Box>

      {featuredNews ? (
        <Box
          className="
            mt-8 grid grid-cols-1 gap-5
            lg:grid-cols-[minmax(0,1.7fr)_minmax(21rem,0.9fr)]
          "
        >
          <FeaturedNewsCard
            news={featuredNews}
          />

          <Box
            preset="stack"
            gap="md"
          >
            {secondaryNews.map((news) => (
              <SecondaryNewsCard
                key={news.id}
                news={news}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          background="surfaceMuted"
          border="default"
          radius="card"
          padding="xl"
          className="mt-8 text-center"
        >
          <Text tone="muted">
            {emptyMessage}
          </Text>
        </Box>
      )}
    </Box>
  );
}