import type {
  FormEventHandler,
} from "react";

import { Box } from "@/components/Box";

import { SearchForm } from "../SearchForm";

export type MobileSearchPanelProps = {
  isOpen: boolean;
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  onSubmit:
    FormEventHandler<HTMLFormElement>;
};

export function MobileSearchPanel({
  isOpen,
  search,
  onSearchChange,
  onSubmit,
}: MobileSearchPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      id="header-mobile-search"
      background="card"
      border="default"
      radius="card"
      shadow="floating"
      padding="md"
      className="
        absolute inset-x-4
        top-[calc(100%+0.75rem)]
        lg:hidden
      "
    >
      <SearchForm
        search={search}
        onSearchChange={onSearchChange}
        onSubmit={onSubmit}
        autoFocus
      />
    </Box>
  );
}