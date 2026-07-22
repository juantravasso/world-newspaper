import { Check } from "lucide-react";

import { Box, Text } from "@/components";

import type { RegionSelectorOption } from "../../RegionSelector.types";

export type RegionSelectorItemProps = {
  option: RegionSelectorOption;
  isSelected: boolean;
  onSelect: () => void;
};

export function RegionSelectorItem({
  option,
  isSelected,
  onSelect,
}: RegionSelectorItemProps) {
  const Icon = option.icon;

  return (
    <Box as="li" role="none">
      <Box
        as="button"
        type="button"
        role="menuitemradio"
        aria-checked={isSelected}
        width="full"
        display="flex"
        align="center"
        justify="between"
        gap="md"
        radius="control"
        padding="sm"
        onClick={onSelect}
        className={[
          "min-h-14 text-left",
          "outline-none",
          "transition-colors",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          isSelected ? "bg-primary-soft" : "hover:bg-surface-muted",
        ].join(" ")}
      >
        <Box display="flex" align="center" gap="sm" className="min-w-0">
          <Box
            display="flex"
            align="center"
            justify="center"
            background={isSelected ? "card" : "surfaceMuted"}
            radius="pill"
            className="size-9 shrink-0"
          >
            <Icon
              className={[
                "size-4",
                isSelected ? "text-primary" : "text-muted-foreground",
              ].join(" ")}
              aria-hidden="true"
            />
          </Box>

          <Box preset="stack" gap="2xs" className="min-w-0">
            <Text
              as="span"
              preset="label"
              tone={isSelected ? "accent" : "default"}
              clamp={1}
            >
              {option.label}
            </Text>

            <Text as="span" preset="caption" tone="muted" clamp={1}>
              {option.description}
            </Text>
          </Box>
        </Box>

        {isSelected && (
          <Check
            className="
              size-5 shrink-0
              text-primary
            "
            aria-hidden="true"
          />
        )}
      </Box>
    </Box>
  );
}
