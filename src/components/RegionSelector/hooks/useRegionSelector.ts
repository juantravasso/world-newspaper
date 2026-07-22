"use client";

import { useEffect, useRef, useState } from "react";

import type { RegionId } from "@/domain/geography";

import type { RegionSelectorOption } from "../RegionSelector.types";

type UseRegionSelectorProps = {
  value?: RegionId;
  defaultValue: RegionId;

  options: readonly RegionSelectorOption[];

  onValueChange?: (value: RegionId) => void;
};

export function useRegionSelector({
  value,
  defaultValue,
  options,
  onValueChange,
}: UseRegionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [internalValue, setInternalValue] = useState<RegionId>(defaultValue);

  const isControlled = value !== undefined;

  const selectedValue = value ?? internalValue;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedInside = containerRef.current?.contains(target);

      if (!clickedInside) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggleMenu(): void {
    setIsOpen((currentValue) => !currentValue);
  }

  function closeMenu(): void {
    setIsOpen(false);
  }

  function selectRegion(nextValue: RegionId): void {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);

    closeMenu();
  }

  function selectPrevious(): void {
    selectByOffset(-1);
  }

  function selectNext(): void {
    selectByOffset(1);
  }

  function selectByOffset(offset: number): void {
    if (options.length === 0) {
      return;
    }

    const currentIndex = options.findIndex(
      (option) => option.value === selectedValue,
    );

    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

    const nextIndex =
      (safeCurrentIndex + offset + options.length) % options.length;

    const nextOption = options[nextIndex];

    if (!nextOption) {
      return;
    }

    selectRegion(nextOption.value);
  }

  return {
    containerRef,
    selectedValue,
    isOpen,

    toggleMenu,
    closeMenu,
    selectRegion,
    selectPrevious,
    selectNext,
  };
}
