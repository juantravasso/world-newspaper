import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildMockCountriesWithNews,
} from "@/mocks/news.mock";

export default function PoliticsPage() {
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
          category="politics"
          title="A política mundial em destaque."
          description="Governos, congressos, eleições e decisões políticas que movimentam os países de cada continente."
          exploreTitle="Política por país"
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}