import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

export async function findAllStories():
  Promise<NewsStory[]> {
  const countries =
    await buildWorldCountriesWithNews();

  const stories =
    countries.flatMap(
      (country) =>
        country.stories,
    );

  const uniqueStories =
    new Map<
      string,
      NewsStory
    >();

  for (
    const story of
    stories
  ) {
    uniqueStories.set(
      story.id,
      story,
    );
  }

  return [
    ...uniqueStories.values(),
  ].sort(
    (
      first,
      second,
    ) =>
      getTimestamp(
        second.publishedAtISO,
      ) -
      getTimestamp(
        first.publishedAtISO,
      ),
  );
}

export async function findStoryById(
  storyId: string,
): Promise<NewsStory | null> {
  const stories =
    await findAllStories();

  return (
    stories.find(
      (story) =>
        story.id ===
        storyId,
    ) ??
    null
  );
}

function getTimestamp(
  value: string | null,
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(
      value,
    ).getTime();

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp;
}