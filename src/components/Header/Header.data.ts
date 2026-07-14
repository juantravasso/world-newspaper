import type { NavigationItem } from "./Header.types";

export const navigationItems = [
  {
    label: "Últimas",
    href: "/",
  },
  {
    label: "Futebol",
    href: "/futebol",
  },
  {
    label: "Política",
    href: "/politica",
  },
  {
    label: "Economia",
    href: "/economia",
  },
  {
    label: "Países",
    href: "/paises",
  },
] satisfies readonly NavigationItem[];