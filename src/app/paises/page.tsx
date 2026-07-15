import {
  Box,
  CountriesDirectory,
} from "@/components";

import {
  buildMockCountriesWithNews,
} from "@/mocks/news.mock";

export default function CountriesPage() {
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
        <CountriesDirectory
          countries={countries}
          defaultContinent="world"
        />
      </Box>
    </Box>
  );
}