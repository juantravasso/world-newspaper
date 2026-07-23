import type {
  Metadata,
} from "next";

import {
  Box,
} from "@/components/Box";

import {
  ReaderLibraryPage,
} from "@/components/ReaderLibrary/ReaderLibraryPage";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

export const metadata:
  Metadata = {
  title:
    "Minha seleção",

  description:
    "Notícias salvas, histórico de leitura e recomendações personalizadas no World Newspaper.",
};

export default function MySelectionPage() {
  const countries =
    listCountryCatalog().map(
      (country) => ({
        code:
          country.code,

        name:
          country.name,
      }),
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
        <ReaderLibraryPage
          countries={
            countries
          }
        />
      </Box>
    </Box>
  );
}
