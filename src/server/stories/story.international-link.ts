import "server-only";

import {
  revalidateTag,
} from "next/cache";

import {
  cosineSimilarity,
  embedStoryTexts,
} from "@/server/ai/voyage";

import {
  translateStoryToPortuguese,
} from "@/server/ai/translate";

import {
  prisma,
} from "@/server/database/prisma";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

const WINDOW_DAYS =
  3;

const MAX_TIME_DISTANCE_MS =
  72 *
  60 *
  60 *
  1_000;

const MAX_EMBEDDINGS_PER_RUN =
  500;

const MAX_TRANSLATIONS_PER_RUN =
  200;

const TRANSLATION_CONCURRENCY =
  5;

/*
 * Calibrado contra dados reais do banco (dry run,
 * agosto de 2026): acima de 0.87, sem o filtro de
 * cotação abaixo, todo par revisado manualmente
 * era o mesmo fato de verdade — Zelensky, tarifas
 * do Trump, Suprema Corte, IPO da Shein, terremoto
 * na Colômbia, visita de Burnham a Kyiv, etc.
 */
const SIMILARITY_THRESHOLD =
  0.87;

/*
 * Único padrão de falso positivo encontrado na
 * revisão manual: notícias de cotação de moeda
 * ("dólar hoy", "euro hoy") de países diferentes
 * batem alta similaridade só por usarem o mesmo
 * texto padronizado todo dia — não é o mesmo fato,
 * é o mesmo gênero de notícia. Exclui da comparação
 * em vez de tentar resolver só no limiar.
 */
const CURRENCY_TERM_PATTERN =
  /\b(d[oó]lar|euro|real|bol[ií]var|peso)s?\b/i;

const RATE_QUOTE_PATTERN =
  /\b(cotiza|tipo de cambio|tasa oficial|taxa de c[aâ]mbio|c[aâ]mbio hoje|exchange rate)\b/i;

function isRoutineExchangeRateStory(
  headline:
    string,
): boolean {
  return (
    CURRENCY_TERM_PATTERN.test(
      headline,
    ) &&
    RATE_QUOTE_PATTERN.test(
      headline,
    )
  );
}

type WindowStory = {
  id:
    string;

  category:
    string;

  countryCode:
    string;

  headline:
    string;

  summary:
    string;

  publishedAt:
    Date | null;

  updatedAt:
    Date;
};

type CandidateMatch = {
  storyId:
    string;

  relatedStoryId:
    string;

  similarity:
    number;
};

export type LinkInternationalStoriesOptions = {
  dryRun?:
    boolean;
};

export type LinkInternationalStoriesResult = {
  dryRun:
    boolean;

  windowStories:
    number;

  embeddingsComputed:
    number;

  candidatePairs:
    number;

  linksCreated:
    number;

  translationsCreated:
    number;

  sampleMatches: Array<{
    storyId:
      string;

    headline:
      string;

    relatedStoryId:
      string;

    relatedHeadline:
      string;

    similarity:
      number;
  }>;
};

export async function linkInternationalStories(
  options:
    LinkInternationalStoriesOptions =
      {},
): Promise<
  LinkInternationalStoriesResult
