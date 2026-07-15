import type {
  LucideIcon,
} from "lucide-react";

import type {
  ContinentId,
} from "@/domain/geography";

export type ContinentOption = Readonly<{
  value: ContinentId;
  label: string;
  description: string;
}>;

export type ContinentSelectorOption =
  ContinentOption & {
    icon: LucideIcon;
  };

export type ContinentSelectorProps = {
  value?: ContinentId;

  /**
   * @default "world"
   */
  defaultValue?: ContinentId;

  onValueChange?: (
    value: ContinentId,
  ) => void;

  /**
   * Exibe as setas de continente
   * anterior e próximo.
   *
   * @default true
   */
  showArrows?: boolean;

  disabled?: boolean;
  className?: string;
};