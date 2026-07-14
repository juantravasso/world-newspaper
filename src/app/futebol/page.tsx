import {
  Box,
  ExploreCountries,
  Hero,
} from "@/components";

import { getNewsFromCountries } from "@/domain/news/news.helpers";
import { buildMockCountriesWithNews } from "@/mocks/news.mock";

export default function FootballPage() {
  const countries =
    buildMockCountriesWithNews();

  const footballNews = getNewsFromCountries(
    countries,
    "football",
  );

  const featuredNews = footballNews[0];
  const secondaryNews =
    footballNews.slice(1, 3);

  if (!featuredNews) {
    return null;
  }

  return (
    <Box
      as="main"
      preset="page"
      className="flex-1"
    >
      <Box
        preset="container"
        paddingY="xl"
      >
        <Hero
          title="O futebol sul-americano em um só lugar."
          description="Campeonatos, seleções, clubes e os principais acontecimentos do futebol da região."
          featuredNews={featuredNews}
          secondaryNews={secondaryNews}
        />

        <ExploreCountries
          countries={countries}
          category="football"
          title="Futebol por país"
        />
      </Box>
    </Box>
  );
}