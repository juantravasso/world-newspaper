import type {
  NavigationItem,
} from "./Header.types";

export const navigationItems = [
  {
    label:
      "Home",

    href:
      "/",
  },

  {
    label:
      "Últimas",

    href:
      "/noticias",
  },

  {
    label:
      "Política",

    href:
      "/politica",
  },

  {
    label:
      "Economia",

    href:
      "/economia",
  },

  {
    label:
      "Países",

    href:
      "/paises",
  },

  {
    label:
      "Minha seleção",

    href:
      "/minha-selecao",
  },
] satisfies readonly NavigationItem[];
