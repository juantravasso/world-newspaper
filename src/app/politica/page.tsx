import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export const revalidate = 900;

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
        <NewsByContinent
          countries={countries}
          category="politics"
          title="A política mundial em destaque."
          description="Governos, congressos, eleições e decisões políticas analisadas por diferentes fontes ao redor do mundo."
          exploreTitle="Política por país"
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}