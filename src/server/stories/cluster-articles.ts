import {
  createHash,
} from "node:crypto";

import type {
  NewsArticle,
  NewsStory,
} from "@/domain/news/story.types";

const MINIMUM_SIMILARITY =
  0.45;

const MAX_TIME_DISTANCE_MS =
  48 * 60 * 60 * 1000;

const categoryLabels:
  Record<
    NewsArticle["category"],
    string
  > = {
    football: "Futebol",
    politics: "Política",
    economy: "Economia",
  };

type ArticleCluster = {
  articles: NewsArticle[];
};

const ignoredWords =
  new Set([
    // Português
    "a",
    "o",
    "as",
    "os",
    "de",
    "da",
    "do",
    "das",
    "dos",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "para",
    "com",
    "por",
    "que",
    "uma",
    "um",
    "e",

    // Inglês
    "the",
    "of",
    "and",
    "to",
    "in",
    "on",
    "for",
    "with",
    "from",
    "at",
    "a",
    "an",

    // Espanhol
    "el",
    "la",
    "los",
    "las",
    "del",
    "de",
    "en",
    "con",
    "por",
    "para",
    "una",
    "un",
    "y",
  ]);

export function clusterArticles(
  articles: NewsArticle[],
): NewsStory[] {
  const orderedArticles =
    [...articles].sort(
      compareArticlesByDateDescending,
    );

  const clusters:
    ArticleCluster[] = [];

  for (
    const article of
    orderedArticles
  ) {
    const matchingCluster =
      findBestCluster(
        article,
        clusters,
      );

    if (matchingCluster) {
      matchingCluster.articles.push(
        article,
      );

      continue;
    }

    clusters.push({
      articles: [article],
    });
  }

  return clusters
    .map(toNewsStory)
    .sort(
      compareStoriesByDateDescending,
    );
}

function findBestCluster(
  article: NewsArticle,
  clusters: ArticleCluster[],
): ArticleCluster | null {
  let bestCluster:
    ArticleCluster | null = null;

  let bestSimilarity = 0;

  for (
    const cluster of
    clusters
  ) {
    if (
      !canJoinCluster(
        article,
        cluster,
      )
    ) {
      continue;
    }

    const similarity =
      getClusterSimilarity(
        article,
        cluster,
      );

    if (
      similarity >=
        MINIMUM_SIMILARITY &&
      similarity >
        bestSimilarity
    ) {
      bestCluster = cluster;
      bestSimilarity =
        similarity;
    }
  }

  return bestCluster;
}

function canJoinCluster(
  article: NewsArticle,
  cluster: ArticleCluster,
): boolean {
  const representative =
    cluster.articles[0];

  if (!representative) {
    return false;
  }

  if (
    article.category !==
    representative.category
  ) {
    return false;
  }

  if (
    article.countryCode !==
    representative.countryCode
  ) {
    return false;
  }

  const alreadyHasSource =
    cluster.articles.some(
      (clusterArticle) =>
        clusterArticle.sourceId ===
        article.sourceId,
    );

  if (alreadyHasSource) {
    return false;
  }

  return cluster.articles.some(
    (clusterArticle) =>
      isWithinTimeWindow(
        article,
        clusterArticle,
      ),
  );
}

function getClusterSimilarity(
  article: NewsArticle,
  cluster: ArticleCluster,
): number {
  const similarities =
    cluster.articles.map(
      (clusterArticle) =>
        calculateSimilarity(
          article.title,
          clusterArticle.title,
        ),
    );

  return Math.max(
    ...similarities,
    0,
  );
}

function isWithinTimeWindow(
  first: NewsArticle,
  second: NewsArticle,
): boolean {
  if (
    !first.publishedAtISO ||
    !second.publishedAtISO
  ) {
    /*
     * Alguns feeds não informam a
     * data. Nesses casos, deixamos
     * o título decidir.
     */
    return true;
  }

  const firstTimestamp =
    new Date(
      first.publishedAtISO,
    ).getTime();

  const secondTimestamp =
    new Date(
      second.publishedAtISO,
    ).getTime();

  if (
    Number.isNaN(
      firstTimestamp,
    ) ||
    Number.isNaN(
      secondTimestamp,
    )
  ) {
    return true;
  }

  return (
    Math.abs(
      firstTimestamp -
        secondTimestamp,
    ) <=
    MAX_TIME_DISTANCE_MS
  );
}

function toNewsStory(
  cluster: ArticleCluster,
): NewsStory {
  const orderedArticles =
    [...cluster.articles].sort(
      compareArticlesByDateDescending,
    );

  const representative =
    orderedArticles[0];

  if (!representative) {
    throw new Error(
      "Não é possível criar uma história sem matérias.",
    );
  }

  const anchorArticle =
    orderedArticles[
      orderedArticles.length - 1
    ];

  return {
    id: createStoryId(
      anchorArticle,
    ),

    headline:
      representative.title,

    summary:
      createInitialSummary(
        orderedArticles,
      ),

    category:
      representative.category,

    categoryLabel:
      categoryLabels[
        representative.category
      ],

    countryCode:
      representative.countryCode,

    imageUrl:
      orderedArticles.find(
        (article) =>
          Boolean(
            article.imageUrl,
          ),
      )?.imageUrl,

    publishedAtISO:
      representative.publishedAtISO,

    articles:
      orderedArticles,
  };
}

function createInitialSummary(
  articles: NewsArticle[],
): string {
  const articleWithExcerpt =
    articles.find(
      (article) =>
        article.excerpt
          .trim()
          .length > 0,
    );

  if (
    articleWithExcerpt
  ) {
    return (
      articleWithExcerpt
        .excerpt
    );
  }

  const sourceCount =
    new Set(
      articles.map(
        (article) =>
          article.sourceId,
      ),
    ).size;

  return sourceCount === 1
    ? "Acompanhe a cobertura desta notícia na fonte original."
    : `Acompanhe a cobertura deste acontecimento em ${sourceCount} fontes diferentes.`;
}

function createStoryId(
  anchorArticle:
    NewsArticle,
): string {
  const hash =
    createHash("sha256")
      .update(
        anchorArticle.id,
      )
      .digest("hex")
      .slice(0, 20);

  return `story-${hash}`;
}

function compareArticlesByDateDescending(
  first: NewsArticle,
  second: NewsArticle,
): number {
  return (
    getTimestamp(
      second.publishedAtISO,
    ) -
    getTimestamp(
      first.publishedAtISO,
    )
  );
}

function compareStoriesByDateDescending(
  first: NewsStory,
  second: NewsStory,
): number {
  return (
    getTimestamp(
      second.publishedAtISO,
    ) -
    getTimestamp(
      first.publishedAtISO,
    )
  );
}

function getTimestamp(
  date: string | null,
): number {
  if (!date) {
    return 0;
  }

  const timestamp =
    new Date(
      date,
    ).getTime();

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp;
}

function normalizeTitle(
  title: string,
): string[] {
  return title
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " ",
    )
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !ignoredWords.has(
          word,
        ),
    );
}

function calculateSimilarity(
  firstTitle: string,
  secondTitle: string,
): number {
  const first =
    new Set(
      normalizeTitle(
        firstTitle,
      ),
    );

  const second =
    new Set(
      normalizeTitle(
        secondTitle,
      ),
    );

  const intersection =
    [...first].filter(
      (word) =>
        second.has(word),
    );

  const union =
    new Set([
      ...first,
      ...second,
    ]);

  if (union.size === 0) {
    return 0;
  }

  return (
    intersection.length /
    union.size
  );
}