> {
  const dryRun =
    options.dryRun ??
    false;

  const windowStart =
    new Date(
      Date.now() -
      WINDOW_DAYS *
        24 *
        60 *
        60 *
        1_000,
    );

  const windowStories =
    await prisma.story.findMany({
      where: {
        category: {
          not:
            "football",
        },

        lastSeenAt: {
          gte:
            windowStart,
        },
      },

      select: {
        id:
          true,

        category:
          true,

        countryCode:
          true,

        headline:
          true,

        summary:
          true,

        publishedAt:
          true,

        updatedAt:
          true,
      },
    }) as
      WindowStory[];

  const embeddingByStoryId =
    await loadOrComputeEmbeddings(
      windowStories,
    );

  const existingLinks =
    await prisma.storyInternationalLink.findMany(
      {
        where: {
          storyId: {
            in:
              windowStories.map(
                (story) =>
                  story.id,
              ),
          },
        },

        select: {
          storyId:
            true,

          relatedStoryId:
            true,
        },
      },
    );

  const linkedPairs =
    new Set(
      existingLinks.map(
        (link) =>
          pairKey(
            link.storyId,
            link.relatedStoryId,
          ),
      ),
    );

  const candidates =
    findCandidateMatches(
      windowStories,
      embeddingByStoryId,
      linkedPairs,
    );

  let linksCreated =
    0;

  let translationsCreated =
    0;

  if (
    !dryRun &&
    candidates.length >
      0
  ) {
    linksCreated =
      await persistLinks(
        candidates,
      );

    translationsCreated =
      await translateNewlyLinkedStories(
        windowStories,
        candidates,
      );

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );
  }

  const headlineById =
    new Map(
      windowStories.map(
        (story) =>
          [
            story.id,
            story.headline,
          ] as const,
      ),
    );

  return {
    dryRun,

    windowStories:
      windowStories.length,

    embeddingsComputed:
      embeddingByStoryId.size,

    candidatePairs:
      candidates.length,

    linksCreated,
    translationsCreated,

    sampleMatches:
      candidates
        .slice(
          0,
          20,
        )
        .map(
          (candidate) => ({
            storyId:
              candidate.storyId,

            headline:
              headlineById.get(
                candidate.storyId,
              ) ??
              "",

            relatedStoryId:
              candidate.relatedStoryId,

            relatedHeadline:
              headlineById.get(
                candidate.relatedStoryId,
              ) ??
              "",

            similarity:
              candidate.similarity,
          }),
        ),
  };
}

async function loadOrComputeEmbeddings(
  windowStories:
    WindowStory[],
): Promise<
  Map<
    string,
    number[]
  >
> {
  const existing =
    await prisma.storyEmbedding.findMany(
      {
        where: {
          storyId: {
            in:
              windowStories.map(
                (story) =>
                  story.id,
              ),
          },
        },

        select: {
          storyId:
            true,

          embedding:
            true,
        },
      },
    );

  const embeddingByStoryId =
    new Map<
      string,
      number[]
    >(
      existing.map(
        (row) =>
          [
            row.storyId,
            row.embedding,
          ] as const,
      ),
    );

  const missing =
    windowStories
      .filter(
        (story) =>
          !embeddingByStoryId.has(
            story.id,
          ),
      )
      .sort(
        (
          first,
          second,
        ) =>
          getTimestamp(
            second.publishedAt,
          ) -
          getTimestamp(
            first.publishedAt,
          ),
      )
      .slice(
        0,
        MAX_EMBEDDINGS_PER_RUN,
      );

  if (
    missing.length ===
    0
  ) {
    return embeddingByStoryId;
  }

  const embedded =
    await embedStoryTexts(
      missing.map(
        (story) => ({
          storyId:
            story.id,

          text: `${story.headline}\n${story.summary}`,
        }),
      ),
    );

  for (
    const result of
    embedded
  ) {
    embeddingByStoryId.set(
      result.storyId,
      result.embedding,
    );

    await prisma.storyEmbedding.upsert(
      {
        where: {
          storyId:
            result.storyId,
        },

        create: {
          storyId:
            result.storyId,

          embedding:
            result.embedding,
        },

        update: {
          embedding:
            result.embedding,
        },
      },
    );
  }

  return embeddingByStoryId;
}

