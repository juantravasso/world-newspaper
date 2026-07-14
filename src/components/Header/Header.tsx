"use client";

import { usePathname } from "next/navigation";

import { Box } from "@/components/Box";

import { navigationItems } from "./Header.data";
import {
  HeaderActions,
  HeaderLogo,
  HeaderMenu,
  HeaderNavigation,
  MobileSearchPanel,
} from "./components";
import { useHeader } from "./hooks/useHeader";

export function Header() {
  const pathname = usePathname();

  return (
    <HeaderContent
      key={pathname}
      pathname={pathname}
    />
  );
}

type HeaderContentProps = {
  pathname: string;
};

function HeaderContent({
  pathname,
}: HeaderContentProps) {
  const {
    search,
    isMenuOpen,
    isMobileSearchOpen,

    setSearch,
    handleSearch,
    handleMenuClick,
    handleMobileSearchClick,
    closeMenu,
  } = useHeader();

  return (
    <Box
      as="header"
      background="card"
      border="bottom"
      width="full"
      className="sticky top-0 z-50"
    >
      <Box
        preset="container"
        position="relative"
        display="flex"
        align="center"
        justify="between"
        gap="lg"
        className="
          min-h-20 py-3
          lg:min-h-24
        "
      >
        <HeaderLogo />

        <HeaderNavigation
          pathname={pathname}
          items={navigationItems}
        />

        <HeaderActions
          search={search}
          isMenuOpen={isMenuOpen}
          isMobileSearchOpen={
            isMobileSearchOpen
          }
          onSearchChange={setSearch}
          onSearchSubmit={handleSearch}
          onMenuClick={handleMenuClick}
          onMobileSearchClick={
            handleMobileSearchClick
          }
        />

        <MobileSearchPanel
          isOpen={isMobileSearchOpen}
          search={search}
          onSearchChange={setSearch}
          onSubmit={handleSearch}
        />

        <HeaderMenu
          isOpen={isMenuOpen}
          pathname={pathname}
          items={navigationItems}
          onNavigate={closeMenu}
        />
      </Box>
    </Box>
  );
}