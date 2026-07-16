import fs from "node:fs/promises";
import path from "node:path";

const region =
  process.argv[2];

const allowedRegions =
  new Set([
    "america",
    "europe",
    "africa",
    "asia",
    "oceania",
    "middle-east",
  ]);

if (
  !region ||
  !allowedRegions.has(region)
) {
  console.error(
    "Uso: node scripts/apply-region-rss-audit.mjs <região>",
  );

  process.exit(1);
}

const root =
  process.cwd();

const catalogPath =
  path.join(
    root,
    "src",
    "data",
    "news",
    `${region}.sources.json`,
  );

const auditPath =
  path.join(
    root,
    `rss-audit-${region}.json`,
  );

const backupPath =
  path.join(
    root,
    "src",
    "data",
    "news",
    `${region}.sources.backup.json`,
  );

const catalog =
  JSON.parse(
    await fs.readFile(
      catalogPath,
      "utf8",
    ),
  );

const audit =
  JSON.parse(
    await fs.readFile(
      auditPath,
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
let unchangedSources = 0;

for (
  const country of
  catalog.countries
) {
  for (
    const source of
    country.sources
  ) {
    const auditResult =
      auditBySourceId.get(
        source.id,
      );

    if (
      !auditResult ||
      !Array.isArray(
        auditResult.feeds,
      ) ||
      auditResult.feeds.length === 0
    ) {
      unchangedSources += 1;
      continue;
    }

    const bestFeed =
      [...auditResult.feeds]
        .filter(
          (feed) =>
            !isRejectedFeed(
              feed,
            ),
        )
        .sort(
          (
            first,
            second,
          ) =>
            calculateFeedScore(
              second,
            ) -
            calculateFeedScore(
              first,
            ),
        )[0];

    if (!bestFeed) {
      unchangedSources += 1;
      continue;
    }

    source.feeds = [
      {
        url:
          bestFeed.url,

        enabled: true,
      },
    ];

    updatedSources += 1;
  }
}

await fs.copyFile(
  catalogPath,
  backupPath,
);

await fs.writeFile(
  catalogPath,
  `${JSON.stringify(
    catalog,
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `${updatedSources} fontes atualizadas em ${region}.`,
);

console.log(
  `${unchangedSources} fontes permaneceram sem feed.`,
);

console.log(
  `Catálogo atualizado: ${catalogPath}`,
);

console.log(
  `Backup criado: ${backupPath}`,
);

function isRejectedFeed(
  feed,
) {
  const value =
    [
      feed.url ?? "",
      feed.title ?? "",
    ]
      .join(" ")
      .toLowerCase();

  return [
    "comments",
    "comment",
    "web-stories",
    "/author/",
    "/tag/",
    "/search/",
    "podcast",
    "newsletter",
  ].some(
    (term) =>
      value.includes(term),
  );
}

function calculateFeedScore(
  feed,
) {
  const url =
    String(
      feed.url ?? "",
    ).toLowerCase();

  const title =
    String(
      feed.title ?? "",
    ).toLowerCase();

  let score = 0;

  score +=
    Number(
      feed.uniqueLinks ?? 0,
    ) * 3;

  score +=
    Number(
      feed.items ?? 0,
    );

  if (
    /\/feed\/?$/.test(url)
  ) {
    score += 20;
  }

  if (
    /\/rss(\.xml)?\/?$/.test(
      url,
    )
  ) {
    score += 20;
  }

  if (
    title.includes("news") ||
    title.includes("notícias") ||
    title.includes("noticias") ||
    title.includes("latest")
  ) {
    score += 15;
  }

  return score;
}