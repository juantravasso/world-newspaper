import {
  Suspense,
  type ReactNode,
} from "react";

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  Text,
} from "@/components/Text";

import {
  SearchResultCard,
} from "@/components/Search";

import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import {
  listCountryCatalog,
} from "@/server/countries/country-catalog";

import {
  getStoryTimeline,
} from "@/server/stories/story.timeline";

import type {
  StoryTimelineFilters,
  StoryTimelinePeriod,
} from "@/server/stories/story.timeline";

export const metadata:
  Metadata = {
  title:
    "Últimas notícias",

  description:
    "Acompanhe as notícias mais recentes por país, categoria e período no World Newspaper.",
};

type LatestNewsPageProps = {
  searchParams:
    Promise<{
      category?:
        string | string[];

      country?:
        string | string[];

      period?:
        string | string[];

      page?:
        string | string[];
    }>;
};

const categoryLabels:
  Record<
    NewsCategory,
    string
  > = {
  football:
    "Futebol",

  politics:
    "Política",

  economy:
    "Economia",
};

const periodLabels:
  Record<
    StoryTimelinePeriod,
    string
  > = {
  "24h":
    "Últimas 24 horas",

  "7d":
    "Últimos 7 dias",

  "30d":
    "Últimos 30 dias",

  all:
    "Todo o período",
};

export default function LatestNewsPage({
  searchParams,
}: LatestNewsPageProps) {
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
            <LatestNewsLoading />
          }
        >
          <LatestNewsContent
            searchParams={
              searchParams
            }
          />
        </Suspense>
      </Box>
    </Box>
  );
}

async function LatestNewsContent({
  searchParams,
}: LatestNewsPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseTimelineFilters(
      resolvedSearchParams,
    );

  const result =
    await getStoryTimeline(
      filters,
    );

  return (
    <>
      <Box
        as="section"
        aria-labelledby="latest-news-title"
        background="card"
        border="default"
        radius="card"
        padding="xl"
      >
        <Text
          id="latest-news-title"
          preset="pageTitle"
          wrap="balance"
        >
          Últimas notícias
        </Text>

        <Text
          preset="bodyLarge"
          tone="muted"
          className="mt-2 max-w-3xl"
        >
          Explore a linha do tempo mundial
          e refine o conteúdo por categoria,
          país ou período de publicação.
        </Text>

        <TimelineFilters
          filters={
            result.filters
          }
          countries={
            result.activeCountries
          }
        />
      </Box>

      <Box
        as="section"
        aria-labelledby="latest-results-title"
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
              id="latest-results-title"
              preset="sectionTitle"
            >
              Linha do tempo
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

          {result.totalPages >
            0 && (
            <Text
              preset="metadata"
              tone="subtle"
            >
              Página {result.page} de{" "}
              {result.totalPages}
            </Text>
          )}
        </Box>

        {result.items.length >
        0 ? (
          <>
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
              <TimelinePagination
                filters={
                  result.filters
                }
                page={
                  result.page
                }
                totalPages={
                  result.totalPages
                }
              />
            )}
          </>
        ) : (
          <Box
            background="surfaceMuted"
            border="default"
            radius="card"
            padding="xl"
            className="mt-6 text-center"
          >
            <Text preset="sectionTitle">
              Nenhuma notícia encontrada
            </Text>

            <Text
              tone="muted"
              className="mt-2"
            >
              Altere os filtros ou escolha
              todo o período para ampliar
              os resultados.
            </Text>

            <Link
              href="/noticias"
              className="
                mt-6 inline-flex
                min-h-11 items-center
                justify-center
                rounded-button
                bg-primary px-5
                text-sm font-semibold
                text-white
                outline-none
                transition-opacity
                hover:opacity-85
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              Limpar filtros
            </Link>
          </Box>
        )}
      </Box>
    </>
  );
}

type TimelineFiltersProps = {
  filters:
    StoryTimelineFilters;

  countries:
    ReturnType<
      typeof listCountryCatalog
    >;
};

