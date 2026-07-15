import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export const revalidate = 900;

export default async function FootballPage() {
  const countries =
    await buildAmericaCountriesWithNews(
      "football",
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
          category="football"
          title="O futebol das Américas em um só lugar."
          description="Campeonatos, seleções, clubes e os principais acontecimentos do futebol americano."
          exploreTitle="Futebol por país"
          defaultContinent="america"
        />
      </Box>
    </Box>
  );
}