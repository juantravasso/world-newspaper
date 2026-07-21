import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  mockStories,
} from "./story.mock";

export async function listStories():
  Promise<NewsStory[]> {
  return mockStories;
}