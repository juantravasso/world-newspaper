import {
  Box,
  CountriesDirectory,
} from "@/components";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export const revalidate = 900;

export default async function CountriesPage() {
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
        <CountriesDirectory
          countries={countries}
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}