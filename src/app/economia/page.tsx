import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export const revalidate = 900;

export default async function EconomyPage() {
  const countries =
    await buildAmericaCountriesWithNews(
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
        <NewsByContinent
          countries={countries}
          category="economy"
          title="A economia das Américas em destaque."
          description="Mercados, empresas, indicadores e decisões econômicas dos países americanos."
          exploreTitle="Economia por país"
          defaultContinent="america"
        />
      </Box>
    </Box>
  );
}