import {
  Box,
  NewsByContinent,
} from "@/components";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export const revalidate = 900;

export default async function PoliticsPage() {
  const countries =
    await buildAmericaCountriesWithNews(
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
          title="A política das Américas em destaque."
          description="Governos, congressos, eleições e decisões políticas dos países americanos."
          exploreTitle="Política por país"
          defaultContinent="america"
        />
      </Box>
    </Box>
  );
}