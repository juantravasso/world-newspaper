"use client";

import {
  useId,
} from "react";

import {
  continentOptions,
  getContinentOption,
} from "./ContinentSelector.data";

import {
  ContinentCarouselControls,
  ContinentSelectorMenu,
  ContinentSelectorTrigger,
} from "./components";

import {
  useContinentSelector,
} from "./hooks/useContinentSelector";

import type {
  ContinentSelectorProps,
} from "./ContinentSelector.types";

export function ContinentSelector({
  value,
  defaultValue = "world",
  onValueChange,
  showArrows = true,
  disabled = false,
  className,
}: ContinentSelectorProps) {
  const menuId = useId();

  const {
    containerRef,
    selectedValue,
    isOpen,
    toggleMenu,
    selectContinent,
    selectPrevious,
    selectNext,
  } = useContinentSelector({
    value,
    defaultValue,
    options: continentOptions,
    onValueChange,
  });

  const selectedOption =
    getContinentOption(
      selectedValue,
    );

  const trigger = (
    <ContinentSelectorTrigger
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
        showArrows
          ? "sm:w-[23rem]"
          : "sm:w-64",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showArrows ? (
        <ContinentCarouselControls
          disabled={disabled}
          onPrevious={
            selectPrevious
          }
          onNext={selectNext}
        >
          {trigger}
        </ContinentCarouselControls>
      ) : (
        trigger
      )}

      <ContinentSelectorMenu
        id={menuId}
        isOpen={isOpen}
        selectedValue={
          selectedValue
        }
        options={continentOptions}
        onSelect={selectContinent}
      />
    </div>
  );
}