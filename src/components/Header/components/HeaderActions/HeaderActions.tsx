import type {
  FormEventHandler,
} from "react";

import {
  Menu,
  Search,
  X,
} from "lucide-react";

import { Box } from "@/components/Box";

import { SearchForm } from "../SearchForm";

export type HeaderActionsProps = {
  search: string;

  isMenuOpen: boolean;
  isMobileSearchOpen: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onSearchSubmit:
    FormEventHandler<HTMLFormElement>;

  onMenuClick: () => void;
  onMobileSearchClick: () => void;
};

export function HeaderActions({
  search,
  isMenuOpen,
  isMobileSearchOpen,
  onSearchChange,
  onSearchSubmit,
  onMenuClick,
  onMobileSearchClick,
}: HeaderActionsProps) {
  return (
    <Box
      display="flex"
      align="center"
      gap="sm"
      className="shrink-0"
    >
      <SearchForm
        search={search}
        onSearchChange={onSearchChange}
        onSubmit={onSearchSubmit}
        className="hidden lg:flex"
      />

      <Box
        as="button"
        type="button"
        display="flex"
        align="center"
        justify="center"
        radius="pill"
        border="default"
        background="surfaceMuted"
        onClick={onMobileSearchClick}
        aria-label={
          isMobileSearchOpen
            ? "Fechar busca"
            : "Abrir busca"
        }
        aria-expanded={
          isMobileSearchOpen
        }
        aria-controls="header-mobile-search"
        className="
          size-11 transition-colors
          hover:bg-secondary
          lg:hidden
        "
      >
        {isMobileSearchOpen ? (
          <X
            className="
              size-5 text-foreground
            "
            aria-hidden="true"
          />
        ) : (
          <Search
            className="
              size-5 text-foreground
            "
            aria-hidden="true"
          />
        )}
      </Box>

      <Box
        as="button"
        type="button"
        display="flex"
        align="center"
        justify="center"
        radius="pill"
        background="brand"
        onClick={onMenuClick}
        aria-label={
          isMenuOpen
            ? "Fechar menu"
            : "Abrir menu"
        }
        aria-expanded={isMenuOpen}
        aria-controls="header-navigation-menu"
        className="
          size-11 text-brand-foreground
          transition-colors
          hover:bg-brand-hover
          lg:size-12
        "
      >
        {isMenuOpen ? (
          <X
            className="size-6"
            aria-hidden="true"
          />
        ) : (
          <Menu
            className="size-6"
            aria-hidden="true"
          />
        )}
      </Box>
    </Box>
  );
}