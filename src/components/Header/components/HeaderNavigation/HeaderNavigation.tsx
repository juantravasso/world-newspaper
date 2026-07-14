import Link from "next/link";

import { Box } from "@/components/Box";
import { Text } from "@/components/Text";

import type { NavigationItem } from "../../Header.types";
import { isNavigationItemActive } from "../../Header.utils";

export type HeaderNavigationProps = {
  pathname: string;
  items: readonly NavigationItem[];
};

export function HeaderNavigation({
  pathname,
  items,
}: HeaderNavigationProps) {
  return (
    <Box
      as="nav"
      aria-label="Navegação principal"
      className="hidden lg:block"
    >
      <Box
        as="ul"
        display="flex"
        align="center"
        gap="xl"
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
                className="
                  relative block py-3
                  transition-opacity
                  hover:opacity-70
                "
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
                    aria-hidden="true"
                    background="primary"
                    radius="pill"
                    className="
                      absolute inset-x-0
                      -bottom-0.5 h-0.5
                    "
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