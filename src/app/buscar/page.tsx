import {
  Suspense,
} from "react";

import Link from "next/link";

import {
  Box,
  Text,
} from "@/components";

import {
  SearchResultCard,
} from "@/components/Search";

import {
  searchStories,
} from "@/server/stories/story.discovery";

type SearchPageProps = {
  searchParams:
    Promise<{
      q?:
        string | string[];

      page?:
        string | string[];
    }>;
};

export default function SearchPage({
  searchParams,
}: SearchPageProps) {
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
        <Suspense
          fallback={
            <SearchPageLoading />
          }
        >
          <SearchPageContent
            searchParams={
              searchParams
            }
          />
        </Suspense>
      </Box>
    </Box>
  );
}

async function SearchPageContent({
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const query =
    getSingleValue(
      resolvedSearchParams.q,
    )
      ?.trim() ??
    "";

  const requestedPage =
    parsePositiveInteger(
      getSingleValue(
        resolvedSearchParams.page,
      ),
    );

  const hasValidQuery =
    query.length >=
    2;

  const result =
    hasValidQuery
      ? await searchStories(
          query,
          requestedPage,
        )
      : null;

  return (
    <>
      <Box
        as="section"
        aria-labelledby="search-page-title"
        background="card"
        border="default"
        radius="card"
        padding="xl"
      >
        <Text
          id="search-page-title"
          preset="pageTitle"
          wrap="balance"
        >
          Buscar notícias
        </Text>

        <Text
          preset="bodyLarge"
          tone="muted"
          className="mt-2 max-w-3xl"
        >
          Pesquise por assunto, manchete,
          fonte, categoria ou nome de país.
        </Text>

        <form
          action="/buscar"
          method="get"
          className="
            mt-6 flex w-full
            max-w-3xl flex-col gap-3
            sm:flex-row
          "
        >
          <label
            htmlFor="search-page-input"
            className="sr-only"
          >
            Termo da busca
          </label>

          <input
            id="search-page-input"
            name="q"
            type="search"
            minLength={2}
            required
            defaultValue={query}
            placeholder="Ex.: eleições, Brasil ou economia"
            className="
              min-h-12 min-w-0 flex-1
              rounded-control border
              border-border bg-background
              px-4 text-base
              outline-none
              placeholder:text-subtle-foreground
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          />

          <button
            type="submit"
            className="
              min-h-12 rounded-button
              bg-primary px-7
              text-sm font-semibold
              text-white
              outline-none
              transition-opacity
              hover:opacity-85
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
          >
            Pesquisar
          </button>
        </form>
      </Box>

      {!hasValidQuery ? (
        <Box
          background="surfaceMuted"
          border="default"
          radius="card"
          padding="xl"
          className="mt-8 text-center"
        >
          <Text preset="sectionTitle">
            Digite pelo menos 2 caracteres
          </Text>

          <Text
            tone="muted"
            className="mt-2"
          >
            A busca também encontra notícias
            pelo nome do país e pelas fontes
            relacionadas.
          </Text>
        </Box>
      ) : result &&
        result.total >
          0 ? (
        <Box
          as="section"
          aria-labelledby="search-results-title"
          className="mt-10"
        >
          <Box
            display="flex"
            align="end"
            justify="between"
            gap="md"
            className="flex-wrap"
          >
            <Box>
              <Text
                id="search-results-title"
                preset="sectionTitle"
              >
                Resultados para “
                {result.query}”
              </Text>

              <Text
                tone="muted"
                className="mt-1"
              >
                {result.total}{" "}
                {result.total ===
                1
                  ? "story encontrada"
                  : "stories encontradas"}
              </Text>
            </Box>

            <Text
              preset="metadata"
              tone="subtle"
            >
              Página {result.page} de{" "}
              {result.totalPages}
            </Text>
          </Box>

          <Box
            as="ul"
            className="
              mt-6 grid
              grid-cols-1 gap-5
            "
          >
            {result.items.map(
              (item) => (
                <Box
                  as="li"
                  key={
                    item.story.id
                  }
                >
                  <SearchResultCard
                    item={item}
                  />
                </Box>
              ),
            )}
          </Box>

          {result.totalPages >
            1 && (
            <SearchPagination
              query={result.query}
              page={result.page}
              totalPages={
                result.totalPages
              }
            />
          )}
        </Box>
      ) : (
        <Box
          background="surfaceMuted"
          border="default"
          radius="card"
          padding="xl"
          className="mt-8 text-center"
        >
          <Text preset="sectionTitle">
            Nenhuma notícia encontrada
          </Text>

          <Text
            tone="muted"
            className="mt-2"
          >
            Tente pesquisar outro assunto,
            país ou nome de fonte.
          </Text>
        </Box>
      )}
    </>
  );
}

type SearchPaginationProps = {
  query:
    string;

  page:
    number;

  totalPages:
    number;
};

function SearchPagination({
  query,
  page,
  totalPages,
}: SearchPaginationProps) {
  return (
    <Box
      as="nav"
      aria-label="Paginação da busca"
      display="flex"
      align="center"
      justify="between"
      gap="md"
      className="mt-8"
    >
      {page >
      1 ? (
        <PaginationLink
          href={createSearchHref(
            query,
            page -
              1,
          )}
        >
          Página anterior
        </PaginationLink>
      ) : (
        <span />
      )}

      {page <
      totalPages ? (
        <PaginationLink
          href={createSearchHref(
            query,
            page +
              1,
          )}
        >
          Próxima página
        </PaginationLink>
      ) : (
        <span />
      )}
    </Box>
  );
}

type PaginationLinkProps = {
  href:
    string;

  children:
    string;
};

function PaginationLink({
  href,
  children,
}: PaginationLinkProps) {
  return (
    <Link
      href={href}
      className="
        inline-flex min-h-11
        items-center justify-center
        rounded-button border
        border-border bg-card
        px-5 text-sm
        font-semibold
        outline-none
        transition-colors
        hover:border-primary
        hover:text-primary
        focus-visible:ring-2
        focus-visible:ring-ring
      "
    >
      {children}
    </Link>
  );
}

function SearchPageLoading() {
  return (
    <div
      aria-label="Carregando busca"
      className="animate-pulse space-y-6"
    >
      <div className="h-56 rounded-card bg-surface-strong" />

      <div className="h-52 rounded-card bg-surface-strong" />

      <div className="h-52 rounded-card bg-surface-strong" />
    </div>
  );
}

function createSearchHref(
  query:
    string,

  page:
    number,
): string {
  const searchParams =
    new URLSearchParams({
      q:
        query,

      page:
        String(
          page,
        ),
    });

  return `/buscar?${searchParams.toString()}`;
}

function getSingleValue(
  value:
    string |
    string[] |
    undefined,
): string | undefined {
  return Array.isArray(
    value,
  )
    ? value[0]
    : value;
}

function parsePositiveInteger(
  value:
    string | undefined,
): number {
  const parsedValue =
    Number(
      value,
    );

  if (
    !Number.isInteger(
      parsedValue,
    ) ||
    parsedValue <
      1
  ) {
    return 1;
  }

  return parsedValue;
}
