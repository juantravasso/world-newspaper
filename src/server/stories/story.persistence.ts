import type {
  CountryCode,
  NewsCategory,
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
  5;

const categoryLabels:
  Record<
    NewsStory["category"],
    string
  > = {
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

export type DeleteExpiredStoriesResult = {
  storiesDeleted: number;
  cutoffISO: string;
};

export type StoryStorageStats = {
  stories: number;
  articles: number;

  newestPublishedAtISO:
    string | null;

  oldestPublishedAtISO:
    string | null;

  latestSeenAtISO:
    string | null;
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
 * Retorna a imagem já persistida (se houver) para
 * cada id de story informado. Usado para evitar
 * buscar uma imagem de novo em toda sincronização.
 */
export async function findStoredStoryImages(
  storyIds:
    string[],
): Promise<
  Map<
    string,
    string
  >
> {
  if (
    storyIds.length ===
    0
  ) {
    return new Map();
  }

  const rows =
    await prisma.story.findMany({
      where: {
        id: {
          in:
            storyIds,
        },

        imageUrl: {
          not:
            null,
        },
      },

      select: {
        id:
          true,

        imageUrl:
          true,
      },
    });

  return new Map(
    rows.map(
      (row) =>
        [
          row.id,
          row.imageUrl as
            string,
        ] as const,
    ),
  );
}

/**
 * Busca a tradução em português já persistida
 * (se houver) para cada id de story informado.
 * Quando não existe ainda, o chamador continua
 * mostrando o texto no idioma original — nunca
 * um erro.
 */
export async function findPortugueseTranslations(
  storyIds:
    string[],
): Promise<
  Map<
    string,
    {
      headline:
        string;

      summary:
        string;
    }
  >
> {
  if (
    storyIds.length ===
    0
  ) {
    return new Map();
  }

  const rows =
    await prisma.storyTranslation.findMany(
      {
        where: {
          storyId: {
            in:
              storyIds,
          },

          language:
            "pt",
        },

        select: {
          storyId:
            true,

          headline:
            true,

          summary:
            true,
        },
      },
    );

  return new Map(
    rows.map(
      (row) =>
        [
          row.storyId,
          {
            headline:
              row.headline,

            summary:
              row.summary,
          },
        ] as const,
    ),
  );
}

/**
 * Lista os códigos de país que têm ao menos uma
 * story persistida, sem trazer as stories em si.
 */
export async function listStoredStoryCountryCodes():
  Promise<CountryCode[]> {
  const rows =
    await prisma.story.findMany({
      distinct: [
        "countryCode",
      ],

      select: {
        countryCode:
          true,
      },
    });

  return rows.map(
    (row) =>
      row.countryCode as
        CountryCode,
  );
}

export type FindStoredStoriesOptions = {
  countryCode?:
    CountryCode;

  category?:
    NewsCategory;

  publishedAfter?:
    Date;

  take?:
    number;

  skip?:
    number;
};

/**
 * Retorna as stories persistidas, ordenadas da
 * mais recente para a mais antiga. Sem opções,
 * retorna a tabela inteira — prefira sempre
 * passar `countryCode`/`category`/`take` para
 * que o filtro e o limite sejam aplicados no
 * banco, e não em memória depois da busca.
 */
export async function findStoredStories(
  options:
    FindStoredStoriesOptions =
      {},
): Promise<NewsStory[]> {
  const storedStories =
    await prisma.story.findMany({
      where:
        buildStoredStoryWhere(
          options,
        ),

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

      take:
        options.take,

      skip:
        options.skip,
    });

  const translations =
    await findPortugueseTranslations(
      storedStories.map(
        (story) =>
          story.id,
      ),
    );

  return storedStories.map(
    (story) =>
      mapStoredStoryToDomain(
        story,
        translations.get(
          story.id,
        ) ??
          null,
      ),
  );
}

/**
 * Conta as stories persistidas que casam com o
 * mesmo filtro aceito por `findStoredStories`,
 * sem trazer as linhas do banco.
 */
export async function countStoredStories(
  options:
    Pick<
      FindStoredStoriesOptions,
      | "countryCode"
      | "category"
      | "publishedAfter"
    > =
      {},
): Promise<number> {
  return prisma.story.count({
    where:
      buildStoredStoryWhere(
        options,
      ),
  });
}

function buildStoredStoryWhere(
  options:
    Pick<
      FindStoredStoriesOptions,
      | "countryCode"
      | "category"
      | "publishedAfter"
    >,
) {
  return {
    /*
     * O futebol foi removido do site, mas as stories
     * antigas permanecem no banco (sem migration
     * destrutiva). Excluir a categoria aqui garante
     * que elas nunca voltem a aparecer em nenhuma
     * consulta, mesmo sem filtro de categoria.
     */
    category:
      options.category
        ? {
            equals:
              options.category,
          }
        : {
            not:
              "football" as const,
          },

    ...(options.countryCode
      ? {
          countryCode:
            options.countryCode,
        }
      : {}),

    ...(options.publishedAfter
      ? {
          publishedAt: {
            gte:
              options.publishedAfter,
          },
        }
      : {}),
  };
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

  if (
    !storedStory ||
    (
      storedStory.category as
        string
    ) ===
      "football"
  ) {
    return null;
  }

  const translations =
    await findPortugueseTranslations(
      [
        storedStory.id,
      ],
    );

  return mapStoredStoryToDomain(
    storedStory,
    translations.get(
      storedStory.id,
    ) ??
      null,
  );
}

/**
 * Remove stories que não apareceram nas
 * sincronizações mais recentes.
 *
 * Os artigos relacionados são removidos
 * automaticamente pelo onDelete Cascade
 * configurado no Prisma.
 */
export async function deleteStoriesNotSeenSince(
  cutoff:
    Date,
): Promise<DeleteExpiredStoriesResult> {
  const deletion =
    await prisma.story.deleteMany({
      where: {
        lastSeenAt: {
          lt:
            cutoff,
        },
      },
    });

  return {
    storiesDeleted:
      deletion.count,

    cutoffISO:
      cutoff.toISOString(),
  };
}

/**
 * Retorna um resumo do conteúdo armazenado.
 *
 * Será usado pelo endpoint interno de status.
 */
export async function getStoryStorageStats():
  Promise<StoryStorageStats> {
  const [
    stories,
    articles,
    newestStory,
    oldestStory,
    latestSeenStory,
  ] = await Promise.all([
    prisma.story.count(),

    prisma.article.count(),

    prisma.story.findFirst({
      where: {
        publishedAt: {
          not:
            null,
        },
      },

      orderBy: {
        publishedAt:
          "desc",
      },

      select: {
        publishedAt:
          true,
      },
    }),

    prisma.story.findFirst({
      where: {
        publishedAt: {
          not:
            null,
        },
      },

      orderBy: {
        publishedAt:
          "asc",
      },

      select: {
        publishedAt:
          true,
      },
    }),

    prisma.story.findFirst({
      orderBy: {
        lastSeenAt:
          "desc",
      },

      select: {
        lastSeenAt:
          true,
      },
    }),
  ]);

  return {
    stories,
    articles,

    newestPublishedAtISO:
      newestStory
        ?.publishedAt
        ?.toISOString() ??
      null,

    oldestPublishedAtISO:
      oldestStory
        ?.publishedAt
        ?.toISOString() ??
      null,

    latestSeenAtISO:
      latestSeenStory
        ?.lastSeenAt
        .toISOString() ??
      null,
  };
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

  translation:
    | {
        headline:
          string;

        summary:
          string;
      }
    | null =
    null,
): NewsStory {
  return {
    id:
      storedStory.id,

    headline:
      translation?.headline ??
      storedStory.headline,

    summary:
      translation?.summary ??
      storedStory.summary,

    translated:
      Boolean(
        translation,
      ),

    category:
      storedStory.category as
        NewsCategory,

    categoryLabel:
      categoryLabels[
        storedStory.category as
          NewsCategory
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
      storedArticle.category as
        NewsCategory,

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