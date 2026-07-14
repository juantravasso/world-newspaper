import { ChevronDown, Globe2 } from "lucide-react";

import { Box, Text} from "@/components";

import type { HeroProps } from "./Hero.types";
import { FeaturedNewsCard, SecondaryNewsCard } from "./components";

export function Hero({
  title,
  description,
  featuredNews,
  secondaryNews,
  regionLabel = "América do Sul",
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
        className="lg:flex-row lg:items-start lg:justify-between"
      >
        <Box
          preset="stack"
          gap="xs"
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
          >
            {description}
          </Text>
        </Box>

        <Box
          as="button"
          type="button"
          display="flex"
          align="center"
          justify="between"
          gap="md"
          background="card"
          border="default"
          radius="pill"
          paddingX="lg"
          className="h-12 w-full transition-colors hover:bg-surface-muted sm:w-64"
        >
          <Box
            display="flex"
            align="center"
            gap="sm"
          >
            <Globe2
              className="size-5 text-primary"
              aria-hidden="true"
            />

            <Text
              as="span"
              preset="label"
            >
              {regionLabel}
            </Text>
          </Box>

          <ChevronDown
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </Box>
      </Box>

      <Box
        className="
          mt-8 grid grid-cols-1 gap-5
          lg:grid-cols-[minmax(0,1.7fr)_minmax(21rem,0.9fr)]
        "
      >
        <FeaturedNewsCard news={featuredNews} />

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
    </Box>
  );
}