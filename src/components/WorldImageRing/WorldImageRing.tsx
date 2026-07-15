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

export type WorldImageRingProps = {
  countries:
    CountryWithLatestNews[];

  maxItems?: number;
};

export function WorldImageRing({
  countries,
  maxItems = 8,
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

            const style: CSSProperties = {
              transform:
                `rotateY(${angle}deg) translateZ(148px)`,
            };

            return (
              <div
                key={country.code}
                style={style}
                className={styles.item}
              >
                <div
                  className="
                    flex w-32 items-center gap-2
                    rounded-control border border-border/80
                    bg-card/90 px-3 py-2
                    shadow-floating backdrop-blur-md
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
