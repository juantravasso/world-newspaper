import type {
  NewsStory,
} from "@/domain/news/story.types";

import {
  buildWorldCountriesWithNews,
} from "@/server/news/build-world-countries";

import {
  saveStories,
} from "@/server/stories/story.persistence";

export type SynchronizeStoriesResult = {
  countriesProcessed: number;
  storiesCollected: number;
  articlesCollected: number;
  storiesSaved: number;
  articlesSaved: number;
};

export async function synchronizeStories():
  Promise<SynchronizeStoriesResult> {
  const countries =
    await buildWorldCountriesWithNews();

  const storiesById =
    new Map<
      string,
      NewsStory
    >();

  for (
    const country of
    countries
  ) {
    for (
      const story of
      country.stories
    ) {
      const existingStory =
        storiesById.get(
          story.id,
        );

      if (!existingStory) {
        storiesById.set(
          story.id,
          story,
        );

        continue;
      }

      const articlesById =
        new Map(
          [
            ...existingStory.articles,
            ...story.articles,
          ].map(
            (article) => [
              article.id,
              article,
            ],
          ),
        );

      storiesById.set(
        story.id,
        {
          ...existingStory,

          articles: [
            ...articlesById.values(),
          ],
        },
      );
    }
  }

  const stories = [
    ...storiesById.values(),
  ];

  const articleIds =
    new Set(
      stories.flatMap(
        (story) =>
          story.articles.map(
            (article) =>
              article.id,
          ),
      ),
    );

  const persistenceResult =
    await saveStories(
      stories,
    );

  return {
    countriesProcessed:
      countries.length,

    storiesCollected:
      stories.length,

    articlesCollected:
      articleIds.size,

    storiesSaved:
      persistenceResult.storiesSaved,

    articlesSaved:
      persistenceResult.articlesSaved,
  };
}