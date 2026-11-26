import type {
  CountryCode,
} from "@/domain/news/news.types";

/**
 * Nomes em inglês usados só para montar a busca
 * de imagens no Pexels — o catálogo de países
 * exibido no site continua em português.
 */
export const countryNameInEnglish:
  Record<
    CountryCode,
    string
  > = {
  AE:
    "United Arab Emirates",
  AR:
    "Argentina",
  AU:
    "Australia",
  BO:
    "Bolivia",
  BR:
    "Brazil",
  BZ:
    "Belize",
  CA:
    "Canada",
  CL:
    "Chile",
  CN:
    "China",
  CO:
    "Colombia",
  CR:
    "Costa Rica",
  DE:
    "Germany",
  EC:
    "Ecuador",
  EG:
    "Egypt",
  ES:
    "Spain",
  FJ:
    "Fiji",
  FR:
    "France",
  GB:
    "United Kingdom",
  GH:
    "Ghana",
  GT:
    "Guatemala",
  GY:
    "Guyana",
  HN:
    "Honduras",
  ID:
    "Indonesia",
  IL:
    "Israel",
  IN:
    "India",
  IT:
    "Italy",
  JO:
    "Jordan",
  JP:
    "Japan",
  KE:
    "Kenya",
  KR:
    "South Korea",
  MA:
    "Morocco",
  MX:
    "Mexico",
  NG:
    "Nigeria",
  NI:
    "Nicaragua",
  NL:
    "Netherlands",
  NZ:
    "New Zealand",
  PA:
    "Panama",
  PE:
    "Peru",
  PH:
    "Philippines",
  PL:
    "Poland",
  PT:
    "Portugal",
  PY:
    "Paraguay",
  QA:
    "Qatar",
  SA:
    "Saudi Arabia",
  SE:
    "Sweden",
  SR:
    "Suriname",
  SV:
    "El Salvador",
  TH:
    "Thailand",
  TR:
    "Turkey",
  TZ:
    "Tanzania",
  US:
    "United States",
  UY:
    "Uruguay",
  VE:
    "Venezuela",
  VN:
    "Vietnam",
  ZA:
    "South Africa",
};
