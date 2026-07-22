import {
  Box,
  NewsByRegion,
} from "@/components";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export default async function PoliticsPage() {
  const countries =
    await buildWorldCountriesWithNews(
      "politics",
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
          category="politics"
          title="A política mundial em destaque."
          description="Governos, congressos, eleições e decisões políticas analisadas por diferentes fontes ao redor do mundo."
          exploreTitle="Política por país"
          defaultRegion="world"
        />
      </Box>
    </Box>
  );
}