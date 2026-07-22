import Link from "next/link";

import {
  EditorialImage,
} from "@/components/EditorialImage";

import type {
  NewsStory,
} from "@/domain/news/story.types";

type CountryStoryCardProps = {
  story: NewsStory;
};

export function CountryStoryCard({
  story,
}: CountryStoryCardProps) {
  const sources =
    new Set(
      story.articles.map(
        (article) =>
          article.sourceId,
      ),
    ).size;

  return (
    <Link
      href={`/noticias/${story.id}`}
      prefetch={false}
      className="
        block h-full
        overflow-hidden
        rounded-card border
        outline-none
        transition-transform
        hover:-translate-y-1
        focus-visible:ring-2
        focus-visible:ring-ring
      "
    >
      <article className="h-full">
        <EditorialImage
          src={story.imageUrl}
          alt={story.headline}
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
              {story.categoryLabel}
            </div>
          }
        />

        <div className="p-5">
          <span className="text-sm font-semibold text-primary">
            {story.categoryLabel}
          </span>

          <h3 className="mt-3 text-xl font-bold">
            {story.headline}
          </h3>

          <p className="mt-3 text-sm text-muted-foreground">
            {story.summary}
          </p>

          <p className="mt-5 text-sm text-muted-foreground">
            {sources === 1
              ? "1 fonte"
              : `${sources} fontes`}
          </p>
        </div>
      </article>
    </Link>
  );
}