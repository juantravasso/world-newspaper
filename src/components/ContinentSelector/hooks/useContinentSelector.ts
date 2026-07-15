"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ContinentId,
} from "@/domain/geography";

import type {
  ContinentSelectorOption,
} from "../ContinentSelector.types";

type UseContinentSelectorProps = {
  value?: ContinentId;
  defaultValue: ContinentId;

  options:
    readonly ContinentSelectorOption[];

  onValueChange?: (
    value: ContinentId,
  ) => void;
};

export function useContinentSelector({
  value,
  defaultValue,
  options,
  onValueChange,
}: UseContinentSelectorProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    internalValue,
    setInternalValue,
  ] = useState<ContinentId>(
    defaultValue,
  );

  const isControlled =
    value !== undefined;

  const selectedValue =
    value ?? internalValue;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedInside =
        containerRef.current?.contains(
          target,
        );

      if (!clickedInside) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen]);

  function toggleMenu(): void {
    setIsOpen(
      (currentValue) => !currentValue,
    );
  }

  function closeMenu(): void {
    setIsOpen(false);
  }

  function selectContinent(
    nextValue: ContinentId,
  ): void {
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

  function selectByOffset(
    offset: number,
  ): void {
    if (options.length === 0) {
      return;
    }

    const currentIndex =
      options.findIndex(
        (option) =>
          option.value ===
          selectedValue,
      );

    const safeCurrentIndex =
      currentIndex >= 0
        ? currentIndex
        : 0;

    const nextIndex =
      (
        safeCurrentIndex +
        offset +
        options.length
      ) % options.length;

    const nextOption =
      options[nextIndex];

    if (!nextOption) {
      return;
    }

    selectContinent(
      nextOption.value,
    );
  }

  return {
    containerRef,
    selectedValue,
    isOpen,

    toggleMenu,
    closeMenu,
    selectContinent,
    selectPrevious,
    selectNext,
  };
}