import {
  Box,
  ExploreCountries,
  Hero,
} from "@/components";

import { getNewsFromCountries } from "@/domain/news/news.helpers";
import { buildMockCountriesWithNews } from "@/mocks/news.mock";

export default function Home() {
  const countries =
    buildMockCountriesWithNews();

  const news =
    getNewsFromCountries(countries);

  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 3);

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
          title="A América do Sul em um só lugar."
          description="Notícias locais, fontes verificadas e contexto regional."
          featuredNews={featuredNews}
          secondaryNews={secondaryNews}
        />

        <ExploreCountries
          countries={countries}
        />
      </Box>
    </Box>
  );
}