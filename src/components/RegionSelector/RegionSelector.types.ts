import type {
  LucideIcon,
} from "lucide-react";

import type {
  RegionId,
} from "@/domain/geography";

export type RegionOption = Readonly<{
  value: RegionId;
  label: string;
  description: string;
}>;

export type RegionSelectorOption =
  RegionOption & {
    icon: LucideIcon;
  };

export type RegionSelectorProps = {
  value?: RegionId;

  /**
   * @default "world"
   */
  defaultValue?: RegionId;

  onValueChange?: (
    value: RegionId,
  ) => void;

  /**
   * Exibe as setas de Regione
   * anterior e próximo.
   *
   * @default true
   */
  showArrows?: boolean;

  disabled?: boolean;
  className?: string;
};