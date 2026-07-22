import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findStoredStories,
  findStoredStoryById,
} from "@/server/stories/story.persistence";

import {
  synchronizeStories,
} from "@/server/stories/story.sync";

const SYNCHRONIZATION_COOLDOWN_MS =
  60_000;

let synchronizationInProgress:
  Promise<void> | null =
  null;

let lastSynchronizationStartedAt =
  0;

/**
 * Retorna as stories armazenadas no PostgreSQL.
 *
 * Caso o banco esteja completamente vazio,
 * executa uma sincronização inicial com os feeds.
 */
export async function findAllStories():
  Promise<NewsStory[]> {
  const storedStories =
    await findStoredStories();

  if (
    storedStories.length >
    0
  ) {
    return storedStories;
  }

  await synchronizeWhenNeeded();

  return findStoredStories();
}

/**
 * Busca uma story diretamente no PostgreSQL.
 *
 * Caso ela ainda não esteja armazenada,
 * tenta uma sincronização com os feeds e
 * consulta novamente.
 */
export async function findStoryById(
  storyId:
    string,
): Promise<NewsStory | null> {
  const storedStory =
    await findStoredStoryById(
      storyId,
    );

  if (storedStory) {
    return storedStory;
  }

  await synchronizeWhenNeeded();

  return findStoredStoryById(
    storyId,
  );
}

/**
 * Impede que várias requisições simultâneas
 * iniciem várias sincronizações iguais.
 *
 * O cooldown também evita sincronizações
 * repetidas quando alguém acessa um ID
 * inexistente.
 */
async function synchronizeWhenNeeded():
  Promise<void> {
  if (
    synchronizationInProgress
  ) {
    await synchronizationInProgress;

    return;
  }

  const now =
    Date.now();

  const timeSinceLastSynchronization =
    now -
    lastSynchronizationStartedAt;

  if (
    timeSinceLastSynchronization <
    SYNCHRONIZATION_COOLDOWN_MS
  ) {
    return;
  }

  lastSynchronizationStartedAt =
    now;

  synchronizationInProgress =
    synchronizeStories()
      .then(
        (result) => {
          console.info(
            "[STORY SYNCHRONIZATION]",
            {
              stories:
                result.storiesSaved,

              articles:
                result.articlesSaved,
            },
          );
        },
      )
      .catch(
        (error: unknown) => {
          console.error(
            "[STORY SYNCHRONIZATION ERROR]",
            getErrorMessage(
              error,
            ),
          );
        },
      )
      .finally(
        () => {
          synchronizationInProgress =
            null;
        },
      );

  await synchronizationInProgress;
}

function getErrorMessage(
  error:
    unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return String(
    error,
  );
}