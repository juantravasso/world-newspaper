import fs from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

const auditPath =
  path.join(
    root,
    "rss-audit-america.json",
  );

const catalogPath =
  path.join(
    root,
    "src",
    "data",
    "news",
    "america.sources.json",
  );

const outputPath =
  path.join(
    root,
    "src",
    "data",
    "news",
    "america.sources.updated.json",
  );

const audit =
  JSON.parse(
    await fs.readFile(
      auditPath,
      "utf8",
    ),
  );

const catalog =
  JSON.parse(
    await fs.readFile(
      catalogPath,
      "utf8",
    ),
  );

const auditBySourceId =
  new Map(
    audit.results.map(
      (result) => [
        result.sourceId,
        result,
      ],
    ),
  );

let updatedSources = 0;

for (
  const country of
  catalog.countries
) {
  for (
    const source of
    country.sources
  ) {
    const result =
      auditBySourceId.get(
        source.id,
      );

    if (
      !result ||
      result.feeds.length === 0
    ) {
      continue;
    }

    const selectedFeed =
      selectBestFeed(
        result.feeds,
      );

    if (!selectedFeed) {
      continue;
    }

    source.feeds = [
      {
        url: selectedFeed.url,
      },
    ];

    updatedSources += 1;
  }
}

await fs.writeFile(
  outputPath,
  JSON.stringify(
    catalog,
    null,
    2,
  ),
  "utf8",
);

console.log(
  `${updatedSources} fontes atualizadas.`,
);

console.log(
  `Arquivo criado em: ${outputPath}`,
);

function selectBestFeed(
  feeds,
) {
  return [...feeds]
    .map((feed) => ({
      ...feed,

      score:
        calculateFeedScore(
          feed,
        ),
    }))
    .sort(
      (
        first,
        second,
      ) =>
        second.score -
        first.score,
    )[0];
}

function calculateFeedScore(
  feed,
) {
  const url =
    feed.url.toLowerCase();

  const title =
    (
      feed.title ?? ""
    ).toLowerCase();

  let score = 0;

  /*
   * Prefere feeds com mais itens.
   */
  score += Math.min(
    feed.items ?? 0,
    50,
  );

  /*
   * Endereços comuns de feeds principais.
   */
  if (
    url.endsWith("/feed") ||
    url.endsWith("/feed/") ||
    url.endsWith("/rss") ||
    url.endsWith("/rss.xml") ||
    url.endsWith("/feed.xml")
  ) {
    score += 30;
  }

  if (
    title.includes("notícias") ||
    title.includes("noticias") ||
    title.includes("news") ||
    title.includes("últimas") ||
    title.includes("ultimas")
  ) {
    score += 20;
  }

  /*
   * Evita feed de comentários.
   */
  if (
    url.includes("comment") ||
    url.includes("comments") ||
    title.includes("comment")
  ) {
    score -= 100;
  }

  /*
   * Evita feeds muito específicos
   * nessa primeira seleção.
   */
  if (
    url.includes("/tag/") ||
    url.includes("/author/") ||
    url.includes("/search/")
  ) {
    score -= 40;
  }

  return score;
}