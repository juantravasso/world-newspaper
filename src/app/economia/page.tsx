import {
  Box,
  NewsByRegion,
} from "@/components";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export default async function EconomyPage() {
  const countries =
    await buildWorldCountriesWithNews(
      "economy",
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
          category="economy"
          title="A economia mundial em destaque."
          description="Mercados, empresas, indicadores e decisões econômicas dos países de cada região."
          exploreTitle="Economia por país"
          defaultRegion="world"
        />
      </Box>
    </Box>
  );
}