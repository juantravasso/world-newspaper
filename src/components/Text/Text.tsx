import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "../lib/utils";

export type TextPreset =
  | "display"
  | "heroTitle"
  | "pageTitle"
  | "sectionTitle"
  | "featuredTitle"
  | "articleTitle"
  | "cardTitle"
  | "bodyLarge"
  | "body"
  | "bodySmall"
  | "nav"
  | "button"
  | "label"
  | "categoryLabel"
  | "eyebrow"
  | "metadata"
  | "caption";

export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "brand"
  | "accent"
  | "football"
  | "politics"
  | "economy"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "inherit";

export type TextAlign = "left" | "center" | "right" | "justify";

export type TextWrap = "normal" | "balance" | "pretty" | "nowrap";

export type TextClamp = 1 | 2 | 3 | 4 | 5 | 6;

const presetStyles: Record<TextPreset, string> = {
  display:
    "text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl",

  heroTitle:
    "text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[2.625rem]",

  pageTitle:
    "text-3xl font-bold leading-[1.12] tracking-[-0.03em] sm:text-4xl",

  sectionTitle:
    "text-2xl font-bold leading-tight tracking-[-0.025em] lg:text-[1.75rem]",

  featuredTitle:
    "text-2xl font-bold leading-[1.12] tracking-[-0.025em] sm:text-3xl lg:text-[2rem]",

  articleTitle:
    "text-xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-2xl",

  cardTitle:
    "text-lg font-bold leading-[1.22] tracking-[-0.015em]",

  bodyLarge:
    "text-lg font-normal leading-8",

  body:
    "text-base font-normal leading-7",

  bodySmall:
    "text-sm font-normal leading-6",

  nav:
    "text-sm font-semibold leading-5",

  button:
    "text-sm font-semibold leading-none",

  label:
    "text-sm font-semibold leading-5",

  categoryLabel:
    "text-[0.6875rem] font-bold uppercase leading-none tracking-[0.04em]",

  eyebrow:
    "text-xs font-bold uppercase leading-4 tracking-[0.14em]",

  metadata:
    "text-xs font-medium leading-4",

  caption:
    "text-xs font-normal leading-4",
};

const toneStyles: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-subtle-foreground",
  inverse: "text-inverse-foreground",

  brand: "text-brand",
  accent: "text-primary",

  football: "text-football-foreground",
  politics: "text-politics-foreground",
  economy: "text-economy-foreground",

  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",

  inherit: "text-inherit",
};

const alignStyles: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const wrapStyles: Record<TextWrap, string> = {
  normal: "text-wrap",
  balance: "text-balance",
  pretty: "text-pretty",
  nowrap: "whitespace-nowrap",
};

const clampStyles: Record<TextClamp, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const defaultElementByPreset: Record<TextPreset, ElementType> = {
  display: "h1",
  heroTitle: "h1",
  pageTitle: "h1",
  sectionTitle: "h2",
  featuredTitle: "h2",
  articleTitle: "h2",
  cardTitle: "h3",

  bodyLarge: "p",
  body: "p",
  bodySmall: "p",

  nav: "span",
  button: "span",
  label: "span",
  categoryLabel: "span",
  eyebrow: "span",
  metadata: "span",
  caption: "span",
};

type TextOwnProps = {
  children: ReactNode;

  /**
   * Define o elemento HTML.
   * Quando omitido, o componente utiliza o elemento
   * semântico padrão correspondente ao preset.
   */
  as?: ElementType;

  /**
   * Define tamanho, peso, altura da linha
   * e espaçamento entre letras.
   */
  preset?: TextPreset;

  /**
   * Define somente a cor semântica.
   */
  tone?: TextTone;

  align?: TextAlign;
  wrap?: TextWrap;
  clamp?: TextClamp;

  className?: string;
};

export type TextProps<T extends ElementType = "p"> = TextOwnProps &
  Omit<
    ComponentPropsWithoutRef<T>,
    keyof TextOwnProps | "color"
  >;

export function Text<T extends ElementType = "p">({
  as,
  preset = "body",
  tone = "default",
  align = "left",
  wrap = "normal",
  clamp,
  className,
  children,
  ...rest
}: TextProps<T>) {
  const Component = (as ??
    defaultElementByPreset[preset]) as ElementType;

  return (
    <Component
      className={cn(
        "font-sans",
        presetStyles[preset],
        toneStyles[tone],
        alignStyles[align],
        wrapStyles[wrap],
        clamp && clampStyles[clamp],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}