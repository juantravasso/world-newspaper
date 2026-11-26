import "server-only";

import {
  createHash,
} from "node:crypto";

import Anthropic from "@anthropic-ai/sdk";

import type {
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsArticle,
  NewsStory,
} from "@/domain/news/story.types";

import {
  findCountryByCode,
} from "@/server/countries/country-catalog";

import {
  listEnabledSourcesWithoutFeed,
} from "@/server/news/news-source.repository";

import type {
  NewsSourceRecord,
} from "@/server/news/news-source.repository";

import {
  clusterArticles,
} from "@/server/stories/cluster-articles";

import {
  saveStories,
} from "@/server/stories/story.persistence";

import {
  scrapeHomepageLinks,
} from "./homepage-scrape";

/*
 * Modelo barato — a tarefa é só classificar links
 * já extraídos da home, não gerar texto.
 */
const CLASSIFICATION_MODEL =
  "claude-haiku-4-5";

const SOURCE_CONCURRENCY =
  5;

const validCategories =
  new Set<
    string
  >(
    [
      "politics",
      "economy",
    ],
  );

let cachedClient:
  Anthropic | null =
  null;

function getClient():
  Anthropic | null {
  const apiKey =
    process.env
      .ANTHROPIC_API_KEY
      ?.trim();

  if (!apiKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient =
      new Anthropic(
        {
          apiKey,
        },
      );
  }

  return cachedClient;
}

export type ExtractAiSourcesResult = {
  sourcesProcessed:
    number;

  linksScraped:
    number;

  articlesExtracted:
    number;

  storiesSaved:
    number;

  articlesSaved:
    number;
};

/**
 * Para as fontes cadastradas sem feed RSS,
 * baixa a home, extrai os links de manchete e
 * usa IA (Haiku) só pra classificar quais são
 * notícia de política/economia de verdade — o
 * texto do link já é a manchete, não precisa a
 * IA reescrever nada.
 *
 * Reaproveita o mesmo clusterArticles/saveStories
 * usado pela sincronização via RSS, então essas
 * notícias se juntam ao mesmo corpo de stories
 * (inclusive agrupando com uma matéria de RSS do
 * mesmo país que cubra o mesmo fato).
 */
export async function extractAiSources():
  Promise<
    ExtractAiSourcesResult
  > {
  const sources =
    await listEnabledSourcesWithoutFeed();

  let linksScraped =
    0;

  const articlesBySource =
    await mapWithConcurrency(
      sources,
      SOURCE_CONCURRENCY,
      async (source) => {
        const articles =
          await extractArticlesFromSource(
            source,
          );

        linksScraped +=
          articles.linksScraped;

        return articles.articles;
      },
    );

  const allArticles =
    articlesBySource.flat();

  const articlesByCountry =
    new Map<
      string,
      NewsArticle[]
    >();

  for (
    const article of
    allArticles
  ) {
    const countryArticles =
      articlesByCountry.get(
        article.countryCode,
      ) ??
      [];

    countryArticles.push(
      article,
    );

    articlesByCountry.set(
      article.countryCode,
      countryArticles,
    );
  }

  const stories:
    NewsStory[] =
    [
      ...articlesByCountry.values(),
    ].flatMap(
      clusterArticles,
    );

  const persistenceResult =
    stories.length >
    0
      ? await saveStories(
          stories,
        )
      : {
          storiesSaved:
            0,

          articlesSaved:
            0,
        };

  return {
    sourcesProcessed:
      sources.length,

    linksScraped,

    articlesExtracted:
      allArticles.length,

    storiesSaved:
      persistenceResult.storiesSaved,

    articlesSaved:
      persistenceResult.articlesSaved,
  };
}

async function extractArticlesFromSource(
  source:
    NewsSourceRecord,
): Promise<{
  articles:
    NewsArticle[];

  linksScraped:
    number;
}> {
  const country =
    findCountryByCode(
      source.countryCode,
    );

  if (!country) {
    return {
      articles:
        [],

      linksScraped:
        0,
    };
  }

  const links =
    await scrapeHomepageLinks(
      source.websiteUrl,
    );

  if (
    links.length ===
    0
  ) {
    return {
      articles:
        [],

      linksScraped:
        0,
    };
  }

  const classifications =
    await classifyLinks(
      source,
      links,
    );

  const articles:
    NewsArticle[] =
    [];

  for (
    const [
      index,
      category,
    ] of
    classifications
  ) {
    const link =
      links[
        index
      ];

    if (!link) {
      continue;
    }

    articles.push(
      {
        id:
          createArticleId(
            source.id,
            link.url,
          ),

        sourceId:
          source.id,

        sourceName:
          source.name,

        title:
          link.text,

        excerpt:
          link.text,

        url:
          link.url,

        category,

        countryCode:
          country.code,

        language:
          country.language,

        publishedAtISO:
          null,
      },
    );
  }

  return {
    articles,

    linksScraped:
      links.length,
  };
}

