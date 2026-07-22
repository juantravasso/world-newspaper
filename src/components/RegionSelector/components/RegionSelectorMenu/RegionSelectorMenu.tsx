import { Box } from "@/components";

import type { RegionId } from "@/domain/geography";

import type { RegionSelectorOption } from "../../RegionSelector.types";

import { RegionSelectorItem } from "../RegionSelectorItem";

export type RegionSelectorMenuProps = {
  id: string;
  isOpen: boolean;

  selectedValue: RegionId;

  options: readonly RegionSelectorOption[];

  onSelect: (value: RegionId) => void;
};

export function RegionSelectorMenu({
  id,
  isOpen,
  selectedValue,
  options,
  onSelect,
}: RegionSelectorMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      id={id}
      role="menu"
      background="card"
      border="default"
      radius="card"
      shadow="floating"
      padding="xs"
      className="
        absolute left-0
        top-[calc(100%+0.75rem)]
        z-50 w-full
        min-w-[19rem]
        sm:left-auto sm:right-0
      "
    >
      <Box as="ul" role="none" preset="stack" gap="2xs">
        {options.map((option) => (
          <RegionSelectorItem
            key={option.value}
            option={option}
            isSelected={selectedValue === option.value}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </Box>
    </Box>
  );
}
