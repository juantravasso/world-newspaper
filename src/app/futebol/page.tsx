import {
  Box,
  NewsByContinent,
} from "@/components";

import { buildMockCountriesWithNews } from "@/mocks/news.mock";

export default function FootballPage() {
  const countries =
    buildMockCountriesWithNews();

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
        <NewsByContinent
          countries={countries}
          category="football"
          title="O futebol mundial em um só lugar."
          description="Campeonatos, seleções, clubes e os principais acontecimentos do futebol em cada continente."
          exploreTitle="Futebol por país"
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}