import {
  Box,
  CountriesDirectory,
} from "@/components";

import {
  buildAmericaCountriesWithNews,
} from "@/server/news/build-america-countries";

export default async function CountriesPage() {
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
        <CountriesDirectory
          countries={countries}
          defaultContinent="america"
        />
      </Box>
    </Box>
  );
}