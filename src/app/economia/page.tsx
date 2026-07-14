import {
  Box,
  ExploreCountries,
  Hero,
} from "@/components";

import { getNewsFromCountries } from "@/domain/news/news.helpers";
import { buildMockCountriesWithNews } from "@/mocks/news.mock";

export default function EconomyPage() {
  const countries =
    buildMockCountriesWithNews();

  const economyNews = getNewsFromCountries(
    countries,
    "economy",
  );

  const featuredNews = economyNews[0];
  const secondaryNews =
    economyNews.slice(1, 3);

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
          title="A economia da América do Sul."
          description="Mercados, empresas, indicadores e decisões econômicas dos países da região."
          featuredNews={featuredNews}
          secondaryNews={secondaryNews}
        />

        <ExploreCountries
          countries={countries}
          category="economy"
          title="Economia por país"
        />
      </Box>
    </Box>
  );
}