import Link from "next/link";

import type {
  NewsStory,
} from "@/domain/news/story.types";

type StoryDetailsProps = {
  story: NewsStory;
};

export function StoryDetails({
  story,
}: StoryDetailsProps) {
  return (
    <article className="space-y-8">
      <header>
        <span className="text-sm font-semibold text-primary">
          {story.categoryLabel}
        </span>

        <h1 className="mt-3 text-3xl font-bold">
          {story.headline}
        </h1>

        <p className="mt-4 text-muted-foreground">
          {story.summary}
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">
          Diferentes fontes
        </h2>

        <div className="mt-4 space-y-4">
          {story.articles.map(
            (article) => (
              <div
                key={article.id}
                className="rounded-card border p-5"
              >
                <p className="text-sm font-semibold">
                  {article.sourceName}
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  {article.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>

                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-semibold text-primary"
                >
                  Ler na fonte original
                </Link>
              </div>
            ),
          )}
        </div>
      </section>
    </article>
  );
}