import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  mockStories,
} from "./story.mock";

export async function getStoryById(
  storyId: string,
): Promise<NewsStory | null> {
  const story =
    mockStories.find(
      (currentStory) =>
        currentStory.id ===
        storyId,
    );

  return story ?? null;
}