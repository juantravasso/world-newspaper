import type {
  CountryCode,
  CountryWithLatestNews,
  MockNewsSource,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  CountryRegionId,
} from "@/domain/geography";

type CountrySources = Record<
  NewsCategory,
  MockNewsSource
>;

type CountrySeed = {
  code: CountryCode;
  name: string;
  slug: string;
  flag: string;
  language: string;

  regions: CountryRegionId[];

  sources: CountrySources;
};

type CreateCountryInput = Omit<
  CountrySeed,
  "sources"
> & {
  sources: Record<
    NewsCategory,
    string
  >;
};

const countrySeeds = [
  // =========================================================
  // AMÉRICA
  // =========================================================

  createCountry({
    code: "AR",
    name: "Argentina",
    slug: "argentina",
    flag: "🇦🇷",
    language: "es",
    regions: ["south-america"],

    sources: {
      politics: "La Nación",
      economy: "Clarín",
      football: "Olé",
    },
  }),

  createCountry({
    code: "BR",
    name: "Brasil",
    slug: "brasil",
    flag: "🇧🇷",
    language: "pt-BR",
    regions: ["south-america"],

    sources: {
      politics: "Folha de S.Paulo",
      economy: "Valor Econômico",
      football: "ge",
    },
  }),

  createCountry({
    code: "CA",
    name: "Canadá",
    slug: "canada",
    flag: "🇨🇦",
    language: "en",
    regions: ["north-america"],

    sources: {
      politics: "The Globe and Mail",
      economy: "Financial Post",
      football: "TSN",
    },
  }),

  createCountry({
    code: "CO",
    name: "Colômbia",
    slug: "colombia",
    flag: "🇨🇴",
    language: "es",
    regions: ["south-america"],

    sources: {
      politics: "El Tiempo",
      economy: "Portafolio",
      football: "El Espectador",
    },
  }),

  createCountry({
    code: "MX",
    name: "México",
    slug: "mexico",
    flag: "🇲🇽",
    language: "es",
    regions: ["north-america"],

    sources: {
      politics: "El Universal",
      economy: "El Financiero",
      football: "Récord",
    },
  }),

  createCountry({
    code: "US",
    name: "Estados Unidos",
    slug: "estados-unidos",
    flag: "🇺🇸",
    language: "en",
    regions: ["north-america"],

    sources: {
      politics: "The Washington Post",
      economy: "The Wall Street Journal",
      football: "ESPN",
    },
  }),

  // =========================================================
  // EUROPA
  // =========================================================

  createCountry({
    code: "DE",
    name: "Alemanha",
    slug: "alemanha",
    flag: "🇩🇪",
    language: "de",
    regions: ["europe"],

    sources: {
      politics: "Deutsche Welle",
      economy: "Handelsblatt",
      football: "Kicker",
    },
  }),

  createCountry({
    code: "ES",
    name: "Espanha",
    slug: "espanha",
    flag: "🇪🇸",
    language: "es",
    regions: ["europe"],

    sources: {
      politics: "El País",
      economy: "Expansión",
      football: "Marca",
    },
  }),

  createCountry({
    code: "FR",
    name: "França",
    slug: "franca",
    flag: "🇫🇷",
    language: "fr",
    regions: ["europe"],

    sources: {
      politics: "Le Monde",
      economy: "Les Échos",
      football: "L'Équipe",
    },
  }),

  createCountry({
    code: "GB",
    name: "Reino Unido",
    slug: "reino-unido",
    flag: "🇬🇧",
    language: "en",
    regions: ["europe"],

    sources: {
      politics: "The Guardian",
      economy: "Financial Times",
      football: "BBC Sport",
    },
  }),

  createCountry({
    code: "IT",
    name: "Itália",
    slug: "italia",
    flag: "🇮🇹",
    language: "it",
    regions: ["europe"],

    sources: {
      politics: "Corriere della Sera",
      economy: "Il Sole 24 Ore",
      football: "La Gazzetta dello Sport",
    },
  }),

  createCountry({
    code: "PT",
    name: "Portugal",
    slug: "portugal",
    flag: "🇵🇹",
    language: "pt-PT",
    regions: ["europe"],

    sources: {
      politics: "Público",
      economy: "Jornal de Negócios",
      football: "A Bola",
    },
  }),

  // =========================================================
  // ÁFRICA
  // =========================================================

  createCountry({
    code: "ZA",
    name: "África do Sul",
    slug: "africa-do-sul",
    flag: "🇿🇦",
    language: "en",
    regions: ["africa"],

    sources: {
      politics: "Mail & Guardian",
      economy: "Business Day",
      football: "Kick Off",
    },
  }),

  createCountry({
    code: "NG",
    name: "Nigéria",
    slug: "nigeria",
    flag: "🇳🇬",
    language: "en",
    regions: ["africa"],

    sources: {
      politics: "The Guardian Nigeria",
      economy: "BusinessDay Nigeria",
      football: "Complete Sports",
    },
  }),

  createCountry({
    code: "KE",
    name: "Quênia",
    slug: "quenia",
    flag: "🇰🇪",
    language: "en",
    regions: ["africa"],

    sources: {
      politics: "Daily Nation",
      economy: "Business Daily Africa",
      football: "Goal Kenya",
    },
  }),

  createCountry({
    code: "MA",
    name: "Marrocos",
    slug: "marrocos",
    flag: "🇲🇦",
    language: "ar",
    regions: ["africa"],

    sources: {
      politics: "Morocco World News",
      economy: "Le Matin",
      football: "Hespress Sport",
    },
  }),

  createCountry({
    code: "EG",
    name: "Egito",
    slug: "egito",
    flag: "🇪🇬",
    language: "ar",

    /**
     * O Egito aparece tanto na África
     * quanto no Oriente Médio.
     */
    regions: [
      "africa",
      "oriente-medio",
    ],

    sources: {
      politics: "Al-Ahram",
      economy: "Daily News Egypt",
      football: "KingFut",
    },
  }),

  // =========================================================
  // ÁSIA
  // =========================================================

  createCountry({
    code: "CN",
    name: "China",
    slug: "china",
    flag: "🇨🇳",
    language: "zh",
    regions: ["asia"],

    sources: {
      politics: "South China Morning Post",
      economy: "China Daily",
      football: "Titan Sports",
    },
  }),

  createCountry({
    code: "IN",
    name: "Índia",
    slug: "india",
    flag: "🇮🇳",
    language: "en",
    regions: ["asia"],

    sources: {
      politics: "The Hindu",
      economy: "The Economic Times",
      football: "Sportsstar",
    },
  }),

  createCountry({
    code: "ID",
    name: "Indonésia",
    slug: "indonesia",
    flag: "🇮🇩",
    language: "id",
    regions: ["asia"],

    sources: {
      politics: "The Jakarta Post",
      economy: "Bisnis Indonesia",
      football: "Bola",
    },
  }),

  createCountry({
    code: "JP",
    name: "Japão",
    slug: "japao",
    flag: "🇯🇵",
    language: "ja",
    regions: ["asia"],

    sources: {
      politics: "The Japan Times",
      economy: "Nikkei Asia",
      football: "Soccer Digest",
    },
  }),

  createCountry({
    code: "KR",
    name: "Coreia do Sul",
    slug: "coreia-do-sul",
    flag: "🇰🇷",
    language: "ko",
    regions: ["asia"],

    sources: {
      politics: "The Korea Herald",
      economy: "Korea Economic Daily",
      football: "K League United",
    },
  }),

  // =========================================================
  // OCEANIA
  // =========================================================

  createCountry({
    code: "AU",
    name: "Austrália",
    slug: "australia",
    flag: "🇦🇺",
    language: "en",
    regions: ["oceania"],

    sources: {
      politics: "The Australian",
      economy: "Australian Financial Review",
      football: "Football Australia",
    },
  }),

  createCountry({
    code: "NZ",
    name: "Nova Zelândia",
    slug: "nova-zelandia",
    flag: "🇳🇿",
    language: "en",
    regions: ["oceania"],

    sources: {
      politics: "The New Zealand Herald",
      economy: "BusinessDesk",
      football: "NZ Football",
    },
  }),

  createCountry({
    code: "FJ",
    name: "Fiji",
    slug: "fiji",
    flag: "🇫🇯",
    language: "en",
    regions: ["oceania"],

    sources: {
      politics: "Fiji Times",
      economy: "Fiji Sun",
      football: "Fiji Football",
    },
  }),

  // =========================================================
  // ORIENTE MÉDIO
  // =========================================================

  createCountry({
    code: "AE",
    name: "Emirados Árabes Unidos",
    slug: "emirados-arabes-unidos",
    flag: "🇦🇪",
    language: "ar",

    regions: [
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "The National",
      economy: "Gulf News",
      football: "Sport 360",
    },
  }),

  createCountry({
    code: "IL",
    name: "Israel",
    slug: "israel",
    flag: "🇮🇱",
    language: "he",

    regions: [
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "The Times of Israel",
      economy: "Globes",
      football: "Sport 5",
    },
  }),

  createCountry({
    code: "JO",
    name: "Jordânia",
    slug: "jordania",
    flag: "🇯🇴",
    language: "ar",

    regions: [
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "The Jordan Times",
      economy: "Ammon News",
      football: "Jordan Football",
    },
  }),

  createCountry({
    code: "QA",
    name: "Catar",
    slug: "catar",
    flag: "🇶🇦",
    language: "ar",

    regions: [
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "The Peninsula Qatar",
      economy: "Gulf Times",
      football: "Qatar Stars League",
    },
  }),

  createCountry({
    code: "SA",
    name: "Arábia Saudita",
    slug: "arabia-saudita",
    flag: "🇸🇦",
    language: "ar",

    regions: [
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "Arab News",
      economy: "Saudi Gazette",
      football: "Arriyadiyah",
    },
  }),

  createCountry({
    code: "TR",
    name: "Turquia",
    slug: "turquia",
    flag: "🇹🇷",
    language: "tr",

    /**
     * A Turquia pode ser mostrada
     * nas três seleções.
     */
    regions: [
      "europe",
      "asia",
      "oriente-medio",
    ],

    sources: {
      politics: "Daily Sabah",
      economy: "Dünya",
      football: "Fanatik",
    },
  }),
] satisfies CountrySeed[];

