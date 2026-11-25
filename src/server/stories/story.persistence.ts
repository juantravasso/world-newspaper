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
  Prisma,
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

  await refreshStorySearchText(
    uniqueStories.map(
      (story) =>
        story.id,
    ),
  );

  return {
    storiesSaved:
      uniqueStories.length,

    articlesSaved:
      savedArticleIds.size,
  };
}

const SEARCH_REFRESH_BATCH_SIZE =
  500;

/**
 * Recalcula a coluna pesquisável a partir da
 * story, das matérias e da tradução PT, usando
 * a mesma função SQL da migration.
 */
export async function refreshStorySearchText(
  storyIds:
    string[],
): Promise<void> {
  for (
    let start = 0;
    start < storyIds.length;
    start +=
      SEARCH_REFRESH_BATCH_SIZE
  ) {
    const batch =
      storyIds.slice(
        start,
        start +
          SEARCH_REFRESH_BATCH_SIZE,
      );

    await prisma.$executeRaw`
      UPDATE "stories"
      SET "search_text" = COALESCE(story_search_document("id"), '')
      WHERE "id" = ANY(${batch}::text[])
    `;
  }
}

export type StorySearchPage = {
  total:
    number;

  stories:
    NewsStory[];
};

/**
 * Busca por trecho (sem acento, sem caixa) no texto
 * pesquisável, ou por país quando o termo é o nome
 * de um país. Mesma ordenação das listagens.
 */
export async function searchStoredStories(
  {
    query,
    countryCodes,
    take,
    skip,
  }: {
    query:
      string;

    countryCodes:
      CountryCode[];

    take:
      number;

    skip:
      number;
  },
): Promise<StorySearchPage> {
  const matches =
    Prisma.sql`
      "category" <> 'football'
      AND (
        "search_text" LIKE '%' || story_search_normalize(${query}) || '%'
        OR "country_code" = ANY(${countryCodes}::text[])
      )
    `;

  const [
    countRows,
    idRows,
  ] =
    await Promise.all(
      [
        prisma.$queryRaw<
          {
            total:
              number;
          }[]
        >`
          SELECT count(*)::int AS "total"
          FROM "stories"
          WHERE ${matches}
        `,

        prisma.$queryRaw<
          {
            id:
              string;
          }[]
        >`
          SELECT "id"
          FROM "stories"
          WHERE ${matches}
          ORDER BY "published_at" DESC NULLS FIRST, "id" ASC
          LIMIT ${take}
          OFFSET ${skip}
        `,
      ],
    );

  return {
    total:
      countRows[0]
        ?.total ??
      0,

    stories:
      await findStoredStoriesByIds(
        idRows.map(
          (row) =>
            row.id,
        ),
      ),
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
 * Busca stories por id, preservando a ordem dos ids
 * recebidos. Ids inexistentes (ou de futebol) são
 * ignorados.
 */
export async function findStoredStoriesByIds(
  storyIds:
    string[],
): Promise<NewsStory[]> {
  if (
    storyIds.length ===
    0
  ) {
    return [];
  }

  const storedStories =
    await prisma.story.findMany({
      where: {
        ...buildStoredStoryWhere(
          {},
        ),

        id: {
          in:
            storyIds,
        },
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

  const translations =
    await findPortugueseTranslations(
      storedStories.map(
        (story) =>
          story.id,
      ),
    );

  const storiesById =
    new Map(
      storedStories.map(
        (story) =>
          [
            story.id,
            mapStoredStoryToDomain(
              story,
              translations.get(
                story.id,
              ) ??
                null,
            ),
          ] as const,
      ),
    );

  return storyIds.flatMap(
    (storyId) => {
      const story =
        storiesById.get(
          storyId,
        );

      return story
        ? [
            story,
          ]
        : [];
    },
  );
}

/**
 * Stories imediatamente antes e depois de
 * `story` na mesma ordem usada pelas listagens
 * (publishedAt desc, id asc). Stories sem data
 * não têm vizinhas bem definidas.
 */
export async function findAdjacentStories(
  story:
    NewsStory,
): Promise<{
  newer:
    NewsStory | null;

  older:
    NewsStory | null;
}> {
  if (
    !story.publishedAtISO
  ) {
    return {
      newer:
        null,

      older:
        null,
    };
  }

  const publishedAt =
    new Date(
      story.publishedAtISO,
    );

  const baseWhere =
    buildStoredStoryWhere(
      {},
    );

  const include = {
    articles: {
      orderBy: [
        {
          publishedAt:
            "desc" as const,
        },
        {
          id:
            "asc" as const,
        },
      ],
    },
  };

  const [
    newer,
    older,
  ] =
    await Promise.all(
      [
        prisma.story.findFirst({
          where: {
            ...baseWhere,

            OR: [
              {
                publishedAt: {
                  gt:
                    publishedAt,
                },
              },
              {
                publishedAt,

                id: {
                  lt:
                    story.id,
                },
              },
            ],
          },

          orderBy: [
            {
              publishedAt:
                "asc",
            },
            {
              id:
                "desc",
            },
          ],

          include,
        }),

        prisma.story.findFirst({
          where: {
            ...baseWhere,

            OR: [
              {
                publishedAt: {
                  lt:
                    publishedAt,
                },
              },
              {
                publishedAt,

                id: {
                  gt:
                    story.id,
                },
              },
            ],
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

          include,
        }),
      ],
    );

  const translations =
    await findPortugueseTranslations(
      [
        newer,
        older,
      ].flatMap(
        (candidate) =>
          candidate
            ? [
                candidate.id,
              ]
            : [],
      ),
    );

  return {
    newer:
      newer
        ? mapStoredStoryToDomain(
            newer,
            translations.get(
              newer.id,
            ) ??
              null,
          )
        : null,

    older:
      older
        ? mapStoredStoryToDomain(
            older,
            translations.get(
              older.id,
            ) ??
              null,
          )
        : null,
  };
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