/**
 * Pede pra IA classificar cada link numerado como
 * política, economia, ou nenhum dos dois (menu,
 * login, esporte, entretenimento, anúncio — tudo
 * que não é notícia de política/economia vira
 * "other" e é descartado). Nunca lança — em
 * qualquer falha, nenhum link dessa fonte é
 * classificado nessa execução (tenta de novo na
 * próxima).
 */
async function classifyLinks(
  source:
    NewsSourceRecord,

  links:
    { text:
        string;
    }[],
): Promise<
  [
    index:
      number,

    category:
      NewsCategory,
  ][]
> {
  const client =
    getClient();

  if (!client) {
    return [];
  }

  const numberedLinks =
    links
      .map(
        (link, index) =>
          `${index}: ${link.text}`,
      )
      .join(
        "\n",
      );

  try {
    const response =
      await client.messages.create(
        {
          model:
            CLASSIFICATION_MODEL,

          max_tokens:
            2_048,

          system:
            `Você recebe links extraídos da home do site de notícias "${source.name}". ` +
            "Classifique cada linha numerada como \"politics\", \"economy\" ou \"other\" " +
            "(menu, login, esporte, entretenimento, anúncio, ou qualquer texto que não seja " +
            "manchete de notícia de política/economia). " +
            "Responda só com um array JSON de objetos " +
            '{"index": <número>, "category": "politics"|"economy"|"other"}, um por linha recebida, sem markdown.',

          messages: [
            {
              role:
                "user",

              content:
                numberedLinks,
            },
          ],
        },
      );

    const textBlock =
      response.content.find(
        (
          block,
        ) =>
          block.type ===
          "text",
      );

    if (
      !textBlock ||
      textBlock.type !==
        "text"
    ) {
      return [];
    }

    return parseClassifications(
      textBlock.text,
      links.length,
    );
  } catch (
    error
  ) {
    console.warn(
      "[AI SOURCE EXTRACT] falha ao classificar",
      source.name,
      error instanceof
        Error
        ? error.message
        : error,
    );

    return [];
  }
}

function parseClassifications(
  rawText:
    string,

  linkCount:
    number,
): [
  index:
    number,

  category:
    NewsCategory,
][] {
  const start =
    rawText.indexOf(
      "[",
    );

  const end =
    rawText.lastIndexOf(
      "]",
    );

  if (
    start ===
      -1 ||
    end ===
      -1 ||
    end <
      start
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        rawText.slice(
          start,
          end +
            1,
        ),
      ) as
        unknown[];

    return parsed.flatMap(
      (entry) => {
        if (
          !entry ||
          typeof entry !==
            "object"
        ) {
          return [];
        }

        const {
          index,
          category,
        } =
          entry as
            Record<
              string,
              unknown
            >;

        if (
          typeof index !==
            "number" ||
          index <
            0 ||
          index >=
            linkCount ||
          typeof category !==
            "string" ||
          !validCategories.has(
            category,
          )
        ) {
          return [];
        }

        return [
          [
            index,
            category as
              NewsCategory,
          ] as const,
        ];
      },
    );
  } catch {
    return [];
  }
}

function createArticleId(
  sourceId:
    string,

  url:
    string,
): string {
  const hash =
    createHash(
      "sha256",
    )
      .update(
        url,
      )
      .digest(
        "hex",
      )
      .slice(
        0,
        20,
      );

  return `${sourceId}:ai:${hash}`;
}

async function mapWithConcurrency<
  Item,
  Output,
>(
  items:
    Item[],

  concurrency:
    number,

  worker: (
    item:
      Item,
  ) =>
    Promise<Output>,
): Promise<
  Output[]
> {
  const results =
    new Array<Output>(
      items.length,
    );

  let nextIndex =
    0;

  async function runWorker():
    Promise<void> {
    while (
      nextIndex <
      items.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex +=
        1;

      results[
        currentIndex
      ] =
        await worker(
          items[
            currentIndex
          ]!,
        );
    }
  }

  const workerCount =
    Math.min(
      Math.max(
        concurrency,
        1,
      ),
      items.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () =>
        runWorker(),
    ),
  );

  return results;
}
