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

import {
  cn,
} from "@/components/lib/utils";

export type MotionRevealProps = {
  children: ReactNode;
  className?: string;

  delay?: number;
  distance?: number;

  /**
   * Anima os descendentes marcados
   * com data-motion-item em sequência.
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

  const scopeRef =
    useRef<
      ReturnType<typeof createScope>
      | null
    >(null);

  const hasAnimatedRef =
    useRef(false);

  useEffect(() => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (
      prefersReducedMotion ||
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return;
    }

    const runAnimation = () => {
      if (
        once &&
        hasAnimatedRef.current
      ) {
        return;
      }

      const targets =
        staggerItems
          ? Array.from(
              root.querySelectorAll<HTMLElement>(
                "[data-motion-item]",
              ),
            )
          : [root];

      if (targets.length === 0) {
        return;
      }

      scopeRef.current?.revert();

      scopeRef.current =
        createScope({
          root: rootRef,
        }).add(() => {
          animate(targets, {
            opacity: [0, 1],

            translateY: [
              distance,
              0,
            ],

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

      hasAnimatedRef.current = true;
    };

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            return;
          }

          runAnimation();

          if (once) {
            observer.disconnect();
          }
        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -5% 0px",
        },
      );

    observer.observe(root);

    return () => {
      observer.disconnect();
      scopeRef.current?.revert();
      scopeRef.current = null;
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
      className={cn(className)}
    >
      {children}
    </div>
  );
}
