import type {
  NewsStory,
} from "@/domain/news/story.types";

export const demoStory:
  NewsStory = {
  id: "demo-story",

  headline:
    "Senado aprova novo projeto após votação",

  summary:
    "As fontes confirmam a aprovação do projeto, mas apresentam enfoques diferentes sobre seus impactos políticos e econômicos.",

  category: "politics",
  categoryLabel: "Política",

  countryCode: "BR",

  publishedAtISO:
    new Date().toISOString(),

  articles: [
    {
      id: "article-1",

      sourceId: "source-a",
      sourceName: "Fonte A",

      title:
        "Senado aprova novo projeto",

      excerpt:
        "A primeira fonte concentra sua cobertura no resultado da votação.",

      url:
        "https://example.com/fonte-a",

      category: "politics",
      countryCode: "BR",
      language: "pt-BR",

      publishedAtISO:
        new Date().toISOString(),
    },

    {
      id: "article-2",

      sourceId: "source-b",
      sourceName: "Fonte B",

      title:
        "Governo vence votação no Senado",

      excerpt:
        "A segunda fonte destaca a vitória política obtida pelo governo.",

      url:
        "https://example.com/fonte-b",

      category: "politics",
      countryCode: "BR",
      language: "pt-BR",

      publishedAtISO:
        new Date().toISOString(),
    },

    {
      id: "article-3",

      sourceId: "source-c",
      sourceName: "Fonte C",

      title:
        "Projeto pode produzir impactos econômicos",

      excerpt:
        "A terceira fonte enfatiza as possíveis consequências econômicas.",

      url:
        "https://example.com/fonte-c",

      category: "politics",
      countryCode: "BR",
      language: "pt-BR",

      publishedAtISO:
        new Date().toISOString(),
    },
  ],
};

export const mockStories:
  NewsStory[] = [
    demoStory,
  ];