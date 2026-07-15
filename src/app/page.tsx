import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildMockCountriesWithNews,
} from "@/mocks/news.mock";

export default function Home() {
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
          title="O mundo em um só lugar."
          description="Notícias locais, fontes verificadas e contexto internacional."
          exploreTitle="Explore por país"
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}