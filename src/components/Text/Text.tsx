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

/*
 * Serifa editorial nos títulos (credibilidade de
 * publicação), sans na interface e no corpo, mono
 * na linha de crédito (país, veículo, idioma, hora).
 */
const presetStyles: Record<TextPreset, string> = {
  display:
    "font-serif text-5xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl",

  heroTitle:
    "font-serif text-[2rem] font-medium leading-[1.1] tracking-[-0.015em] sm:text-4xl lg:text-[2.75rem]",

  pageTitle:
    "font-serif text-3xl font-medium leading-[1.12] tracking-[-0.015em] sm:text-4xl",

  sectionTitle:
    "font-serif text-2xl font-medium leading-tight tracking-[-0.01em] lg:text-[1.75rem]",

  featuredTitle:
    "font-serif text-2xl font-medium leading-[1.15] tracking-[-0.01em] sm:text-3xl lg:text-[2rem]",

  articleTitle:
    "font-serif text-xl font-medium leading-[1.22] tracking-[-0.005em] sm:text-2xl",

  cardTitle:
    "font-serif text-lg font-medium leading-[1.28]",

  bodyLarge:
    "font-sans text-lg font-normal leading-8",

  body:
    "font-sans text-base font-normal leading-7",

  bodySmall:
    "font-sans text-sm font-normal leading-6",

  nav:
    "font-sans text-sm font-medium leading-5",

  button:
    "font-sans text-sm font-semibold leading-none",

  label:
    "font-sans text-sm font-semibold leading-5",

  categoryLabel:
    "font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.06em]",

  eyebrow:
    "font-mono text-xs font-medium uppercase leading-4 tracking-[0.1em]",

  metadata:
    "font-mono text-[0.75rem] font-normal leading-4",

  caption:
    "font-sans text-xs font-normal leading-4",
};

const toneStyles: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  subtle: "text-subtle-foreground",
  inverse: "text-inverse-foreground",

  brand: "text-brand",
  accent: "text-primary",

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