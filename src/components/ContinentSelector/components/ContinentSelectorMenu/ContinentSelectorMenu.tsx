import {
  Box,
} from "@/components";

import type {
  ContinentId,
} from "@/domain/geography";

import type {
  ContinentSelectorOption,
} from "../../ContinentSelector.types";

import {
  ContinentSelectorItem,
} from "../ContinentSelectorItem";

export type ContinentSelectorMenuProps = {
  id: string;
  isOpen: boolean;

  selectedValue: ContinentId;

  options:
    readonly ContinentSelectorOption[];

  onSelect: (
    value: ContinentId,
  ) => void;
};

export function ContinentSelectorMenu({
  id,
  isOpen,
  selectedValue,
  options,
  onSelect,
}: ContinentSelectorMenuProps) {
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
      <Box
        as="ul"
        role="none"
        preset="stack"
        gap="2xs"
      >
        {options.map((option) => (
          <ContinentSelectorItem
            key={option.value}
            option={option}
            isSelected={
              selectedValue ===
              option.value
            }
            onSelect={() =>
              onSelect(option.value)
            }
          />
        ))}
      </Box>
    </Box>
  );
}