import "server-only";

import {
  revalidateTag,
} from "next/cache";

import {
  translateStoryText,
} from "@/server/ai/translate";

import {
  prisma,
} from "@/server/database/prisma";

import {
  WORLD_NEWS_CACHE_TAG,
} from "@/server/news/news-cache";

import {
  refreshStorySearchText,
} from "@/server/stories/story.persistence";

/*
 * Roda com frequência (mesmo ritmo da
 * sincronização) então não precisa processar
 * muito de cada vez — o objetivo é manter as
 * notícias novas traduzidas rápido e ir
 * esvaziando o estoque antigo aos poucos.
 */
const MAX_TRANSLATIONS_PER_RUN =
  150;

const TRANSLATION_CONCURRENCY =
  5;

export type TranslatePortugueseResult = {
  candidates:
    number;

  translated:
    number;
};

/**
 * Garante que toda story não-portuguesa tenha
 * uma tradução salva em StoryTranslation. Só
 * traduz o que ainda não tem tradução fresca
 * (ou cuja story mudou depois da última
 * tradução) — nunca reprocessa o que já está
 * em dia.
 */
export async function translateStoriesToPortuguese():
  Promise<
    TranslatePortugueseResult
  > {
  const candidates =
    await findUntranslatedStories();

  if (
    candidates.length ===
    0
  ) {
    return {
      candidates:
        0,

      translated:
        0,
    };
  }

  let translated =
    0;

  const translatedStoryIds:
    string[] =
    [];

  await mapWithConcurrency(
    candidates,
    TRANSLATION_CONCURRENCY,
    async (candidate) => {
      const alreadyPortuguese =
        candidate.language
          .toLowerCase()
          .startsWith(
            "pt",
          );

      const result =
        alreadyPortuguese
          ? {
              translated:
                true as
                  const,

              headline:
                candidate.headline,

              summary:
                candidate.summary,
            }
          : await translateStoryText(
              {
                headline:
                  candidate.headline,

                summary:
                  candidate.summary,

                sourceLanguage:
                  candidate.language,

                targetLanguage:
                  "pt",
              },
            );

      if (
        !result.translated
      ) {
        return;
      }

      await prisma.storyTranslation.upsert(
        {
          where: {
            storyId_language:
              {
                storyId:
                  candidate.id,

                language:
                  "pt",
              },
          },

          create: {
            storyId:
              candidate.id,

            language:
              "pt",

            headline:
              result.headline,

            summary:
              result.summary,

            sourceUpdatedAt:
              candidate.updatedAt,
          },

          update: {
            headline:
              result.headline,

            summary:
              result.summary,

            sourceUpdatedAt:
              candidate.updatedAt,
          },
        },
      );

      translated +=
        1;

      translatedStoryIds.push(
        candidate.id,
      );
    },
  );

  if (
    translated >
    0
  ) {
    await refreshStorySearchText(
      translatedStoryIds,
    );

    revalidateTag(
      WORLD_NEWS_CACHE_TAG,
      "max",
    );
  }

  return {
    candidates:
      candidates.length,

    translated,
  };
}

type TranslationCandidate = {
  id:
    string;

  headline:
    string;

  summary:
    string;

  updatedAt:
    Date;

  language:
    string;
};

async function findUntranslatedStories():
  Promise<
    TranslationCandidate[]
  > {
  /*
   * Filtra "nunca traduzida" direto no banco
   * (translations: none) em vez de buscar uma
   * janela recente e descartar em JS — assim
   * cada execução sempre encontra story de
   * verdade pra traduzir, e o estoque antigo
   * também esvazia com o tempo, não só as
   * mais recentes.
   */
  const stories =
    await prisma.story.findMany(
      {
        where: {
          category: {
            not:
              "football",
          },

          translations: {
            none: {
              language:
                "pt",
            },
          },
        },

        orderBy: {
          publishedAt:
            "desc",
        },

        select: {
          id:
            true,

          headline:
            true,

          summary:
            true,

          updatedAt:
            true,

          articles: {
            select: {
              language:
                true,
            },

            orderBy: {
              publishedAt:
                "desc",
            },

            take:
              1,
          },
        },

        take:
          MAX_TRANSLATIONS_PER_RUN,
      },
    );

  const candidates:
    TranslationCandidate[] =
    [];

  for (
    const story of
    stories
  ) {
    if (
      candidates.length >=
      MAX_TRANSLATIONS_PER_RUN
    ) {
      break;
    }

    const language =
      story.articles[0]
        ?.language ??
      "";

    candidates.push(
      {
        id:
          story.id,

        headline:
          story.headline,

        summary:
          story.summary,

        updatedAt:
          story.updatedAt,

        language,
      },
    );
  }

  return candidates;
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
