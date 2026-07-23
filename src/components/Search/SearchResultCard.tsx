import Link from "next/link";

import {
  Box,
  CountryFlag,
  EditorialImage,
  Text,
} from "@/components";

import {
  SaveStoryButton,
} from "@/components/ReaderLibrary/SaveStoryButton";

import type {
  StoryDiscoveryItem,
} from "@/server/stories/story.discovery";

export type SearchResultCardProps = {
  item:
    StoryDiscoveryItem;
};

export function SearchResultCard({
  item,
}: SearchResultCardProps) {
  return (
    <article
      className="
        relative overflow-hidden
        rounded-card border
        border-border bg-card
        transition-transform
        hover:-translate-y-1
      "
    >
      <Link
        href={`/noticias/${item.story.id}`}
        prefetch={false}
        className="
          group block outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        <div
          className="
            grid min-h-full
            grid-cols-1
            md:grid-cols-[15rem_minmax(0,1fr)]
          "
        >
          <EditorialImage
            src={
              item.story.imageUrl
            }
            alt={
              item.story.headline
            }
            sizes="
              (min-width: 768px) 240px,
              100vw
            "
            className="
              aspect-video w-full
              md:aspect-auto md:min-h-52
            "
            fallback={
              <div
                className="
                  flex h-full min-h-48
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

          <Box
            padding="lg"
            className="pr-16"
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
                  item.story
                    .categoryLabel
                }
              </Text>

              <Box
                display="flex"
                align="center"
                gap="xs"
              >
                <CountryFlag
                  code={
                    item.country.code
                  }
                  countryName={
                    item.country.name
                  }
                  className="h-4 w-6"
                />

                <Text
                  as="span"
                  preset="metadata"
                  tone="subtle"
                >
                  {
                    item.country.name
                  }
                </Text>
              </Box>
            </Box>

            <Text
              preset="articleTitle"
              clamp={3}
              className="
                mt-3
                transition-colors
                group-hover:text-primary
              "
            >
              {
                item.story.headline
              }
            </Text>

            <Text
              preset="bodySmall"
              tone="muted"
              clamp={3}
              className="mt-3"
            >
              {
                item.story.summary
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
        </div>
      </Link>

      <div
        className="
          absolute right-3 top-3
          z-30
        "
      >
        <SaveStoryButton
          storyId={
            item.story.id
          }
          compact
        />
      </div>
    </article>
  );
}