function TimelineFilters({
  filters,
  countries,
}: TimelineFiltersProps) {
  return (
    <form
      action="/noticias"
      method="get"
      className="
        mt-7 grid grid-cols-1
        gap-4
        md:grid-cols-2
        xl:grid-cols-[1fr_1.3fr_1fr_auto]
        xl:items-end
      "
    >
      <FilterField
        label="Categoria"
        htmlFor="timeline-category"
      >
        <select
          id="timeline-category"
          name="category"
          defaultValue={
            filters.category ??
            ""
          }
          className={selectClassName}
        >
          <option value="">
            Todas as categorias
          </option>

          {(
            Object.keys(
              categoryLabels,
            ) as
              NewsCategory[]
          ).map(
            (category) => (
              <option
                key={
                  category
                }
                value={
                  category
                }
              >
                {
                  categoryLabels[
                    category
                  ]
                }
              </option>
            ),
          )}
        </select>
      </FilterField>

      <FilterField
        label="País"
        htmlFor="timeline-country"
      >
        <select
          id="timeline-country"
          name="country"
          defaultValue={
            filters.countryCode ??
            ""
          }
          className={selectClassName}
        >
          <option value="">
            Todos os países
          </option>

          {countries.map(
            (country) => (
              <option
                key={
                  country.code
                }
                value={
                  country.code
                }
              >
                {
                  country.name
                }
              </option>
            ),
          )}
        </select>
      </FilterField>

      <FilterField
        label="Período"
        htmlFor="timeline-period"
      >
        <select
          id="timeline-period"
          name="period"
          defaultValue={
            filters.period
          }
          className={selectClassName}
        >
          {(
            Object.keys(
              periodLabels,
            ) as
              StoryTimelinePeriod[]
          ).map(
            (period) => (
              <option
                key={
                  period
                }
                value={
                  period
                }
              >
                {
                  periodLabels[
                    period
                  ]
                }
              </option>
            ),
          )}
        </select>
      </FilterField>

      <Box
        display="flex"
        gap="sm"
        className="flex-wrap"
      >
        <button
          type="submit"
          className="
            min-h-12 rounded-button
            bg-primary px-6
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
          Aplicar filtros
        </button>

        <Link
          href="/noticias"
          className="
            inline-flex min-h-12
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
          Limpar
        </Link>
      </Box>
    </form>
  );
}

const selectClassName =
  "min-h-12 w-full rounded-control border border-border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type FilterFieldProps = {
  label:
    string;

  htmlFor:
    string;

  children:
    ReactNode;
};

function FilterField({
  label,
  htmlFor,
  children,
}: FilterFieldProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="
        flex flex-col gap-2
        text-sm font-semibold
      "
    >
      <span>
        {label}
      </span>

      {children}
    </label>
  );
}

type TimelinePaginationProps = {
  filters:
    StoryTimelineFilters;

  page:
    number;

  totalPages:
    number;
};

function TimelinePagination({
  filters,
  page,
  totalPages,
}: TimelinePaginationProps) {
  return (
    <Box
      as="nav"
      aria-label="Paginação das últimas notícias"
      display="flex"
      align="center"
      justify="between"
      gap="md"
      className="mt-8"
    >
      {page >
      1 ? (
        <PaginationLink
          href={
            createTimelineHref(
              filters,
              page -
                1,
            )
          }
        >
          Página anterior
        </PaginationLink>
      ) : (
        <span />
      )}

      {page <
      totalPages ? (
        <PaginationLink
          href={
            createTimelineHref(
              filters,
              page +
                1,
            )
          }
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

function LatestNewsLoading() {
  return (
    <div
      aria-label="Carregando últimas notícias"
      className="animate-pulse space-y-6"
    >
      <div className="h-72 rounded-card bg-surface-strong" />

      <div className="h-52 rounded-card bg-surface-strong" />

      <div className="h-52 rounded-card bg-surface-strong" />
    </div>
  );
}

function parseTimelineFilters(
  values:
    Awaited<
      LatestNewsPageProps[
        "searchParams"
      ]
    >,
): StoryTimelineFilters {
  const categoryValue =
    getSingleValue(
      values.category,
    );

  const countryValue =
    getSingleValue(
      values.country,
    )
      ?.toUpperCase();

  const periodValue =
    getSingleValue(
      values.period,
    );

  return {
    category:
      isNewsCategory(
        categoryValue,
      )
        ? categoryValue
        : undefined,

    countryCode:
      isCountryCode(
        countryValue,
      )
        ? countryValue
        : undefined,

    period:
      isTimelinePeriod(
        periodValue,
      )
        ? periodValue
        : "7d",

    page:
      parsePositiveInteger(
        getSingleValue(
          values.page,
        ),
      ),
  };
}

function createTimelineHref(
  filters:
    StoryTimelineFilters,

  page:
    number,
): string {
  const searchParams =
    new URLSearchParams();

  if (
    filters.category
  ) {
    searchParams.set(
      "category",
      filters.category,
    );
  }

  if (
    filters.countryCode
  ) {
    searchParams.set(
      "country",
      filters.countryCode,
    );
  }

  if (
    filters.period !==
    "7d"
  ) {
    searchParams.set(
      "period",
      filters.period,
    );
  }

  searchParams.set(
    "page",
    String(
      page,
    ),
  );

  return `/noticias?${searchParams.toString()}`;
}

function isNewsCategory(
  value:
    string | undefined,
): value is NewsCategory {
  return (
    value ===
      "football" ||
    value ===
      "politics" ||
    value ===
      "economy"
  );
}

function isCountryCode(
  value:
    string | undefined,
): value is CountryCode {
  if (!value) {
    return false;
  }

  return listCountryCatalog().some(
    (country) =>
      country.code ===
      value,
  );
}

function isTimelinePeriod(
  value:
    string | undefined,
): value is StoryTimelinePeriod {
  return (
    value ===
      "24h" ||
    value ===
      "7d" ||
    value ===
      "30d" ||
    value ===
      "all"
  );
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
