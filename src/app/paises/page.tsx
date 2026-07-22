import {
  Box,
  CountriesDirectory,
} from "@/components";

import {
  buildWorldCountriesFromStorage,
} from "@/server/news/build-world-countries-from-storage";

export default async function CountriesPage() {
  const countries =
    await buildWorldCountriesFromStorage();

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
          defaultRegion="world"
        />
      </Box>
    </Box>
  );
}