"use client";

import { motion } from "motion/react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn("flex flex-col gap-4", center && "items-center text-center", className)}
    >
      {eyebrow && (
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl lg:leading-[1.1]"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className={cn(
            "text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg",
            center && "max-w-2xl",
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