const categoryLabels: Record<
  NewsCategory,
  string
> = {
  politics: "Política",
  economy: "Economia",
  football: "Futebol",
};

type ArticleTemplate = {
  title: (
    countryName: string,
  ) => string;

  excerpt: string;
};

const articleTemplates: Record<
  NewsCategory,
  ArticleTemplate
> = {
  politics: {
    title: (countryName) =>
      `Governo de ${countryName} apresenta novas medidas ao parlamento`,

    excerpt:
      "Representantes analisam propostas que podem influenciar diferentes setores do país.",
  },

  economy: {
    title: (countryName) =>
      `Mercado de ${countryName} acompanha novos indicadores econômicos`,

    excerpt:
      "Analistas avaliam os dados divulgados e seus possíveis impactos para os próximos meses.",
  },

  football: {
    title: (countryName) =>
      `Clubes de ${countryName} se preparam para uma rodada decisiva`,

    excerpt:
      "As equipes ajustam escalações e estratégias antes dos próximos confrontos.",
  },
};

const minutesByCategory: Record<
  NewsCategory,
  number
> = {
  politics: 18,
  economy: 31,
  football: 42,
};

const categories: NewsCategory[] = [
  "politics",
  "economy",
  "football",
];

export const mockNewsSources: MockNewsSource[] =
  countrySeeds.flatMap(
    (country) =>
      Object.values(country.sources),
  );

