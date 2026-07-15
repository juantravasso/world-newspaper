import { cn } from "@/components/lib/utils";

import styles from "./Spotlight.module.css";

export type SpotlightProps = {
  className?: string;
};

export function Spotlight({
  className,
}: SpotlightProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          styles.primary,
          "absolute -left-28 -top-52 h-[34rem] w-[34rem]",
          "rounded-full bg-primary/18 blur-3xl",
        )}
      />

      <div
        className={cn(
          styles.secondary,
          "absolute -right-28 top-20 h-80 w-80",
          "rounded-full bg-info/10 blur-3xl",
        )}
      />

      <div
        className="
          absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent via-primary/55 to-transparent
        "
      />
    </div>
  );
}
