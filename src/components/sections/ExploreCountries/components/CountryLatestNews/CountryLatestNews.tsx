import {
  Box,
} from "@/components/Box";

import {
  MotionReveal,
} from "@/components/effects/MotionReveal";

import type {
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  CountryLatestNewsHeader,
  CountryStoryCard,
  EmptyNewsState,
} from "./components";

export type CountryLatestNewsProps = {
  country:
    CountryWithLatestNews;

  category?: NewsCategory;
};

export function CountryLatestNews({
  country,
  category,
}: CountryLatestNewsProps) {
  const visibleStories =
    category
      ? country.stories.filter(
          (story) =>
            story.category ===
            category,
        )
      : country.stories;

  const animationKey =
    `${country.code}-${category ?? "all"}`;

  return (
    <Box
      as="section"
      aria-labelledby="country-latest-news-title"
      className="mt-10 w-full"
    >
      <CountryLatestNewsHeader
        country={country}
        category={category}
      />

      {visibleStories.length > 0 ? (
        <MotionReveal
          key={animationKey}
          staggerItems
        >
          <Box
            as="ul"
            className="
              mt-5 grid
              grid-cols-1 gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {visibleStories.map(
              (story) => (
                <Box
                  as="li"
                  data-motion-item
                  key={story.id}
                  className="min-w-0"
                >
                  <CountryStoryCard
                    story={story}
                  />
                </Box>
              ),
            )}
          </Box>
        </MotionReveal>
      ) : (
        <EmptyNewsState
          countryName={
            country.name
          }
          category={category}
        />
      )}
    </Box>
  );
}