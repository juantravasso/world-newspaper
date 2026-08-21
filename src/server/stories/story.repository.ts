import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findStoredStories,
  findStoredStoryById,
} from "@/server/stories/story.persistence";

const MAX_LISTED_STORIES =
  200;

/**
 * Retorna as stories mais recentes
 * armazenadas no PostgreSQL.
 */
export function findAllStories():
  Promise<NewsStory[]> {
  return findStoredStories({
    take:
      MAX_LISTED_STORIES,
  });
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