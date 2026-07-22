import {
  Box,
  NewsByRegion,
} from "@/components";

import {
  buildWorldCountriesFromStorage,
} from "@/server/news/build-world-countries-from-storage";

export default async function FootballPage() {
  const countries =
    await buildWorldCountriesFromStorage(
      "football",
    );

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
        <NewsByRegion
          countries={countries}
          category="football"
          title="O futebol mundial em um só lugar."
          description="Campeonatos, seleções, clubes e os principais acontecimentos do futebol em cada região."
          exploreTitle="Futebol por país"
          defaultRegion="world"
        />
      </Box>
    </Box>
  );
}