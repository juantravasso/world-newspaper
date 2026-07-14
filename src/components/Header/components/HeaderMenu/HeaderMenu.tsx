import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";

import type { NavigationItem } from "../../Header.types";
import { isNavigationItemActive } from "../../Header.utils";

export type HeaderMenuProps = {
  isOpen: boolean;
  pathname: string;
  items: readonly NavigationItem[];
  onNavigate: () => void;
};

export function HeaderMenu({
  isOpen,
  pathname,
  items,
  onNavigate,
}: HeaderMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      id="header-navigation-menu"
      as="nav"
      aria-label="Menu de navegação"
      background="card"
      border="default"
      radius="card"
      shadow="floating"
      padding="sm"
      className="
        absolute right-4
        top-[calc(100%+0.75rem)]
        w-[calc(100%-2rem)]
        max-w-sm
        lg:right-10
      "
    >
      <Box
        as="ul"
        preset="stack"
        gap="2xs"
      >
        {items.map((item) => {
          const isActive =
            isNavigationItemActive(
              pathname,
              item.href,
            );

          return (
            <Box
              as="li"
              key={item.href}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex min-h-12 items-center justify-between",
                  "rounded-control px-4 transition-colors",
                  isActive
                    ? "bg-primary-soft"
                    : "hover:bg-surface-muted",
                ].join(" ")}
              >
                <Text
                  as="span"
                  preset="nav"
                  tone={
                    isActive
                      ? "accent"
                      : "default"
                  }
                >
                  {item.label}
                </Text>

                {isActive && (
                  <Box
                    as="span"
                    radius="pill"
                    background="primary"
                    className="size-2"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}