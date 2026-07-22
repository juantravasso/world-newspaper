"use client";

import { useId } from "react";

import { RegionOptions, getRegionOption } from "./RegionSelector.data";

import {
  RegionCarouselControls,
  RegionSelectorMenu,
  RegionSelectorTrigger,
} from "./components";

import { useRegionSelector } from "./hooks/useRegionSelector";

import type { RegionSelectorProps } from "./RegionSelector.types";

export function RegionSelector({
  value,
  defaultValue = "world",
  onValueChange,
  showArrows = true,
  disabled = false,
  className,
}: RegionSelectorProps) {
  const menuId = useId();

  const {
    containerRef,
    selectedValue,
    isOpen,
    toggleMenu,
    selectRegion,
    selectPrevious,
    selectNext,
  } = useRegionSelector({
    value,
    defaultValue,
    options: RegionOptions,
    onValueChange,
  });

  const selectedOption = getRegionOption(selectedValue);

  const trigger = (
    <RegionSelectorTrigger
      selectedOption={selectedOption}
      isOpen={isOpen}
      disabled={disabled}
      menuId={menuId}
      onClick={toggleMenu}
    />
  );

  return (
    <div
      ref={containerRef}
      className={[
        "relative w-full shrink-0",
        showArrows ? "sm:w-[23rem]" : "sm:w-64",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showArrows ? (
        <RegionCarouselControls
          disabled={disabled}
          onPrevious={selectPrevious}
          onNext={selectNext}
        >
          {trigger}
        </RegionCarouselControls>
      ) : (
        trigger
      )}

      <RegionSelectorMenu
        id={menuId}
        isOpen={isOpen}
        selectedValue={selectedValue}
        options={RegionOptions}
        onSelect={selectRegion}
      />
    </div>
  );
}
