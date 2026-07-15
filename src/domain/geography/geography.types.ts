export type ContinentId =
  | "world"
  | "america"
  | "europe"
  | "africa"
  | "asia"
  | "oceania"
  | "oriente-medio";

export type CountryRegionId =
  Exclude<
    ContinentId,
    "world"
  >;