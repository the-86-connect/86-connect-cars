"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, viewportOnce } from "@/lib/motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  delay?: number;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, delay = 0, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
      whileHover={hover ? { y: -8, transition: { duration: 0.3 } } : undefined}
      className={cn(
        "card rounded-3xl",
        hover && "transition-shadow duration-300 hover:shadow-[var(--shadow-float)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  ),
);

Card.displayName = "Card";
