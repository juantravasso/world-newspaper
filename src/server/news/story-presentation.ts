import type {
  CountryNewsCard,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

export function storyToCountryNewsCards(
  story:
    NewsStory,
): CountryNewsCard[] {
  const primaryArticle =
    story.articles[0];

  if (!primaryArticle) {
    return [];
  }

  return [
    {
      id:
        primaryArticle.id,

      title:
        story.headline,

      excerpt:
        story.summary,

      category:
        story.category,

      categoryLabel:
        story.categoryLabel,

      sourceId:
        primaryArticle.sourceId,

      source:
        createSourceLabel(
          story,
        ),

      publishedAt:
        formatRelativeTime(
          story.publishedAtISO ??
          primaryArticle.publishedAtISO,
        ),

      publishedAtISO:
        story.publishedAtISO ??
        primaryArticle.publishedAtISO,

      href:
        primaryArticle.url,

      imageUrl:
        story.imageUrl ??
        primaryArticle.imageUrl,
    },
  ];
}

export function getStorySourceCount(
  story:
    NewsStory,
): number {
  return new Set(
    story.articles.map(
      (article) =>
        article.sourceId,
    ),
  ).size;
}

export function formatRelativeTime(
  value:
    string | null,
): string {
  if (!value) {
    return "data não informada";
  }

  const publicationDate =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      publicationDate.getTime(),
    )
  ) {
    return "data não informada";
  }

  const difference =
    Date.now() -
    publicationDate.getTime();

  if (
    difference <=
    0
  ) {
    return "agora";
  }

  const minutes =
    Math.max(
      1,
      Math.floor(
        difference /
        60_000,
      ),
    );

  if (
    minutes <
    60
  ) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
      60,
    );

  if (
    hours <
    24
  ) {
    return `há ${hours} h`;
  }

  const days =
    Math.floor(
      hours /
      24,
    );

  return `há ${days} d`;
}

function createSourceLabel(
  story:
    NewsStory,
): string {
  const sourceNames = [
    ...new Set(
      story.articles
        .map(
          (article) =>
            article.sourceName,
        )
        .filter(Boolean),
    ),
  ];

  if (
    sourceNames.length ===
    0
  ) {
    return "Fonte não informada";
  }

  if (
    sourceNames.length ===
    1
  ) {
    return sourceNames[0];
  }

  return [
    sourceNames[0],
    `+${sourceNames.length - 1}`,
  ].join(" ");
}
