import type {
  FormEventHandler,
} from "react";

import { Search } from "lucide-react";

import { Box } from "@/components/Box";
import { cn } from "@/components/lib/utils";

export type SearchFormProps = {
  search: string;
  onSearchChange: (
    value: string,
  ) => void;

  onSubmit:
    FormEventHandler<HTMLFormElement>;

  className?: string;
  autoFocus?: boolean;
};

export function SearchForm({
  search,
  onSearchChange,
  onSubmit,
  className,
  autoFocus = false,
}: SearchFormProps) {
  return (
    <Box
      as="form"
      role="search"
      display="flex"
      align="center"
      gap="sm"
      border="default"
      radius="pill"
      background="surfaceMuted"
      onSubmit={onSubmit}
      className={cn(
        "h-11 w-full px-4 transition-colors",
        "focus-within:border-primary focus-within:bg-card",
        "lg:w-60 xl:w-72",
        className,
      )}
    >
      <Search
        className="
          size-5 shrink-0
          text-foreground
        "
        aria-hidden="true"
      />

      <input
        type="search"
        value={search}
        autoFocus={autoFocus}
        onChange={(event) =>
          onSearchChange(
            event.target.value,
          )
        }
        placeholder="Buscar notícias"
        aria-label="Buscar notícias"
        className="
          min-w-0 flex-1 bg-transparent
          text-sm text-foreground
          outline-none
          placeholder:text-muted-foreground
        "
      />
    </Box>
  );
}