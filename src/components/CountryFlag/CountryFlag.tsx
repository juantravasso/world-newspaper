import ReactCountryFlag from "react-country-flag";

import type { CountryCode } from "@/domain/news/news.types";
import { cn } from "../lib/utils";


export type CountryFlagProps = {
  code: CountryCode;
  countryName: string;
  className?: string;
  decorative?: boolean;
};

export function CountryFlag({
  code,
  countryName,
  className,
  decorative = false,
}: CountryFlagProps) {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      title={decorative ? undefined : countryName}
      aria-label={
        decorative
          ? undefined
          : `Bandeira de ${countryName}`
      }
      aria-hidden={decorative || undefined}
      className={cn(
        "h-6 w-8 shrink-0 rounded-[0.2rem] object-cover",
        className,
      )}
    />
  );
}