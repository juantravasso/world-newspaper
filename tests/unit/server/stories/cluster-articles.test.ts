import {
  describe,
  expect,
  it,
} from "vitest";

import {
  clusterArticles,
} from "@/server/stories/cluster-articles";

import {
  createNewsArticle,
} from "../../../fixtures/news-articles.fixture";

describe(
  "clusterArticles",
  () => {
    it(
      "agrupa títulos semelhantes de fontes diferentes",
      () => {
        const firstArticle =
          createNewsArticle({
            id: "article-1",
            sourceId: "source-1",
            sourceName: "Fonte 1",

            title:
              "Senado aprova novo projeto tributário",
          });

        const secondArticle =
          createNewsArticle({
            id: "article-2",
            sourceId: "source-2",
            sourceName: "Fonte 2",

            title:
              "Novo projeto tributário é aprovado pelo Senado",
          });

        const stories =
          clusterArticles([
            firstArticle,
            secondArticle,
          ]);

        expect(stories).toHaveLength(1);

        expect(
          stories[0]?.articles,
        ).toHaveLength(2);
      },
    );

    it(
      "mantém acontecimentos diferentes em stories separadas",
      () => {
        const politicsArticle =
          createNewsArticle({
            id: "article-politics",
            sourceId:
              "source-politics",

            title:
              "Senado aprova novo projeto tributário",
          });

        const unrelatedArticle =
          createNewsArticle({
            id: "article-unrelated",
            sourceId:
              "source-unrelated",

            title:
              "Seleção brasileira anuncia convocação para amistosos",
          });

        const stories =
          clusterArticles([
            politicsArticle,
            unrelatedArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );

    it(
      "não coloca duas matérias da mesma fonte na mesma story",
      () => {
        const firstArticle =
          createNewsArticle({
            id: "article-1",
            sourceId:
              "same-source",

            title:
              "Senado aprova novo projeto tributário",
          });

        const secondArticle =
          createNewsArticle({
            id: "article-2",
            sourceId:
              "same-source",

            title:
              "Novo projeto tributário é aprovado pelo Senado",
          });

        const stories =
          clusterArticles([
            firstArticle,
            secondArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );

    it(
      "não agrupa artigos de categorias diferentes",
      () => {
        const politicsArticle =
          createNewsArticle({
            id: "article-politics",
            sourceId:
              "source-politics",

            category:
              "politics",
          });

        const economyArticle =
          createNewsArticle({
            id: "article-economy",
            sourceId:
              "source-economy",

            category:
              "economy",
          });

        const stories =
          clusterArticles([
            politicsArticle,
            economyArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );

    it(
      "não agrupa artigos de países diferentes",
      () => {
        const brazilArticle =
          createNewsArticle({
            id: "article-br",
            sourceId:
              "source-br",

            countryCode: "BR",
          });

        const portugalArticle =
          createNewsArticle({
            id: "article-pt",
            sourceId:
              "source-pt",

            countryCode: "PT",
          });

        const stories =
          clusterArticles([
            brazilArticle,
            portugalArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );

    it(
      "não agrupa artigos separados por mais de 48 horas",
      () => {
        const recentArticle =
          createNewsArticle({
            id: "article-recent",
            sourceId:
              "source-recent",

            publishedAtISO:
              "2026-07-21T12:00:00.000Z",
          });

        const oldArticle =
          createNewsArticle({
            id: "article-old",
            sourceId:
              "source-old",

            publishedAtISO:
              "2026-07-19T10:00:00.000Z",
          });

        const stories =
          clusterArticles([
            recentArticle,
            oldArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );

    it(
      "permite agrupamento quando a data não foi informada",
      () => {
        const datedArticle =
          createNewsArticle({
            id: "article-dated",
            sourceId:
              "source-dated",
          });

        const articleWithoutDate =
          createNewsArticle({
            id: "article-without-date",
            sourceId:
              "source-without-date",

            title:
              "Novo projeto tributário é aprovado pelo Senado",

            publishedAtISO: null,
          });

        const stories =
          clusterArticles([
            datedArticle,
            articleWithoutDate,
          ]);

        expect(stories).toHaveLength(1);
      },
    );

    it(
      "gera o mesmo ID quando a ordem de entrada muda",
      () => {
        const newerArticle =
          createNewsArticle({
            id: "article-newer",
            sourceId:
              "source-newer",

            publishedAtISO:
              "2026-07-21T12:00:00.000Z",
          });

        const olderArticle =
          createNewsArticle({
            id: "article-older",
            sourceId:
              "source-older",

            title:
              "Novo projeto tributário é aprovado pelo Senado",

            publishedAtISO:
              "2026-07-21T10:00:00.000Z",
          });

        const firstResult =
          clusterArticles([
            newerArticle,
            olderArticle,
          ]);

        const secondResult =
          clusterArticles([
            olderArticle,
            newerArticle,
          ]);

        expect(
          firstResult[0]?.id,
        ).toBe(
          secondResult[0]?.id,
        );
      },
    );

    it(
      "não agrupa incorretamente títulos não latinos vazios após normalização",
      () => {
        const japaneseArticle =
          createNewsArticle({
            id: "article-ja",
            sourceId:
              "source-ja",

            title:
              "政府が新しい法案を発表",
            language: "ja",
          });

        const arabicArticle =
          createNewsArticle({
            id: "article-ar",
            sourceId:
              "source-ar",

            title:
              "الحكومة تعلن مشروع قانون جديد",
            language: "ar",
          });

        const stories =
          clusterArticles([
            japaneseArticle,
            arabicArticle,
          ]);

        expect(stories).toHaveLength(2);
      },
    );
  },
);
