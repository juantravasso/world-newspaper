import type {
  NewsCategory,
} from "@/domain/news/news.types";

type ClassifyNewsInput = {
  title: string;
  excerpt?: string;
  link?: string;
  feedCategories?: string[];
  configuredCategory?: NewsCategory;
};

const keywords:
  Record<NewsCategory, string[]> = {
    football: [
      "futebol",
      "football",
      "fútbol",
      "soccer",
      "copa",
      "liga",
      "campeonato",
      "champions",
      "libertadores",
      "seleção",
      "seleccion",
      "selección",
      "gol",
      "goles",
      "partido",
      "partida",
      "club",
      "clube",
    ],

    politics: [
      "política",
      "politica",
      "politics",
      "governo",
      "gobierno",
      "government",
      "presidente",
      "president",
      "congresso",
      "congreso",
      "congress",
      "senado",
      "senate",
      "parlamento",
      "parliament",
      "eleição",
      "elecciones",
      "election",
      "ministro",
      "minister",
      "suprema corte",
      "supreme court",
    ],

    economy: [
      "economia",
      "economía",
      "economy",
      "mercado",
      "market",
      "inflação",
      "inflación",
      "inflation",
      "banco central",
      "central bank",
      "empresa",
      "empresas",
      "business",
      "negócios",
      "negocios",
      "dólar",
      "dollar",
      "pib",
      "gdp",
      "emprego",
      "empleo",
      "employment",
      "finanças",
      "finanzas",
      "finance",
      "bolsa",
      "stocks",
    ],
  };

export function classifyNews({
  title,
  excerpt = "",
  link = "",
  feedCategories = [],
  configuredCategory,
}: ClassifyNewsInput):
  | NewsCategory
  | null {
  if (configuredCategory) {
    return configuredCategory;
  }

  const normalizedTitle =
    normalize(title);

  const normalizedExcerpt =
    normalize(excerpt);

  const normalizedLink =
    normalize(link);

  const normalizedFeedCategories =
    normalize(
      feedCategories.join(" "),
    );

  const scores:
    Record<NewsCategory, number> = {
      football: 0,
      politics: 0,
      economy: 0,
    };

  for (
    const category of
    Object.keys(scores) as NewsCategory[]
  ) {
    for (
      const keyword of
      keywords[category]
    ) {
      const normalizedKeyword =
        normalize(keyword);

      if (
        normalizedTitle.includes(
          normalizedKeyword,
        )
      ) {
        scores[category] += 4;
      }

      if (
        normalizedFeedCategories.includes(
          normalizedKeyword,
        )
      ) {
        scores[category] += 5;
      }

      if (
        normalizedLink.includes(
          normalizedKeyword,
        )
      ) {
        scores[category] += 3;
      }

      if (
        normalizedExcerpt.includes(
          normalizedKeyword,
        )
      ) {
        scores[category] += 1;
      }
    }
  }

  const ranking =
    (
      Object.entries(scores) as [
        NewsCategory,
        number,
      ][]
    ).sort(
      (
        first,
        second,
      ) => second[1] - first[1],
    );

  const [winner, runnerUp] =
    ranking;

  if (!winner) {
    return null;
  }

  const [
    winnerCategory,
    winnerScore,
  ] = winner;

  const runnerUpScore =
    runnerUp?.[1] ?? 0;

  /*
   * Evita classificar matérias
   * ambíguas ou sem sinal suficiente.
   */
  if (
    winnerScore < 4 ||
    winnerScore === runnerUpScore
  ) {
    return null;
  }

  return winnerCategory;
}

function normalize(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}
