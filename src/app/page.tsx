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
          title="O mundo pelas fontes de cada país."
          description="Manchetes dos veículos locais de 55 países, traduzidas para o português, com link para a matéria original."
          exploreTitle="Explore por país"
          defaultRegion="world"
        />

        <TrendingStories />
      </Box>
    </Box>
  );
}