import { ChevronDown } from "lucide-react";

import { Box, Text } from "@/components";

import type { RegionSelectorOption } from "../../RegionSelector.types";

export type RegionSelectorTriggerProps = {
  selectedOption: RegionSelectorOption;

  isOpen: boolean;
  disabled: boolean;
  menuId: string;
  onClick: () => void;
};

export function RegionSelectorTrigger({
  selectedOption,
  isOpen,
  disabled,
  menuId,
  onClick,
}: RegionSelectorTriggerProps) {
  const Icon = selectedOption.icon;

  return (
    <Box
      as="button"
      type="button"
      width="full"
      display="flex"
      align="center"
      justify="between"
      gap="md"
      background="card"
      border="default"
      radius="pill"
      paddingX="lg"
      disabled={disabled}
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={menuId}
      className={[
        "h-12 outline-none",
        "transition-colors",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-muted",
      ].join(" ")}
    >
      <Box display="flex" align="center" gap="sm" className="min-w-0">
        <Icon
          className="
            size-5 shrink-0
            text-primary
          "
          aria-hidden="true"
        />

        <Text as="span" preset="label" clamp={1}>
          {selectedOption.label}
        </Text>
      </Box>

      <ChevronDown
        className={[
          "size-4 shrink-0",
          "text-muted-foreground",
          "transition-transform duration-200",
          isOpen ? "rotate-180" : "",
        ].join(" ")}
        aria-hidden="true"
      />
    </Box>
  );
}
