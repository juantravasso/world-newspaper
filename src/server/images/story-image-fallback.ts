import "server-only";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  generateImageSearchQuery,
} from "@/server/ai/image-query";

import {
  findStoredStoryImages,
} from "@/server/stories/story.persistence";

import {
  countryNameInEnglish,
} from "./country-names-en";

import {
  searchPexelsImage,
} from "./pexels";

const CATEGORY_SEARCH_TERMS:
  Record<
    NewsCategory,
    string
  > = {
  politics:
    "government politics building",

  economy:
    "economy finance business city",
};

const MAX_LOOKUPS_PER_SYNC =
  120;

const LOOKUP_CONCURRENCY =
  5;

/**
 * Preenche `imageUrl` das stories que não têm
 * imagem de nenhum artigo original.
 *
 * Antes de gastar uma chamada ao Pexels, verifica
 * se a story já tem uma imagem salva de uma
 * sincronização anterior — assim cada evento real
 * só busca uma foto nova a primeira vez que aparece.
 */
export async function fillMissingStoryImages(
  stories:
    NewsStory[],
): Promise<
  NewsStory[]
> {
  const missingIndexes =
    stories
      .map(
        (story, index) =>
          story.imageUrl
            ? -1
            : index,
      )
      .filter(
        (index) =>
          index >=
          0,
      );

  if (
    missingIndexes.length ===
    0
  ) {
    return stories;
  }

  const result =
    [
      ...stories,
    ];

  const existingImages =
    await findStoredStoryImages(
      missingIndexes.map(
        (index) =>
          result[index]!.id,
      ),
    );

  const stillMissingIndexes:
    number[] =
    [];

  for (
    const index of
    missingIndexes
  ) {
    const story =
      result[index]!;

    const existingImage =
      existingImages.get(
        story.id,
      );

    if (
      existingImage
    ) {
      result[index] = {
        ...story,

        imageUrl:
          existingImage,
      };

      continue;
    }

    stillMissingIndexes.push(
      index,
    );
  }

  const indexesToLookUp =
    stillMissingIndexes.slice(
      0,
      MAX_LOOKUPS_PER_SYNC,
    );

  await mapWithConcurrency(
    indexesToLookUp,
    LOOKUP_CONCURRENCY,
    async (index) => {
      const story =
        result[index]!;

      const imageUrl =
        await searchPexelsImage(
          await buildImageQuery(
            story,
          ),
          story.id,
        );

      if (
        imageUrl
      ) {
        result[index] = {
          ...story,

          imageUrl,
        };
      }
    },
  );

  return result;
}

/**
 * Pede pra IA um termo de busca específico do
 * assunto da notícia; cai pro template genérico
 * categoria+país quando a IA não está disponível
 * ou falha.
 */
async function buildImageQuery(
  story:
    NewsStory,
): Promise<string> {
  const aiQuery =
    await generateImageSearchQuery(
      story.headline,
      story.summary,
    );

  if (
    aiQuery
  ) {
    return aiQuery;
  }

  const countryName =
    countryNameInEnglish[
      story.countryCode
    ] ??
    story.countryCode;

  return `${CATEGORY_SEARCH_TERMS[story.category]} ${countryName}`;
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