function findCandidateMatches(
  windowStories:
    WindowStory[],

  embeddingByStoryId:
    Map<
      string,
      number[]
    >,

  linkedPairs:
    Set<
      string
    >,
): CandidateMatch[] {
  const byCategory =
    new Map<
      string,
      WindowStory[]
    >();

  for (
    const story of
    windowStories
  ) {
    if (
      !embeddingByStoryId.has(
        story.id,
      )
    ) {
      continue;
    }

    if (
      isRoutineExchangeRateStory(
        story.headline,
      )
    ) {
      continue;
    }

    const list =
      byCategory.get(
        story.category,
      ) ??
      [];

    list.push(
      story,
    );

    byCategory.set(
      story.category,
      list,
    );
  }

  const candidates:
    CandidateMatch[] =
    [];

  for (
    const stories of
    byCategory.values()
  ) {
    const sorted =
      [
        ...stories,
      ].sort(
        (
          first,
          second,
        ) =>
          getTimestamp(
            first.publishedAt,
          ) -
          getTimestamp(
            second.publishedAt,
          ),
      );

    /*
     * sorted por data: assim que a diferença
     * de tempo passa da janela, todo o resto
     * também passa — dá pra parar o loop
     * interno em vez de comparar tudo com tudo.
     */
    for (
      let i = 0;
      i <
      sorted.length;
      i++
    ) {
      const anchor =
        sorted[
          i
        ]!;

      for (
        let j =
          i +
          1;
        j <
        sorted.length;
        j++
      ) {
        const candidate =
          sorted[
            j
          ]!;

        const timeDistance =
          getTimestamp(
            candidate.publishedAt,
          ) -
          getTimestamp(
            anchor.publishedAt,
          );

        if (
          timeDistance >
          MAX_TIME_DISTANCE_MS
        ) {
          break;
        }

        if (
          anchor.countryCode ===
          candidate.countryCode
        ) {
          continue;
        }

        if (
          linkedPairs.has(
            pairKey(
              anchor.id,
              candidate.id,
            ),
          )
        ) {
          continue;
        }

        const similarity =
          cosineSimilarity(
            embeddingByStoryId.get(
              anchor.id,
            )!,
            embeddingByStoryId.get(
              candidate.id,
            )!,
          );

        if (
          similarity >=
          SIMILARITY_THRESHOLD
        ) {
          candidates.push(
            {
              storyId:
                anchor.id,

              relatedStoryId:
                candidate.id,

              similarity,
            },
          );
        }
      }
    }
  }

  return candidates.sort(
    (
      first,
      second,
    ) =>
      second.similarity -
      first.similarity,
  );
}

async function persistLinks(
  candidates:
    CandidateMatch[],
): Promise<number> {
  let created =
    0;

  for (
    const candidate of
    candidates
  ) {
    try {
      await prisma.$transaction(
        [
          prisma.storyInternationalLink.upsert(
            {
              where: {
                storyId_relatedStoryId:
                  {
                    storyId:
                      candidate.storyId,

                    relatedStoryId:
                      candidate.relatedStoryId,
                  },
              },

              create: {
                storyId:
                  candidate.storyId,

                relatedStoryId:
                  candidate.relatedStoryId,

                similarity:
                  candidate.similarity,
              },

              update: {
                similarity:
                  candidate.similarity,
              },
            },
          ),

          prisma.storyInternationalLink.upsert(
            {
              where: {
                storyId_relatedStoryId:
                  {
                    storyId:
                      candidate.relatedStoryId,

                    relatedStoryId:
                      candidate.storyId,
                  },
              },

              create: {
                storyId:
                  candidate.relatedStoryId,

                relatedStoryId:
                  candidate.storyId,

                similarity:
                  candidate.similarity,
              },

              update: {
                similarity:
                  candidate.similarity,
              },
            },
          ),
        ],
      );

      created +=
        1;
    } catch (
      error
    ) {
      /*
       * Uma das stories pode ter sido apagada
       * pela limpeza de retenção entre a
       * consulta e esta gravação (violação de
       * FK). Não derruba o job inteiro por isso.
       */
      console.warn(
        "[INTERNATIONAL LINK] falha ao gravar par",
        candidate.storyId,
        candidate.relatedStoryId,
        error instanceof
          Error
          ? error.message
          : error,
      );
    }
  }

  return created;
}