export function buildMockCountriesWithNews(
  now = new Date(),
): CountryWithLatestNews[] {
  return countrySeeds.map(
    (
      country,
      countryIndex,
    ) => ({
      code: country.code,
      name: country.name,
      slug: country.slug,
      flag: country.flag,
      language: country.language,
      regions: country.regions,
      active: true,

      news: categories.map(
        (category) => {
          const sourceData =
            country.sources[
              category
            ];

          /*
           * O índice cria horários
           * diferentes entre os países.
           */
          const countryDelay =
            countryIndex * 3;

          const articleAgeInMinutes =
            minutesByCategory[
              category
            ] +
            countryDelay;

          const publishedDate =
            new Date(
              now.getTime() -
                articleAgeInMinutes *
                  60_000,
            );

          const articleId =
            [
              country.code
                .toLowerCase(),
              category,
              "001",
            ].join("-");

          return {
            id: articleId,

            title:
              articleTemplates[
                category
              ].title(
                country.name,
              ),

            excerpt:
              articleTemplates[
                category
              ].excerpt,

            category,

            categoryLabel:
              categoryLabels[
                category
              ],

            sourceId:
              sourceData.id,

            source:
              sourceData.name,

            publishedAt:
              formatRelativeTime(
                publishedDate,
                now,
              ),

            publishedAtISO:
              publishedDate
                .toISOString(),

            href:
              [
                "https://example.com",
                country.slug,
                category,
                articleId,
              ].join("/"),
          };
        },
      ),

      stories: [],
    }),
  );
}

function createCountry({
  sources,
  ...country
}: CreateCountryInput): CountrySeed {
  const prefix =
    country.code.toLowerCase();

  return {
    ...country,

    sources: {
      politics: source(
        `${prefix}-politics`,
        sources.politics,
      ),

      economy: source(
        `${prefix}-economy`,
        sources.economy,
      ),

      football: source(
        `${prefix}-football`,
        sources.football,
      ),
    },
  };
}

function source(
  id: string,
  name: string,
): MockNewsSource {
  return {
    id,
    name,

    /**
     * URLs provisórias.
     * Futuramente serão substituídas
     * pelos endereços oficiais.
     */
    websiteUrl:
      `https://example.com/fontes/${id}`,

    rssUrl: null,
  };
}

function formatRelativeTime(
  date: Date,
  now: Date,
): string {
  const differenceInMilliseconds =
    now.getTime() - date.getTime();

  const minutes = Math.max(
    0,
    Math.floor(
      differenceInMilliseconds /
        60_000,
    ),
  );

  if (minutes < 1) {
    return "agora";
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days =
    Math.floor(hours / 24);

  return `há ${days} dia${
    days === 1 ? "" : "s"
  }`;
}