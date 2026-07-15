"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

import {
  animate,
  createScope,
  stagger,
} from "animejs";

import { cn } from "@/components/lib/utils";

export type MotionRevealProps = {
  children: ReactNode;
  className?: string;

  delay?: number;
  distance?: number;

  /**
   * Anima os descendentes com data-motion-item
   * em sequência.
   */
  staggerItems?: boolean;

  /**
   * @default true
   */
  once?: boolean;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  distance = 18,
  staggerItems = false,
  once = true,
}: MotionRevealProps) {
  const rootRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (prefersReducedMotion) {
      return;
    }

    let scope:
      | ReturnType<typeof createScope>
      | undefined;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            return;
          }

          const targets =
            staggerItems
              ? root.querySelectorAll<HTMLElement>(
                  "[data-motion-item]",
                )
              : [root];

          if (targets.length === 0) {
            return;
          }

          scope =
            createScope({
              root: rootRef,
            }).add(() => {
              animate(targets, {
                opacity: {
                  from: 0,
                },

                translateY: {
                  from: distance,
                },

                duration: 650,

                delay:
                  staggerItems
                    ? stagger(70, {
                        start: delay,
                      })
                    : delay,

                ease: "out(3)",
              });
            });

          if (once) {
            observer.disconnect();
          }
        },
        {
          threshold: 0.12,
        },
      );

    observer.observe(root);

    return () => {
      observer.disconnect();
      scope?.revert();
    };
  }, [
    delay,
    distance,
    once,
    staggerItems,
  ]);

  return (
    <div
      ref={rootRef}
      className={cn(
        className,
      )}
    >
      {children}
    </div>
  );
}
