import {
  Globe2,
  Landmark,
  MapPinned,
  MoonStar,
  Mountain,
  Sun,
  Waves,
} from "lucide-react";

import type {
  ContinentId,
} from "@/domain/geography";

import type {
  ContinentSelectorOption,
} from "./ContinentSelector.types";

export const continentOptions = [
  {
    value: "world",
    label: "Mundo",
    description:
      "Notícias de todas as regiões",
    icon: Globe2,
  },
  {
    value: "america",
    label: "América",
    description:
      "América do Norte, Central e do Sul",
    icon: MapPinned,
  },
  {
    value: "europe",
    label: "Europa",
    description:
      "Notícias dos países europeus",
    icon: Landmark,
  },
  {
    value: "africa",
    label: "África",
    description:
      "Notícias dos países africanos",
    icon: Sun,
  },
  {
    value: "asia",
    label: "Ásia",
    description:
      "Notícias dos países asiáticos",
    icon: Mountain,
  },
  {
    value: "oceania",
    label: "Oceania",
    description:
      "Austrália, Nova Zelândia e Pacífico",
    icon: Waves,
  },
  {
    value: "oriente-medio",
    label: "Oriente Médio",
    description:
      "Notícias dos países da região",
    icon: MoonStar,
  },
] satisfies readonly ContinentSelectorOption[];

export function getContinentOption(
  value: ContinentId,
): ContinentSelectorOption {
  return (
    continentOptions.find(
      (option) => option.value === value,
    ) ?? continentOptions[0]
  );
}