import Link from "next/link";

import {
  Box,
  CountryFlag,
  EditorialImage,
  Text,
} from "@/components";

import {
  getTrendingStories,
} from "@/server/stories/story.discovery";

export async function TrendingStories() {
  const stories =
    await getTrendingStories(
      6,
    );

  if (
    stories.length ===
    0
  ) {
    return null;
  }

  return (
    <Box
      as="section"
      aria-labelledby="trending-stories-title"
      className="mt-14 w-full"
    >
      <Box
        display="flex"
        direction="column"
        gap="lg"
        className="
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <Box
          preset="stack"
          gap="xs"
        >
          <Text
            id="trending-stories-title"
            preset="sectionTitle"
          >
            Em alta agora
          </Text>

          <Text
            tone="muted"
            className="max-w-2xl"
          >
            Os assuntos com mais fontes,
            mais matérias relacionadas e
            publicação mais recente.
          </Text>
        </Box>

        <form
          action="/buscar"
          method="get"
          className="
            flex w-full max-w-md
            items-center gap-2
          "
        >
          <label
            htmlFor="homepage-search"
            className="sr-only"
          >
            Buscar notícias
          </label>

          <input
            id="homepage-search"
            name="q"
            type="search"
            minLength={2}
            required
            placeholder="Busque um assunto ou país"
            className="
              min-h-11 min-w-0 flex-1
              rounded-control border
              border-border bg-card
              px-4 text-sm
              outline-none
              transition-shadow
              placeholder:text-subtle-foreground
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          />

          <button
            type="submit"
            className="
              min-h-11 shrink-0
              rounded-button
              bg-primary px-5
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
            Buscar
          </button>
        </form>
      </Box>

      <Box
        as="ol"
        className="
          mt-6 grid grid-cols-1
          gap-5 md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {stories.map(
          (
            item,
            index,
          ) => (
            <Box
              as="li"
              key={
                item.story.id
              }
              className="min-w-0"
            >
              <Link
                href={`/noticias/${item.story.id}`}
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
                          text-sm
                          font-semibold
                          text-muted-foreground
                        "
                      >
                        {
                          item.story
                            .categoryLabel
                        }
                      </div>
                    }
                  >
                    <span
                      className="
                        absolute left-4 top-4
                        inline-flex h-10 w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-brand
                        text-sm font-bold
                        text-white
                        shadow-floating
                      "
                    >
                      {index + 1}
                    </span>
                  </EditorialImage>

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
                      preset="bodySmall"
                      tone="muted"
                      clamp={3}
                      className="mt-3"
                    >
                      {
                        item.story
                          .summary
                      }
                    </Text>

                    <Text
                      preset="metadata"
                      tone="subtle"
                      className="mt-5"
                    >
                      {item.sourceCount === 1
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
