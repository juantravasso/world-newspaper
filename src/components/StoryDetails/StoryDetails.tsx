import Link from "next/link";

import {
  Box,
} from "@/components/Box";

import {
  CountryFlag,
} from "@/components/CountryFlag";

import {
  EditorialImage,
} from "@/components/EditorialImage";

import {
  Text,
} from "@/components/Text";

import {
  formatRelativeTime,
} from "@/server/news/story-presentation";

import type {
  StoryReaderData,
  StoryReaderNavigationItem,
  StoryReaderRelatedItem,
} from "@/server/stories/story.reader";

import {
  ShareActions,
} from "./ShareActions";

export type StoryDetailsVariant =
  | "page"
  | "modal";

export type StoryDetailsProps = {
  data:
    StoryReaderData;

  variant?:
    StoryDetailsVariant;
};

const categoryRoutes =
  {
    football:
      "/futebol",

    politics:
      "/politica",

    economy:
      "/economia",
  } as const;

export function StoryDetails({
  data,
  variant =
    "page",
}: StoryDetailsProps) {
  const {
    story,
    country,
    sourceCount,
    publishedAtLabel,
    relatedStories,
    newerStory,
    olderStory,
  } = data;

  const heroImage =
    story.imageUrl ??
    story.articles.find(
      (article) =>
        article.imageUrl,
    )
      ?.imageUrl;

  const isFullPage =
    variant ===
    "page";

  return (
    <article>
      <StoryBreadcrumbs
        categoryLabel={
          story.categoryLabel
        }
        categoryHref={
          categoryRoutes[
            story.category
          ]
        }
        country={
          country
        }
      />

      <Box
        as="header"
        background="card"
        border="default"
        radius="card"
        overflow="hidden"
        className="mt-5"
      >
        <Box
          padding="xl"
          className="
            grid grid-cols-1
            gap-8
            lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]
            lg:items-center
          "
        >
          <Box
            preset="stack"
            gap="md"
          >
            <Box
              display="flex"
              align="center"
              gap="sm"
              className="flex-wrap"
            >
              <Text
                as="span"
                preset="categoryLabel"
                tone="accent"
              >
                {
                  story.categoryLabel
                }
              </Text>

              {country && (
                <Link
                  href={`/paises/${country.slug}`}
                  className="
                    inline-flex
                    items-center gap-2
                    rounded-control
                    outline-none
                    transition-opacity
                    hover:opacity-70
                    focus-visible:ring-2
                    focus-visible:ring-ring
                  "
                >
                  <CountryFlag
                    code={
                      country.code
                    }
                    countryName={
                      country.name
                    }
                    className="h-4 w-6"
                  />

                  <Text
                    as="span"
                    preset="metadata"
                    tone="subtle"
                  >
                    {
                      country.name
                    }
                  </Text>
                </Link>
              )}
            </Box>

            <Text
              preset="display"
              wrap="balance"
              className="
                text-4xl
                sm:text-5xl
                lg:text-[3.5rem]
              "
            >
              {
                story.headline
              }
            </Text>

            <Text
              preset="bodyLarge"
              tone="muted"
              wrap="pretty"
            >
              {
                story.summary
              }
            </Text>

            <Box
              display="flex"
              align="center"
              gap="sm"
              className="
                flex-wrap
                border-t
                border-border pt-4
              "
            >
              <Text
                preset="metadata"
                tone="subtle"
              >
                {
                  publishedAtLabel
                }
              </Text>

              <span
                aria-hidden="true"
                className="
                  h-1 w-1
                  rounded-full
                  bg-subtle-foreground
                "
              />

              <Text
                preset="metadata"
                tone="subtle"
              >
                {sourceCount ===
                1
                  ? "1 fonte relacionada"
                  : `${sourceCount} fontes relacionadas`}
              </Text>

              <span
                aria-hidden="true"
                className="
                  h-1 w-1
                  rounded-full
                  bg-subtle-foreground
                "
              />

              <Text
                preset="metadata"
                tone="subtle"
              >
                {story.articles.length ===
                1
                  ? "1 matéria"
                  : `${story.articles.length} matérias`}
              </Text>
            </Box>

            <ShareActions
              title={
                story.headline
              }
              summary={
                story.summary
              }
            />
          </Box>

          <EditorialImage
            src={
              heroImage
            }
            alt={
              story.headline
            }
            sizes="
              (min-width: 1024px) 40vw,
              100vw
            "
            priority={
              isFullPage
            }
            className="
              aspect-[4/3] w-full
              rounded-card-small
              border border-border
            "
            fallback={
              <div
                className="
                  flex h-full
                  items-center
                  justify-center
                  bg-surface-strong
                  px-8 text-center
                "
              >
                <Box
                  preset="stack"
                  gap="sm"
                  align="center"
                >
                  <Text
                    preset="eyebrow"
                    tone="accent"
                  >
                    {
                      story.categoryLabel
                    }
                  </Text>

                  <Text
                    preset="sectionTitle"
                    tone="muted"
                    align="center"
                  >
                    Diferentes fontes,
                    uma história organizada
                  </Text>
                </Box>
              </div>
            }
          />
        </Box>
      </Box>

      <SourceComparison
        data={
          data
        }
      />

      {isFullPage && (
        <>
          <RelatedStories
            items={
              relatedStories
            }
          />

          <StoryNavigation
            newerStory={
              newerStory
            }
            olderStory={
              olderStory
            }
          />
        </>
      )}
    </article>
  );
}

