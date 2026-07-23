import {
  Box,
  NewsByRegion,
} from "@/components";

import {
  TrendingStories,
} from "@/components/sections/TrendingStories/TrendingStories";

import {
  buildWorldCountriesFromStorage,
} from "@/server/news/build-world-countries-from-storage";

export default async function Home() {
  const countries =
    await buildWorldCountriesFromStorage();

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
          title="O mundo em um só lugar."
          description="Notícias locais, fontes verificadas e diferentes perspectivas sobre os principais acontecimentos mundiais."
          exploreTitle="Explore por país"
          defaultRegion="world"
        />

        <TrendingStories />
      </Box>
    </Box>
  );
}