import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "./news.types";

export type NewsWithCountry =
  CountryNewsCard & {
    storyId: string;

    countryCode: string;
    countryName: string;
    countryFlag: string;
    countrySlug: string;
  };

export type HeroNewsSelection = {
  featuredNews:
    | NewsWithCountry
    | undefined;

  secondaryNews:
    NewsWithCountry[];
};

export function getNewsFromCountries(
  countries:
    CountryWithLatestNews[],

  category?:
    NewsCategory,
): NewsWithCountry[] {
  const newsWithStories =
    countries.flatMap(
      (country) => {
        const storyIdByArticleId =
          new Map<
            string,
            string
          >();

        for (
          const story of
          country.stories
        ) {
          for (
            const article of
            story.articles
          ) {
            storyIdByArticleId.set(
              article.id,
              story.id,
            );
          }
        }

        return country.news.flatMap(
          (news) => {
            const storyId =
              storyIdByArticleId.get(
                news.id,
              );

            /*
             * Toda notícia deveria pertencer
             * a uma story, pois os artigos
             * são criados a partir de
             * country.news.
             */
            if (!storyId) {
              return [];
            }

            return [
              {
                ...news,

                storyId,

                countryCode:
                  country.code,

                countryName:
                  country.name,

                countryFlag:
                  country.flag,

                countrySlug:
                  country.slug,
              },
            ];
          },
        );
      },
    )
      .filter((news) => {
        if (!category) {
          return true;
        }

        return (
          news.category ===
          category
        );
      });

  /*
   * Uma story pode possuir várias
   * matérias. O Hero deve mostrar
   * somente um card para cada story.
   */
  const uniqueNewsByStory =
    new Map<
      string,
      NewsWithCountry
    >();

  for (
    const news of
    newsWithStories
  ) {
    if (
      uniqueNewsByStory.has(
        news.storyId,
      )
    ) {
      continue;
    }

    uniqueNewsByStory.set(
      news.storyId,
      news,
    );
  }

  return [
    ...uniqueNewsByStory.values(),
  ];
}

/**
 * Considera imagem extraída somente
 * quando a notícia possui uma URL HTTP(S).
 *
 * Placeholders locais não tornam uma
 * notícia elegível para o destaque.
 */
export function hasExtractedImage(
  news:
    Pick<
      CountryNewsCard,
      "imageUrl"
    >,
): boolean {
  const imageUrl =
    news.imageUrl?.trim();

  if (!imageUrl) {
    return false;
  }

  try {
    const url =
      new URL(
        imageUrl,
      );

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

/**
 * O destaque principal sempre exige
 * uma imagem extraída do veículo.
 *
 * As notícias secundárias excluem o
 * destaque selecionado.
 */
export function selectHeroNews(
  news:
    NewsWithCountry[],
): HeroNewsSelection {
  const featuredNews =
    news.find(
      hasExtractedImage,
    );

  const secondaryNews =
    news
      .filter(
        (item) =>
          item.storyId !==
          featuredNews?.storyId,
      )
      .slice(
        0,
        2,
      );

  return {
    featuredNews,
    secondaryNews,
  };
}