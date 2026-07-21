import Link from "next/link";

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
      href={`/noticias/${encodeURIComponent(
        story.id,
      )}`}
      className="block h-full rounded-card border p-5"
    >
      <article>
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
      </article>
    </Link>
  );
}