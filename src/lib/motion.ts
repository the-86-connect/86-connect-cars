import type { Variants } from "motion/react";

/** Premium cubic-bezier easing used across all transitions. */
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/** Fade up with blur reveal — the workhorse scroll-reveal variant. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Fade in place (no movement). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

/** Scale in from 0.92. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Slide in from the left. */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Slide in from the right. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Stagger container — children reveal in sequence. */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Slower stagger for larger groups. */
export const staggerSlow: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/** Shared viewport config for whileInView. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
