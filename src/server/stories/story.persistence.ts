import type {
  CountryCode,
} from "@/domain/news/news.types";

import type {
  NewsArticle,
  NewsStory,
} from "@/domain/news/story.types";

import type {
  Article as StoredArticle,
  Story as StoredStory,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/server/database/prisma";

const PERSISTENCE_BATCH_SIZE =
  20;

const categoryLabels:
  Record<
    NewsStory["category"],
    string
  > = {
  football:
    "Futebol",

  politics:
    "Política",

  economy:
    "Economia",
};

type StoredStoryWithArticles =
  StoredStory & {
    articles:
      StoredArticle[];
  };

export type SaveStoriesResult = {
  storiesSaved: number;
  articlesSaved: number;
};

/**
 * Salva ou atualiza stories e matérias.
 *
 * O upsert permite executar a sincronização
 * repetidamente sem criar registros duplicados.
 */
export async function saveStories(
  stories:
    NewsStory[],
): Promise<SaveStoriesResult> {
  const uniqueStories =
    removeDuplicateStories(
      stories,
    );

  const savedArticleIds =
    new Set<string>();

  const seenAt =
    new Date();

  for (
    let start = 0;
    start < uniqueStories.length;
    start +=
      PERSISTENCE_BATCH_SIZE
  ) {
    const batch =
      uniqueStories.slice(
        start,
        start +
          PERSISTENCE_BATCH_SIZE,
      );

    await prisma.$transaction(
      async (transaction) => {
        for (
          const story of
          batch
        ) {
          await transaction.story.upsert({
            where: {
              id:
                story.id,
            },

            create: {
              id:
                story.id,

              headline:
                story.headline,

              summary:
                story.summary,

              category:
                story.category,

              countryCode:
                story.countryCode,

              imageUrl:
                story.imageUrl ??
                null,

              publishedAt:
                parseDate(
                  story.publishedAtISO,
                ),

              lastSeenAt:
                seenAt,
            },

            update: {
              headline:
                story.headline,

              summary:
                story.summary,

              category:
                story.category,

              countryCode:
                story.countryCode,

              imageUrl:
                story.imageUrl ??
                null,

              publishedAt:
                parseDate(
                  story.publishedAtISO,
                ),

              lastSeenAt:
                seenAt,
            },
          });

          for (
            const article of
            story.articles
          ) {
            savedArticleIds.add(
              article.id,
            );

            await transaction.article.upsert({
              where: {
                id:
                  article.id,
              },

              create: {
                id:
                  article.id,

                storyId:
                  story.id,

                sourceId:
                  article.sourceId,

                sourceName:
                  article.sourceName,

                title:
                  article.title,

                excerpt:
                  article.excerpt,

                url:
                  article.url,

                imageUrl:
                  article.imageUrl ??
                  null,

                category:
                  article.category,

                countryCode:
                  article.countryCode,

                language:
                  article.language,

                publishedAt:
                  parseDate(
                    article.publishedAtISO,
                  ),

                lastSeenAt:
                  seenAt,
              },

              update: {
                storyId:
                  story.id,

                sourceId:
                  article.sourceId,

                sourceName:
                  article.sourceName,

                title:
                  article.title,

                excerpt:
                  article.excerpt,

                url:
                  article.url,

                imageUrl:
                  article.imageUrl ??
                  null,

                category:
                  article.category,

                countryCode:
                  article.countryCode,

                language:
                  article.language,

                publishedAt:
                  parseDate(
                    article.publishedAtISO,
                  ),

                lastSeenAt:
                  seenAt,
              },
            });
          }
        }
      },
    );
  }

  return {
    storiesSaved:
      uniqueStories.length,

    articlesSaved:
      savedArticleIds.size,
  };
}

/**
 * Retorna todas as stories persistidas,
 * ordenadas da mais recente para a mais antiga.
 */
export async function findStoredStories():
  Promise<NewsStory[]> {
  const storedStories =
    await prisma.story.findMany({
      include: {
        articles: {
          orderBy: [
            {
              publishedAt:
                "desc",
            },
            {
              id:
                "asc",
            },
          ],
        },
      },

      orderBy: [
        {
          publishedAt:
            "desc",
        },
        {
          id:
            "asc",
        },
      ],
    });

  return storedStories.map(
    mapStoredStoryToDomain,
  );
}

/**
 * Busca uma story diretamente no PostgreSQL.
 */
export async function findStoredStoryById(
  storyId:
    string,
): Promise<NewsStory | null> {
  const storedStory =
    await prisma.story.findUnique({
      where: {
        id:
          storyId,
      },

      include: {
        articles: {
          orderBy: [
            {
              publishedAt:
                "desc",
            },
            {
              id:
                "asc",
            },
          ],
        },
      },
    });

  if (!storedStory) {
    return null;
  }

  return mapStoredStoryToDomain(
    storedStory,
  );
}

function removeDuplicateStories(
  stories:
    NewsStory[],
): NewsStory[] {
  const storiesById =
    new Map<
      string,
      NewsStory
    >();

  for (
    const story of
    stories
  ) {
    storiesById.set(
      story.id,
      story,
    );
  }

  return [
    ...storiesById.values(),
  ];
}

function mapStoredStoryToDomain(
  storedStory:
    StoredStoryWithArticles,
): NewsStory {
  return {
    id:
      storedStory.id,

    headline:
      storedStory.headline,

    summary:
      storedStory.summary,

    category:
      storedStory.category,

    categoryLabel:
      categoryLabels[
        storedStory.category
      ],

    countryCode:
      storedStory.countryCode as
        CountryCode,

    imageUrl:
      storedStory.imageUrl ??
      undefined,

    publishedAtISO:
      storedStory.publishedAt
        ?.toISOString() ??
      null,

    articles:
      storedStory.articles.map(
        mapStoredArticleToDomain,
      ),
  };
}

function mapStoredArticleToDomain(
  storedArticle:
    StoredArticle,
): NewsArticle {
  return {
    id:
      storedArticle.id,

    sourceId:
      storedArticle.sourceId,

    sourceName:
      storedArticle.sourceName,

    title:
      storedArticle.title,

    excerpt:
      storedArticle.excerpt,

    url:
      storedArticle.url,

    imageUrl:
      storedArticle.imageUrl ??
      undefined,

    category:
      storedArticle.category,

    countryCode:
      storedArticle.countryCode as
        CountryCode,

    language:
      storedArticle.language,

    publishedAtISO:
      storedArticle.publishedAt
        ?.toISOString() ??
      null,
  };
}

function parseDate(
  value:
    string | null,
): Date | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}