import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findStoredStories,
  findStoredStoryById,
} from "@/server/stories/story.persistence";

/**
 * Retorna as stories armazenadas
 * no PostgreSQL.
 */
export function findAllStories():
  Promise<NewsStory[]> {
  return findStoredStories();
}

/**
 * Busca uma story diretamente
 * no PostgreSQL pelo ID.
 */
export function findStoryById(
  storyId:
    string,
): Promise<NewsStory | null> {
  return findStoredStoryById(
    storyId,
  );
}