type StoryBreadcrumbsProps = {
  categoryLabel:
    string;

  categoryHref:
    string;

  country:
    StoryReaderData["country"];
};

function StoryBreadcrumbs({
  categoryLabel,
  categoryHref,
  country,
}: StoryBreadcrumbsProps) {
  return (
    <nav
      aria-label="Caminho da notícia"
      className="
        flex flex-wrap
        items-center gap-2
        text-sm
      "
    >
      <Link
        href="/"
        className="
          text-muted-foreground
          transition-colors
          hover:text-primary
        "
      >
        Início
      </Link>

      <span
        aria-hidden="true"
        className="text-subtle-foreground"
      >
        /
      </span>

      <Link
        href={categoryHref}
        className="
          text-muted-foreground
          transition-colors
          hover:text-primary
        "
      >
        {categoryLabel}
      </Link>

      {country && (
        <>
          <span
            aria-hidden="true"
            className="text-subtle-foreground"
          >
            /
          </span>

          <Link
            href={`/paises/${country.slug}`}
            className="
              text-muted-foreground
              transition-colors
              hover:text-primary
            "
          >
            {
              country.name
            }
          </Link>
        </>
      )}
    </nav>
  );
}

type SourceComparisonProps = {
  data:
    StoryReaderData;
};

function SourceComparison({
  data,
}: SourceComparisonProps) {
  return (
    <Box
      as="section"
      aria-labelledby="source-comparison-title"
      className="mt-12"
    >
      <Box
        preset="stack"
        gap="xs"
      >
        <Text
          id="source-comparison-title"
          preset="sectionTitle"
        >
          Compare as fontes
        </Text>

        <Text
          tone="muted"
          className="max-w-3xl"
        >
          A mesma história pode receber
          títulos, recortes e níveis de
          detalhe diferentes. Abra as
          matérias originais para comparar
          a cobertura diretamente.
        </Text>
      </Box>

      <Box
        as="ol"
        className="
          mt-6 grid grid-cols-1
          gap-5
          lg:grid-cols-2
        "
      >
        {data.story.articles.map(
          (
            article,
            index,
          ) => (
            <Box
              as="li"
              key={
                article.id
              }
              background="card"
              border="default"
              radius="card"
              padding="lg"
              className="min-w-0"
            >
              <Box
                display="flex"
                align="start"
                justify="between"
                gap="md"
              >
                <Box
                  display="flex"
                  align="center"
                  gap="sm"
                  className="min-w-0"
                >
                  <span
                    className="
                      inline-flex h-9 w-9
                      shrink-0 items-center
                      justify-center
                      rounded-full
                      bg-primary-soft
                      text-sm font-bold
                      text-primary
                    "
                  >
                    {index + 1}
                  </span>

                  <Box className="min-w-0">
                    <Text
                      preset="label"
                      clamp={1}
                    >
                      {
                        article.sourceName
                      }
                    </Text>

                    <Text
                      preset="metadata"
                      tone="subtle"
                      className="mt-1"
                    >
                      {
                        article.language
                          .toUpperCase()
                      }
                      {" · "}
                      {
                        formatRelativeTime(
                          article.publishedAtISO,
                        )
                      }
                    </Text>
                  </Box>
                </Box>

                <Text
                  as="span"
                  preset="categoryLabel"
                  tone="accent"
                  className="shrink-0"
                >
                  {
                    article.category ===
                    "football"
                      ? "Futebol"
                      : article.category ===
                          "politics"
                        ? "Política"
                        : "Economia"
                  }
                </Text>
              </Box>

              <Text
                preset="articleTitle"
                wrap="pretty"
                className="mt-5"
              >
                {
                  article.title
                }
              </Text>

              <Text
                preset="bodySmall"
                tone="muted"
                wrap="pretty"
                className="mt-3"
              >
                {
                  article.excerpt
                }
              </Text>

              <a
                href={
                  article.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-6 inline-flex
                  min-h-10 items-center
                  rounded-button
                  bg-brand px-4
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
                Ler na fonte original ↗
              </a>
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}

type RelatedStoriesProps = {
  items:
    StoryReaderRelatedItem[];
};

function RelatedStories({
  items,
}: RelatedStoriesProps) {
  if (
    items.length ===
    0
  ) {
    return null;
  }

  return (
    <Box
      as="section"
      aria-labelledby="related-stories-title"
      className="mt-14"
    >
      <Text
        id="related-stories-title"
        preset="sectionTitle"
      >
        Continue acompanhando
      </Text>

      <Text
        tone="muted"
        className="mt-2 max-w-3xl"
      >
        Stories relacionadas pelo país,
        pela categoria e pela proximidade
        de publicação.
      </Text>

      <Box
        as="ul"
        className="
          mt-6 grid grid-cols-1
          gap-5 md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {items.map(
          (item) => (
            <Box
              as="li"
              key={
                item.story.id
              }
              className="min-w-0"
            >
              <Link
                href={`/noticias/${encodeURIComponent(
                  item.story.id,
                )}`}
                prefetch={false}
                className="
                  group block h-full
                  overflow-hidden
                  rounded-card border
                  border-border bg-card
                  outline-none
                  transition-transform
                  hover:-translate-y-1
                  focus-visible:ring-2
                  focus-visible:ring-ring
                "
              >
                <article className="h-full">
                  <EditorialImage
                    src={
                      item.story
                        .imageUrl
                    }
                    alt={
                      item.story
                        .headline
                    }
                    sizes="
                      (min-width: 1280px) 33vw,
                      (min-width: 768px) 50vw,
                      100vw
                    "
                    className="aspect-video w-full"
                    fallback={
                      <div
                        className="
                          flex h-full
                          items-center
                          justify-center
                          bg-surface-strong
                          px-6 text-center
                          text-sm font-semibold
                          text-muted-foreground
                        "
                      >
                        {
                          item.story
                            .categoryLabel
                        }
                      </div>
                    }
                  />

                  <Box padding="lg">
                    <Box
                      display="flex"
                      align="center"
                      justify="between"
                      gap="sm"
                    >
                      <Text
                        as="span"
                        preset="categoryLabel"
                        tone="accent"
                      >
                        {
                          item.story
                            .categoryLabel
                        }
                      </Text>

                      <Box
                        display="flex"
                        align="center"
                        gap="xs"
                        className="min-w-0"
                      >
                        <CountryFlag
                          code={
                            item.country
                              .code
                          }
                          countryName={
                            item.country
                              .name
                          }
                          className="h-4 w-6"
                        />

                        <Text
                          as="span"
                          preset="metadata"
                          tone="subtle"
                          clamp={1}
                        >
                          {
                            item.country
                              .name
                          }
                        </Text>
                      </Box>
                    </Box>

                    <Text
                      preset="cardTitle"
                      clamp={3}
                      className="
                        mt-3
                        transition-colors
                        group-hover:text-primary
                      "
                    >
                      {
                        item.story
                          .headline
                      }
                    </Text>

                    <Text
                      preset="metadata"
                      tone="subtle"
                      className="mt-5"
                    >
                      {item.sourceCount ===
                      1
                        ? "1 fonte"
                        : `${item.sourceCount} fontes`}
                      {" · "}
                      {
                        item.publishedAtLabel
                      }
                    </Text>
                  </Box>
                </article>
              </Link>
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
}

type StoryNavigationProps = {
  newerStory:
    StoryReaderNavigationItem | null;

  olderStory:
    StoryReaderNavigationItem | null;
};

function StoryNavigation({
  newerStory,
  olderStory,
}: StoryNavigationProps) {
  if (
    !newerStory &&
    !olderStory
  ) {
    return null;
  }

  return (
    <Box
      as="nav"
      aria-label="Navegação entre notícias"
      className="
        mt-14 grid grid-cols-1
        gap-4 md:grid-cols-2
      "
    >
      {newerStory ? (
        <StoryNavigationLink
          story={
            newerStory
          }
          label="Notícia mais recente"
          direction="previous"
        />
      ) : (
        <span />
      )}

      {olderStory ? (
        <StoryNavigationLink
          story={
            olderStory
          }
          label="Notícia anterior"
          direction="next"
        />
      ) : (
        <span />
      )}
    </Box>
  );
}

type StoryNavigationLinkProps = {
  story:
    StoryReaderNavigationItem;

  label:
    string;

  direction:
    "previous" |
    "next";
};

function StoryNavigationLink({
  story,
  label,
  direction,
}: StoryNavigationLinkProps) {
  return (
    <Link
      href={`/noticias/${encodeURIComponent(
        story.id,
      )}`}
      prefetch={false}
      className={[
        "block rounded-card border border-border bg-card p-5 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        direction ===
        "next"
          ? "md:text-right"
          : "",
      ].join(
        " ",
      )}
    >
      <Text
        preset="eyebrow"
        tone="subtle"
      >
        {direction ===
        "previous"
          ? "← "
          : ""}
        {label}
        {direction ===
        "next"
          ? " →"
          : ""}
      </Text>

      <Text
        preset="cardTitle"
        clamp={2}
        className="mt-2"
      >
        {
          story.headline
        }
      </Text>

      <Text
        preset="metadata"
        tone="subtle"
        className="mt-3"
      >
        {
          story.country
            ?.name ??
          story.categoryLabel
        }
      </Text>
    </Link>
  );
}
