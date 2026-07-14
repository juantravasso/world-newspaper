"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { useRouter } from "next/navigation";

export function useHeader() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [
    isMobileSearchOpen,
    setIsMobileSearchOpen,
  ] = useState(false);

  function closePanels(): void {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const normalizedSearch = search.trim();

    if (!normalizedSearch) {
      return;
    }

    const searchParams =
      new URLSearchParams({
        q: normalizedSearch,
      });

    closePanels();

    router.push(
      `/buscar?${searchParams.toString()}`,
    );
  }

  function handleMenuClick(): void {
    setIsMenuOpen(
      (currentValue) => !currentValue,
    );

    setIsMobileSearchOpen(false);
  }

  function handleMobileSearchClick(): void {
    setIsMobileSearchOpen(
      (currentValue) => !currentValue,
    );

    setIsMenuOpen(false);
  }

  function closeMenu(): void {
    setIsMenuOpen(false);
  }

  return {
    search,
    isMenuOpen,
    isMobileSearchOpen,

    setSearch,
    handleSearch,
    handleMenuClick,
    handleMobileSearchClick,
    closeMenu,
    closePanels,
  };
}