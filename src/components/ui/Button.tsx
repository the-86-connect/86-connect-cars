"use client";

import { forwardRef, cloneElement, isValidElement, type ReactElement } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[var(--shadow-brand-glow)] hover:bg-brand-600 hover:shadow-[0_12px_48px_rgba(227,30,36,0.35)]",
  secondary:
    "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-brand-500 hover:text-brand-500",
  outline:
    "border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5 text-sm rounded-xl",
  md: "px-7 py-3.5 text-sm rounded-xl",
  lg: "px-9 py-4 text-base rounded-xl",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-300 cursor-pointer select-none";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, asChild, ...props }, ref) => {
    const classes = cn(baseClasses, variants[variant], sizes[size], className);

    if (asChild && isValidElement<{ className?: string }>(children)) {
      return cloneElement(children, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
        ...props,
      });
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
