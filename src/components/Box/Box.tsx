import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "../lib/utils";



export type BoxPreset =
  | "none"
  | "page"
  | "container"
  | "section"
  | "card"
  | "header"
  | "footer"
  | "stack"
  | "cluster"
  | "center"
  | "grid"
  | "newsGrid";

export type BoxDisplay =
  | "block"
  | "inlineBlock"
  | "flex"
  | "inlineFlex"
  | "grid"
  | "hidden";

export type BoxDirection = "row" | "column" | "rowReverse" | "columnReverse";

export type BoxAlign =
  | "start"
  | "center"
  | "end"
  | "stretch"
  | "baseline";

export type BoxJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export type BoxSpace =
  | "none"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export type BoxBackground =
  | "transparent"
  | "page"
  | "card"
  | "surface"
  | "surfaceMuted"
  | "surfaceStrong"
  | "brand"
  | "brandEmphasis"
  | "primary"
  | "primarySoft"
  | "footballSoft"
  | "politicsSoft"
  | "economySoft";

export type BoxBorder =
  | "none"
  | "default"
  | "strong"
  | "top"
  | "bottom";

export type BoxRadius =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "card"
  | "smallCard"
  | "control"
  | "button"
  | "pill";

export type BoxShadow =
  | "none"
  | "card"
  | "cardHover"
  | "header"
  | "floating";

export type BoxWidth = "auto" | "full" | "fit" | "screen";

export type BoxPosition =
  | "static"
  | "relative"
  | "absolute"
  | "fixed"
  | "sticky";

export type BoxOverflow =
  | "visible"
  | "hidden"
  | "auto"
  | "scroll"
  | "xAuto"
  | "yAuto";

const presetStyles: Record<BoxPreset, string> = {
  none: "",

  page:
    "min-h-screen w-full bg-background text-foreground",

  container:
    "mx-auto w-full max-w-[80rem] px-4 sm:px-8 lg:px-10",

  section:
    "w-full py-12 sm:py-16 lg:py-20",

  card:
    "overflow-hidden rounded-card border border-border bg-card shadow-card",

  header:
    "w-full border-b border-border bg-card shadow-header",

  footer:
    "w-full bg-brand",

  stack:
    "flex flex-col",

  cluster:
    "flex flex-wrap items-center",

  center:
    "flex items-center justify-center",

  grid:
    "grid grid-cols-1",

  newsGrid:
    "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3",
};

const displayStyles: Record<BoxDisplay, string> = {
  block: "block",
  inlineBlock: "inline-block",
  flex: "flex",
  inlineFlex: "inline-flex",
  grid: "grid",
  hidden: "hidden",
};

const directionStyles: Record<BoxDirection, string> = {
  row: "flex-row",
  column: "flex-col",
  rowReverse: "flex-row-reverse",
  columnReverse: "flex-col-reverse",
};

const alignStyles: Record<BoxAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyStyles: Record<BoxJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const gapStyles: Record<BoxSpace, string> = {
  none: "gap-0",
  "2xs": "gap-1",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const paddingStyles: Record<BoxSpace, string> = {
  none: "p-0",
  "2xs": "p-1",
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

const paddingXStyles: Record<BoxSpace, string> = {
  none: "px-0",
  "2xs": "px-1",
  xs: "px-2",
  sm: "px-3",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
};

const paddingYStyles: Record<BoxSpace, string> = {
  none: "py-0",
  "2xs": "py-1",
  xs: "py-2",
  sm: "py-3",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
  "2xl": "py-12",
};

const backgroundStyles: Record<BoxBackground, string> = {
  transparent: "bg-transparent",
  page: "bg-background",
  card: "bg-card",
  surface: "bg-surface",
  surfaceMuted: "bg-surface-muted",
  surfaceStrong: "bg-surface-strong",
  brand: "bg-brand",
  brandEmphasis: "bg-brand-emphasis",
  primary: "bg-primary",
  primarySoft: "bg-primary-soft",
  footballSoft: "bg-football-soft",
  politicsSoft: "bg-politics-soft",
  economySoft: "bg-economy-soft",
};

const borderStyles: Record<BoxBorder, string> = {
  none: "border-0",
  default: "border border-border",
  strong: "border border-border-strong",
  top: "border-t border-border",
  bottom: "border-b border-border",
};

const radiusStyles: Record<BoxRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  card: "rounded-card",
  smallCard: "rounded-card-small",
  control: "rounded-control",
  button: "rounded-button",
  pill: "rounded-pill",
};

const shadowStyles: Record<BoxShadow, string> = {
  none: "shadow-none",
  card: "shadow-card",
  cardHover: "shadow-card-hover",
  header: "shadow-header",
  floating: "shadow-floating",
};

const widthStyles: Record<BoxWidth, string> = {
  auto: "w-auto",
  full: "w-full",
  fit: "w-fit",
  screen: "w-screen",
};

const positionStyles: Record<BoxPosition, string> = {
  static: "static",
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
  sticky: "sticky",
};

const overflowStyles: Record<BoxOverflow, string> = {
  visible: "overflow-visible",
  hidden: "overflow-hidden",
  auto: "overflow-auto",
  scroll: "overflow-scroll",
  xAuto: "overflow-x-auto overflow-y-hidden",
  yAuto: "overflow-y-auto overflow-x-hidden",
};

type BoxOwnProps<T extends ElementType> = {
  /**
   * Elemento HTML que será renderizado.
   *
   * @default "div"
   */
  as?: T;

  children?: ReactNode;

  /**
   * Configuração de layout pronta para contextos comuns.
   */
  preset?: BoxPreset;

  display?: BoxDisplay;
  direction?: BoxDirection;
  align?: BoxAlign;
  justify?: BoxJustify;

  gap?: BoxSpace;

  padding?: BoxSpace;
  paddingX?: BoxSpace;
  paddingY?: BoxSpace;

  background?: BoxBackground;
  border?: BoxBorder;
  radius?: BoxRadius;
  shadow?: BoxShadow;

  width?: BoxWidth;
  position?: BoxPosition;
  overflow?: BoxOverflow;

  className?: string;
};

export type BoxProps<T extends ElementType = "div"> =
  BoxOwnProps<T> &
    Omit<
      ComponentPropsWithoutRef<T>,
      keyof BoxOwnProps<T>
    >;

export function Box<T extends ElementType = "div">({
  as,
  children,
  preset = "none",
  display,
  direction,
  align,
  justify,
  gap,
  padding,
  paddingX,
  paddingY,
  background,
  border,
  radius,
  shadow,
  width,
  position,
  overflow,
  className,
  ...rest
}: BoxProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(
        presetStyles[preset],

        display && displayStyles[display],
        direction && directionStyles[direction],
        align && alignStyles[align],
        justify && justifyStyles[justify],

        gap && gapStyles[gap],

        padding && paddingStyles[padding],
        paddingX && paddingXStyles[paddingX],
        paddingY && paddingYStyles[paddingY],

        background && backgroundStyles[background],
        border && borderStyles[border],
        radius && radiusStyles[radius],
        shadow && shadowStyles[shadow],

        width && widthStyles[width],
        position && positionStyles[position],
        overflow && overflowStyles[overflow],

        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}