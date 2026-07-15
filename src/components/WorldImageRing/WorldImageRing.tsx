import type {
  CSSProperties,
} from "react";

import {
  CountryFlag,
} from "@/components/CountryFlag";

import {
  Text,
} from "@/components/Text";

import type {
  CountryWithLatestNews,
} from "@/domain/news/news.types";

import styles from "./WorldImageRing.module.css";

type RingItemStyle =
  CSSProperties & {
    "--ring-angle": string;
  };

export type WorldImageRingProps = {
  countries:
    CountryWithLatestNews[];

  maxItems?: number;
};

export function WorldImageRing({
  countries,
  maxItems = 7,
}: WorldImageRingProps) {
  const ringCountries =
    countries.slice(0, maxItems);

  if (ringCountries.length < 2) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={styles.scene}
    >
      <div className={styles.ring}>
        {ringCountries.map(
          (country, index) => {
            const angle =
              (
                360 /
                ringCountries.length
              ) * index;

            const style:
              RingItemStyle = {
                "--ring-angle":
                  `${angle}deg`,
              };

            return (
              <div
                key={country.code}
                style={style}
                className={
                  styles.item
                }
              >
                <div
                  className="
                    flex w-28 items-center
                    gap-2 rounded-control
                    border border-border/80
                    bg-card/[95%]
                    px-3 py-2
                    shadow-card
                    backdrop-blur-md
                  "
                >
                  <CountryFlag
                    code={country.code}
                    countryName={
                      country.name
                    }
                    decorative
                  />

                  <Text
                    as="span"
                    preset="label"
                    clamp={1}
                  >
                    {country.name}
                  </Text>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
