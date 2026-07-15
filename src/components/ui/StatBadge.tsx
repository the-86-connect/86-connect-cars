"use client";

import { motion } from "motion/react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBadgeProps {
  value: string;
  label: string;
  icon: string;
  className?: string;
  delay?: number;
}

export function StatBadge({ value, label, icon, className, delay = 0 }: StatBadgeProps) {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("card rounded-xl px-4 py-3 sm:rounded-2xl sm:px-6 sm:py-5", className)}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-400 sm:h-12 sm:w-12 sm:rounded-2xl">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
        <div>
          <div className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{value}</div>
          <div className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}
