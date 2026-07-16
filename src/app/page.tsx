import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export const revalidate = 900;

export default async function Home() {
  const countries =
    await buildWorldCountriesWithNews();

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
          description="Notícias locais, fontes verificadas e diferentes perspectivas sobre os principais acontecimentos mundiais."
          exploreTitle="Explore por país"
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}