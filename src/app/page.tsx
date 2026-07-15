import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export const revalidate = 900;

export default async function Home() {
  const countries =
    await buildAmericaCountriesWithNews();

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
          title="As Américas em um só lugar."
          description="Notícias locais, fontes verificadas e os principais acontecimentos dos países americanos."
          exploreTitle="Explore por país"
          defaultContinent="america"
        />
      </Box>
    </Box>
  );
}