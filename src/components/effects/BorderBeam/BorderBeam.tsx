import type {
  CSSProperties,
} from "react";

import { cn } from "@/components/lib/utils";

import styles from "./BorderBeam.module.css";

type BorderBeamStyle =
  CSSProperties & {
    "--beam-color": string;
    "--beam-duration": string;
  };

export type BorderBeamProps = {
  color?: string;
  duration?: number;
  className?: string;
};

export function BorderBeam({
  color = "var(--color-primary)",
  duration = 8,
  className,
}: BorderBeamProps) {
  const style: BorderBeamStyle = {
    "--beam-color": color,
    "--beam-duration": `${duration}s`,
  };

  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        styles.root,
        className,
      )}
    />
  );
}
