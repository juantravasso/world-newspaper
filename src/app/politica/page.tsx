import {
  Box,
  ExploreCountries,
  Hero,
} from "@/components";

import { getNewsFromCountries } from "@/domain/news/news.helpers";
import { buildMockCountriesWithNews } from "@/mocks/news.mock";

export default function PoliticsPage() {
  const countries =
    buildMockCountriesWithNews();

  const politicsNews = getNewsFromCountries(
    countries,
    "politics",
  );

  const featuredNews = politicsNews[0];
  const secondaryNews =
    politicsNews.slice(1, 3);

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
          title="A política sul-americana em destaque."
          description="Governos, congressos, eleições e decisões que movimentam os países da região."
          featuredNews={featuredNews}
          secondaryNews={secondaryNews}
        />

        <ExploreCountries
          countries={countries}
          category="politics"
          title="Política por país"
        />
      </Box>
    </Box>
  );
}