import type {
  CountryCode,
  CountryWithLatestNews,
  MockNewsSource,
  NewsCategory,
} from "@/domain/news/news.types";

type CountrySeed = {
  code: CountryCode;
  name: string;
  slug: string;
  flag: string;
  language: string;
  sources: {
    politics: MockNewsSource;
    economy: MockNewsSource;
    football: MockNewsSource;
  };
};

const countrySeeds: CountrySeed[] = [
  {
    code: "AR",
    name: "Argentina",
    slug: "argentina",
    flag: "🇦🇷",
    language: "es",
    sources: {
      politics: source("ar-la-nacion", "La Nación"),
      economy: source("ar-clarin", "Clarín"),
      football: source("ar-ole", "Olé"),
    },
  },
  {
    code: "BO",
    name: "Bolívia",
    slug: "bolivia",
    flag: "🇧🇴",
    language: "es",
    sources: {
      politics: source("bo-el-deber", "El Deber"),
      economy: source("bo-la-razon", "La Razón"),
      football: source("bo-los-tiempos", "Los Tiempos"),
    },
  },
  {
    code: "BR",
    name: "Brasil",
    slug: "brasil",
    flag: "🇧🇷",
    language: "pt-BR",
    sources: {
      politics: source("br-folha", "Folha de S.Paulo"),
      economy: source("br-valor", "Valor Econômico"),
      football: source("br-ge", "ge"),
    },
  },
  {
    code: "CL",
    name: "Chile",
    slug: "chile",
    flag: "🇨🇱",
    language: "es",
    sources: {
      politics: source("cl-la-tercera", "La Tercera"),
      economy: source("cl-diario-financiero", "Diario Financiero"),
      football: source("cl-emol", "Emol"),
    },
  },
  {
    code: "CO",
    name: "Colômbia",
    slug: "colombia",
    flag: "🇨🇴",
    language: "es",
    sources: {
      politics: source("co-el-tiempo", "El Tiempo"),
      economy: source("co-portafolio", "Portafolio"),
      football: source("co-el-espectador", "El Espectador"),
    },
  },
  {
    code: "EC",
    name: "Equador",
    slug: "equador",
    flag: "🇪🇨",
    language: "es",
    sources: {
      politics: source("ec-el-universo", "El Universo"),
      economy: source("ec-primicias", "Primicias"),
      football: source("ec-el-comercio", "El Comercio"),
    },
  },
  {
    code: "GY",
    name: "Guiana",
    slug: "guiana",
    flag: "🇬🇾",
    language: "en",
    sources: {
      politics: source("gy-stabroek", "Stabroek News"),
      economy: source("gy-kaieteur", "Kaieteur News"),
      football: source("gy-chronicle", "Guyana Chronicle"),
    },
  },
  {
    code: "PY",
    name: "Paraguai",
    slug: "paraguai",
    flag: "🇵🇾",
    language: "es",
    sources: {
      politics: source("py-abc-color", "ABC Color"),
      economy: source("py-ultima-hora", "Última Hora"),
      football: source("py-la-nacion", "La Nación"),
    },
  },
  {
    code: "PE",
    name: "Peru",
    slug: "peru",
    flag: "🇵🇪",
    language: "es",
    sources: {
      politics: source("pe-el-comercio", "El Comercio"),
      economy: source("pe-gestion", "Gestión"),
      football: source("pe-la-republica", "La República"),
    },
  },
  {
    code: "SR",
    name: "Suriname",
    slug: "suriname",
    flag: "🇸🇷",
    language: "nl",
    sources: {
      politics: source("sr-starnieuws", "Starnieuws"),
      economy: source("sr-de-ware-tijd", "De Ware Tijd"),
      football: source("sr-herald", "Suriname Herald"),
    },
  },
  {
    code: "UY",
    name: "Uruguai",
    slug: "uruguai",
    flag: "🇺🇾",
    language: "es",
    sources: {
      politics: source("uy-el-pais", "El País"),
      economy: source("uy-el-observador", "El Observador"),
      football: source("uy-montevideo-portal", "Montevideo Portal"),
    },
  },
  {
    code: "VE",
    name: "Venezuela",
    slug: "venezuela",
    flag: "🇻🇪",
    language: "es",
    sources: {
      politics: source("ve-el-nacional", "El Nacional"),
      economy: source("ve-el-universal", "El Universal"),
      football: source("ve-efecto-cocuyo", "Efecto Cocuyo"),
    },
  },
];

const categoryLabels: Record<NewsCategory, string> = {
  politics: "Política",
  economy: "Economia",
  football: "Futebol",
};

const articleTemplates: Record<
  NewsCategory,
  { title: (countryName: string) => string; excerpt: string }
> = {
  politics: {
    title: (countryName) =>
      `Congresso de ${countryName} inicia debate sobre novas medidas nacionais`,
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

const minutesByCategory: Record<NewsCategory, number> = {
  politics: 18,
  economy: 31,
  football: 42,
};

export const mockNewsSources: MockNewsSource[] = countrySeeds.flatMap(
  (country) => Object.values(country.sources),
);

export function buildMockCountriesWithNews(
  now = new Date(),
): CountryWithLatestNews[] {
  const categories: NewsCategory[] = [
    "politics",
    "economy",
    "football",
  ];

  return countrySeeds.map((country) => ({
    code: country.code,
    name: country.name,
    slug: country.slug,
    flag: country.flag,
    language: country.language,
    active: true,
    news: categories.map((category) => {
      const sourceData = country.sources[category];
      const publishedDate = new Date(
        now.getTime() - minutesByCategory[category] * 60_000,
      );

      return {
        id: `${country.code.toLowerCase()}-${category}-001`,
        title: articleTemplates[category].title(country.name),
        excerpt: articleTemplates[category].excerpt,
        category,
        categoryLabel: categoryLabels[category],
        source: sourceData.name,
        publishedAt: formatRelativeTime(publishedDate, now),
        href: `https://example.com/${country.slug}/${category}/noticia-001`,
      };
    }),
  }));
}

function source(id: string, name: string): MockNewsSource {
  return {
    id,
    name,
    websiteUrl: `https://example.com/fontes/${id}`,
    rssUrl: null,
  };
}

function formatRelativeTime(date: Date, now: Date): string {
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60_000),
  );

  if (minutes < 1) {
    return "agora";
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  return `há ${days} dia${days === 1 ? "" : "s"}`;
}
