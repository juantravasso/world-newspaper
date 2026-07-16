import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "./news.types";

export type NewsWithCountry =
  CountryNewsCard & {
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
  return countries
    .flatMap(
      (country) =>
        country.news.map(
          (news) => ({
            ...news,

            countryCode:
              country.code,

            countryName:
              country.name,

            countryFlag:
              country.flag,

            countrySlug:
              country.slug,
          }),
        ),
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
      new URL(imageUrl);

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
          item.id !==
          featuredNews?.id,
      )
      .slice(0, 2);

  return {
    featuredNews,
    secondaryNews,
  };
}
