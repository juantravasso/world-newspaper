import type { ReactNode } from "react";

import type { NewsWithCountry } from "@/domain/news/news.helpers";

export type HeroProps = {
  title: string;
  description: string;

  featuredNews?: NewsWithCountry;
  secondaryNews?: NewsWithCountry[];

  /**
   * Espaço destinado a ações do Hero,
   * como o seletor de continentes.
   */
  actions?: ReactNode;

  emptyMessage?: string;
};