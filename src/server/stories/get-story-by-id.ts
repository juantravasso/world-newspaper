import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findStoryById,
} from "./story.repository";

export async function getStoryById(
  storyId: string,
): Promise<NewsStory | null> {
  return findStoryById(
    storyId,
  );
}