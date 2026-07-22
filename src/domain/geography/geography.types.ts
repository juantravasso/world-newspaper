export type RegionId =
  | "world"
  | "north-america"
  | "central-america"
  | "south-america"
  | "europe"
  | "africa"
  | "asia"
  | "oceania"
  | "oriente-medio";

export type CountryRegionId =
  Exclude<
    RegionId,
    "world"
  >;