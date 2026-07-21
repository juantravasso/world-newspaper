import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  findAllStories,
} from "./story.repository";

export async function listStories():
  Promise<NewsStory[]> {
  return findAllStories();
}