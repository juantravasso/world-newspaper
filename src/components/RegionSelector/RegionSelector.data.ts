import {
  Globe2,
  Landmark,
  MapPinned,
  MoonStar,
  Mountain,
  Sun,
  Waves,
} from "lucide-react";

import type { RegionId } from "@/domain/geography";

import type { RegionSelectorOption } from "./RegionSelector.types";

export const RegionOptions = [
  {
    value: "world",
    label: "Mundo",
    description: "Notícias de todas as regiões",
    icon: Globe2,
  },
  {
    value: "north-america",

    label: "América do Norte",

    description: "Canadá, Estados Unidos e México",

    icon: MapPinned,
  },

  {
    value: "central-america",

    label: "América Central",

    description: "Países da América Central",

    icon: MapPinned,
  },

  {
    value: "south-america",

    label: "América do Sul",

    description: "Países sul-americanos",

    icon: MapPinned,
  },
  {
    value: "europe",
    label: "Europa",
    description: "Notícias dos países europeus",
    icon: Landmark,
  },
  {
    value: "africa",
    label: "África",
    description: "Notícias dos países africanos",
    icon: Sun,
  },
  {
    value: "asia",
    label: "Ásia",
    description: "Notícias dos países asiáticos",
    icon: Mountain,
  },
  {
    value: "oceania",
    label: "Oceania",
    description: "Austrália, Nova Zelândia e Pacífico",
    icon: Waves,
  },
  {
    value: "oriente-medio",
    label: "Oriente Médio",
    description: "Notícias dos países da região",
    icon: MoonStar,
  },
] satisfies readonly RegionSelectorOption[];

export function getRegionOption(
  value: RegionId,
): RegionSelectorOption {
  return (
    RegionOptions.find((option) => option.value === value) ??
    RegionOptions[0]
  );
}