async function translateNewlyLinkedStories(
  windowStories:
    WindowStory[],

  candidates:
    CandidateMatch[],
): Promise<number> {
  const storyById =
    new Map(
      windowStories.map(
        (story) =>
          [
            story.id,
            story,
          ] as const,
      ),
    );

  const involvedIds =
    new Set<
      string
    >();

  for (
    const candidate of
    candidates
  ) {
    involvedIds.add(
      candidate.storyId,
    );

    involvedIds.add(
      candidate.relatedStoryId,
    );
  }

  const existingTranslations =
    await prisma.storyTranslation.findMany(
      {
        where: {
          storyId: {
            in: [
              ...involvedIds,
            ],
          },

          language:
            "pt",
        },

        select: {
          storyId:
            true,

          sourceUpdatedAt:
            true,
        },
      },
    );

  const freshTranslationIds =
    new Set(
      existingTranslations
        .filter(
          (translation) => {
            const story =
              storyById.get(
                translation.storyId,
              );

            return (
              story &&
              translation.sourceUpdatedAt >=
                story.updatedAt
            );
          },
        )
        .map(
          (translation) =>
            translation.storyId,
        ),
    );

  const needsTranslation =
    [
      ...involvedIds,
    ]
      .filter(
        (id) =>
          !freshTranslationIds.has(
            id,
          ),
      )
      .slice(
        0,
        MAX_TRANSLATIONS_PER_RUN,
      );

  if (
    needsTranslation.length ===
    0
  ) {
    return 0;
  }

  const representativeArticles =
    await prisma.article.findMany(
      {
        where: {
          storyId: {
            in:
              needsTranslation,
          },
        },

        orderBy: {
          publishedAt:
            "desc",
        },

        select: {
          storyId:
            true,

          language:
            true,
        },
      },
    );

  const languageByStoryId =
    new Map<
      string,
      string
    >();

  for (
    const article of
    representativeArticles
  ) {
    if (
      !languageByStoryId.has(
        article.storyId,
      )
    ) {
      languageByStoryId.set(
        article.storyId,
        article.language,
      );
    }
  }

  let translated =
    0;

  /*
   * Traduções em série ficaram perto do limite
   * de 300s num teste real (200 traduções ≈
   * 281s). Roda em paralelo, mesmo padrão de
   * concorrência do fallback de imagens do Pexels.
   */
  await mapWithConcurrency(
    needsTranslation,
    TRANSLATION_CONCURRENCY,
    async (storyId) => {
      const story =
        storyById.get(
          storyId,
        );

      if (!story) {
        return;
      }

      const language =
        languageByStoryId.get(
          storyId,
        ) ??
        "";

      const alreadyPortuguese =
        language
          .toLowerCase()
          .startsWith(
            "pt",
          );

      const translation =
        alreadyPortuguese
          ? {
              translated:
                true as
                  const,

              headline:
                story.headline,

              summary:
                story.summary,
            }
          : await translateStoryToPortuguese(
              {
                headline:
                  story.headline,

                summary:
                  story.summary,

                language:
                  language ||
                  "unknown",
              },
            );

      if (
        !translation.translated
      ) {
        return;
      }

      await prisma.storyTranslation.upsert(
        {
          where: {
            storyId_language:
              {
                storyId,

                language:
                  "pt",
              },
          },

          create: {
            storyId,

            language:
              "pt",

            headline:
              translation.headline,

            summary:
              translation.summary,

            sourceUpdatedAt:
              story.updatedAt,
          },

          update: {
            headline:
              translation.headline,

            summary:
              translation.summary,

            sourceUpdatedAt:
              story.updatedAt,
          },
        },
      );

      translated +=
        1;
    },
  );

  return translated;
}

async function mapWithConcurrency<
  Item,
>(
  items:
    Item[],

  concurrency:
    number,

  worker: (
    item:
      Item,
  ) =>
    Promise<void>,
): Promise<void> {
  let nextIndex =
    0;

  async function runWorker():
    Promise<void> {
    while (
      nextIndex <
      items.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex +=
        1;

      await worker(
        items[
          currentIndex
        ]!,
      );
    }
  }

  const workerCount =
    Math.min(
      Math.max(
        concurrency,
        1,
      ),
      items.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () =>
        runWorker(),
    ),
  );
}

function pairKey(
  storyId:
    string,

  relatedStoryId:
    string,
): string {
  return `${storyId}:${relatedStoryId}`;
}

function getTimestamp(
  value:
    Date | null,
): number {
  return value
    ? value.getTime()
    : 0;
}
