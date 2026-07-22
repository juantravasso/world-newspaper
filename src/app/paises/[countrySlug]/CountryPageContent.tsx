import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  Box,
  CountryFlag,
  Hero,
  Text,
} from "@/components";

import {
  CountryStoryCard,
} from "@/components/sections/ExploreCountries/components/CountryLatestNews/components";

import {
  getNewsFromCountries,
  selectHeroNews,
} from "@/domain/news/news.helpers";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import {
  formatRelativeTime,
} from "@/server/news/story-presentation";

import {
  getCountryStoryPage,
} from "@/server/stories/story.discovery";

const categoryRouteSegments:
  Record<
    NewsCategory,
    string
  > = {
  football:
    "futebol",

  politics:
    "politica",

  economy:
    "economia",
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

const categoryByRouteSegment:
  Record<
    string,
    NewsCategory
  > = {
  futebol:
    "football",

  politica:
    "politics",

  economia:
    "economy",
};

export type CountryPageContentProps = {
  countrySlug:
    string;

  category?:
    NewsCategory;
};

export async function CountryPageContent({
  countrySlug,
  category,
}: CountryPageContentProps) {
  const data =
    await getCountryStoryPage(
      countrySlug,
      category,
    );

  if (!data) {
    notFound();
  }

  const visibleNews =
    getNewsFromCountries(
      [
        data.country,
      ],
      category,
    );

  const {
    featuredNews,
    secondaryNews,
  } =
    selectHeroNews(
      visibleNews,
    );

  const categoryName =
    category
      ? categoryLabels[
          category
        ]
      : null;

  const pageTitle =
    categoryName
      ? `${categoryName} em ${data.country.name}`
      : `Notícias de ${data.country.name}`;

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
        <Hero
          title={pageTitle}
          description={
            categoryName
              ? `Acompanhe as principais notícias de ${categoryName.toLowerCase()} publicadas por fontes de ${data.country.name}.`
              : `Acompanhe as principais notícias de ${data.country.name}, reunidas e organizadas a partir de diferentes fontes.`
          }
          featuredNews={
            featuredNews
          }
          secondaryNews={
            secondaryNews
          }
          emptyMessage={
            `Ainda não existem notícias disponíveis para ${data.country.name} nesta seleção.`
          }
          actions={
            <CountryCategoryNavigation
              countrySlug={
                data.country
                  .slug
              }
              selectedCategory={
                category
              }
            />
          }
        />

        <Box
          as="section"
          aria-label={`Resumo das notícias de ${data.country.name}`}
          className="
            mt-8 grid grid-cols-1
            gap-4 sm:grid-cols-3
          "
        >
          <StatCard
            label="Stories"
            value={String(
              data.totalStories,
            )}
          />

          <StatCard
            label="Fontes"
            value={String(
              data.sourceCount,
            )}
          />

          <StatCard
            label="Última publicação"
            value={
              formatRelativeTime(
                data.latestPublishedAtISO,
              )
            }
          />
        </Box>

        <Box
          as="section"
          aria-labelledby="country-stories-title"
          className="mt-12"
        >
          <Box
            display="flex"
            align="center"
            gap="sm"
          >
            <CountryFlag
              code={
                data.country.code
              }
              countryName={
                data.country.name
              }
              className="h-7 w-10"
            />

            <Text
              id="country-stories-title"
              preset="sectionTitle"
            >
              {categoryName
                ? `Todas as notícias de ${categoryName.toLowerCase()}`
                : "Todas as notícias recentes"}
            </Text>
          </Box>

          {data.country.stories
            .length >
          0 ? (
            <Box
              as="ul"
              className="
                mt-6 grid
                grid-cols-1 gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {data.country.stories.map(
                (story) => (
                  <Box
                    as="li"
                    key={
                      story.id
                    }
                    className="min-w-0"
                  >
                    <CountryStoryCard
                      story={
                        story
                      }
                    />
                  </Box>
                ),
              )}
            </Box>
          ) : (
            <Box
              background="surfaceMuted"
              border="default"
              radius="card"
              padding="xl"
              className="mt-6 text-center"
            >
              <Text preset="sectionTitle">
                Nenhuma notícia disponível
              </Text>

              <Text
                tone="muted"
                className="mt-2"
              >
                A próxima sincronização poderá
                adicionar novas notícias para
                este país.
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function parseCountryCategorySegment(
  value:
    string,
): NewsCategory | null {
  return (
    categoryByRouteSegment[
      value
        .trim()
        .toLowerCase()
    ] ??
    null
  );
}

export function CountryPageLoading() {
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
        <div
          aria-label="Carregando país"
          className="animate-pulse space-y-6"
        >
          <div className="h-[32rem] rounded-card bg-surface-strong" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-28 rounded-card bg-surface-strong" />
            <div className="h-28 rounded-card bg-surface-strong" />
            <div className="h-28 rounded-card bg-surface-strong" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-80 rounded-card bg-surface-strong" />
            <div className="h-80 rounded-card bg-surface-strong" />
            <div className="h-80 rounded-card bg-surface-strong" />
          </div>
        </div>
      </Box>
    </Box>
  );
}

type CountryCategoryNavigationProps = {
  countrySlug:
    string;

  selectedCategory?:
    NewsCategory;
};

function CountryCategoryNavigation({
  countrySlug,
  selectedCategory,
}: CountryCategoryNavigationProps) {
  return (
    <Box
      as="nav"
      aria-label="Categorias do país"
      display="flex"
      gap="xs"
      className="
        flex-wrap
        lg:justify-end
      "
    >
      <CategoryLink
        href={`/paises/${countrySlug}`}
        active={
          !selectedCategory
        }
      >
        Todas
      </CategoryLink>

      {(
        Object.keys(
          categoryRouteSegments,
        ) as
          NewsCategory[]
      ).map(
        (category) => (
          <CategoryLink
            key={
              category
            }
            href={`/paises/${countrySlug}/${categoryRouteSegments[category]}`}
            active={
              selectedCategory ===
              category
            }
          >
            {
              categoryLabels[
                category
              ]
            }
          </CategoryLink>
        ),
      )}
    </Box>
  );
}

type CategoryLinkProps = {
  href:
    string;

  active:
    boolean;

  children:
    string;
};

function CategoryLink({
  href,
  active,
  children,
}: CategoryLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-10 items-center justify-center rounded-pill border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

type StatCardProps = {
  label:
    string;

  value:
    string;
};

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <Box
      background="card"
      border="default"
      radius="card"
      padding="lg"
    >
      <Text
        preset="eyebrow"
        tone="subtle"
      >
        {label}
      </Text>

      <Text
        preset="sectionTitle"
        className="mt-2"
      >
        {value}
      </Text>
    </Box>
  );
}
