import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import type {
  CountryNewsCard,
  CountryWithLatestNews,
  NewsCategory,
} from "@/domain/news/news.types";
import { CountryFlag, Box, Text } from "@/components";

export type CountryLatestNewsProps = {
  country: CountryWithLatestNews;

  category?: NewsCategory;
};

const categoryLabels: Record<NewsCategory, string> = {
  football: "Futebol",
  politics: "Política",
  economy: "Economia",
};

const categoryRouteSegments: Record<NewsCategory, string> = {
  football: "futebol",
  politics: "politica",
  economy: "economia",
};

export function CountryLatestNews({
  country,
  category,
}: CountryLatestNewsProps) {
  const visibleNews = category
    ? country.news.filter(
        (news) => news.category === category,
      )
    : country.news;

  const sectionTitle = category
    ? `${categoryLabels[category]} em ${country.name}`
    : `Últimas notícias de ${country.name}`;

  const allNewsHref = category
    ? `/paises/${country.slug}/${categoryRouteSegments[category]}`
    : `/paises/${country.slug}`;

  return (
    <Box
      as="section"
      aria-labelledby="country-latest-news-title"
      className="mt-10 w-full"
    >
      <Box
        display="flex"
        align="center"
        justify="between"
        gap="md"
      >
        <Box
          display="flex"
          align="center"
          gap="sm"
          className="min-w-0"
        >
          <CountryFlag
            code={country.code}
            countryName={country.name}
            className="h-7 w-10"
          />

          <Text
            id="country-latest-news-title"
            preset="sectionTitle"
            clamp={1}
          >
            {sectionTitle}
          </Text>
        </Box>

        <Link
          href={allNewsHref}
          className="
            shrink-0 rounded-control
            outline-none transition-opacity
            hover:opacity-70
            focus-visible:ring-2
            focus-visible:ring-ring
            focus-visible:ring-offset-2
          "
        >
          <Text
            as="span"
            preset="button"
            tone="accent"
          >
            Ver todas
          </Text>
        </Link>
      </Box>

      {visibleNews.length > 0 ? (
        <Box
          as="ul"
          className="
            mt-5 grid grid-cols-1 gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {visibleNews.map((news) => (
            <Box
              as="li"
              key={news.id}
              className="min-w-0"
            >
              <CountryNewsCard news={news} />
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyNewsState
          countryName={country.name}
          category={category}
        />
      )}
    </Box>
  );
}

type CountryNewsCardProps = {
  news: CountryNewsCard;
};

function CountryNewsCard({
  news,
}: CountryNewsCardProps) {
  return (
    <Link
      href={news.href}
      className="
        block h-full rounded-card
        outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
      "
      aria-label={`Ler notícia: ${news.title}`}
    >
      <Box
        as="article"
        preset="card"
        className="
          group flex h-full flex-col
          transition-all duration-200
          hover:-translate-y-1
          hover:border-border-strong
          hover:shadow-card-hover
        "
      >
        <NewsImage news={news} />

        <Box
          preset="stack"
          padding="md"
          className="flex-1"
        >
          <Box
            display="flex"
            align="center"
            gap="sm"
            className="flex-wrap"
          >
            <CategoryBadge category={news.category}>
              {news.categoryLabel}
            </CategoryBadge>

            <Text
              as="span"
              preset="categoryLabel"
              tone="muted"
            >
              {news.source}
            </Text>
          </Box>

          <Text
            preset="cardTitle"
            clamp={3}
            wrap="pretty"
            className="
              mt-4 transition-colors
              group-hover:text-primary
            "
          >
            {news.title}
          </Text>

          {news.excerpt && (
            <Text
              preset="bodySmall"
              tone="muted"
              clamp={2}
              wrap="pretty"
              className="mt-3"
            >
              {news.excerpt}
            </Text>
          )}

          <Text
            preset="metadata"
            tone="muted"
            className="mt-auto block pt-5"
          >
            {news.source} • {news.publishedAt}
          </Text>
        </Box>
      </Box>
    </Link>
  );
}

type NewsImageProps = {
  news: CountryNewsCard;
};

function NewsImage({
  news,
}: NewsImageProps) {
  if (!news.imageUrl) {
    return (
      <Box
        display="flex"
        align="center"
        justify="center"
        overflow="hidden"
        className={`
          aspect-[16/8]
          ${getNewsFallbackStyles(news.category)}
        `}
      >
        <Text
          as="span"
          preset="pageTitle"
          tone="inverse"
          aria-hidden="true"
        >
          {getCategorySymbol(news.category)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      overflow="hidden"
      className="aspect-[16/8]"
    >
      <Image
        src={news.imageUrl}
        alt={news.title}
        fill
        sizes="
          (max-width: 767px) 100vw,
          (max-width: 1279px) 50vw,
          33vw
        "
        className="
          object-cover
          transition-transform duration-300
          group-hover:scale-105
        "
      />
    </Box>
  );
}

type CategoryBadgeProps = {
  category: NewsCategory;
  children: ReactNode;
};

function CategoryBadge({
  category,
  children,
}: CategoryBadgeProps) {
  return (
    <Box
      as="span"
      radius="pill"
      paddingX="sm"
      paddingY="xs"
      className={getCategoryStyles(category)}
    >
      <Text
        as="span"
        preset="categoryLabel"
        tone="inherit"
      >
        {children}
      </Text>
    </Box>
  );
}

type EmptyNewsStateProps = {
  countryName: string;
  category?: NewsCategory;
};

function EmptyNewsState({
  countryName,
  category,
}: EmptyNewsStateProps) {
  const message = category
    ? `Nenhuma notícia de ${categoryLabels[category].toLowerCase()} disponível para ${countryName}.`
    : `Nenhuma notícia disponível para ${countryName}.`;

  return (
    <Box
      background="surfaceMuted"
      border="default"
      radius="card"
      padding="xl"
      className="mt-5 text-center"
    >
      <Text tone="muted">
        {message}
      </Text>
    </Box>
  );
}

function getCategoryStyles(
  category: NewsCategory,
): string {
  const styles: Record<NewsCategory, string> = {
    football:
      "bg-football-soft text-football-foreground",

    politics:
      "bg-politics-soft text-politics-foreground",

    economy:
      "bg-economy-soft text-economy-foreground",
  };

  return styles[category];
}

function getNewsFallbackStyles(
  category: NewsCategory,
): string {
  const styles: Record<NewsCategory, string> = {
    football:
      "bg-gradient-to-br from-brand-emphasis via-brand to-success",

    politics:
      "bg-gradient-to-br from-info-soft via-[#b7ccff] to-[#8fb2ff]",

    economy:
      "bg-gradient-to-br from-brand via-brand-emphasis to-[#081329]",
  };

  return styles[category];
}

function getCategorySymbol(
  category: NewsCategory,
): string {
  const symbols: Record<NewsCategory, string> = {
    football: "⚽",
    politics: "🏛️",
    economy: "📈",
  };

  return symbols[category];
}