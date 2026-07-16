"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface StatBadgeProps {
  value: string;
  label: string;
  icon: string;
  target?: number;
  suffix?: string;
  className?: string;
  delay?: number;
}

function AnimatedCounter({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500; // ms
    const steps = 60;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function StatBadge({ value, label, icon, target, suffix, className, delay = 0 }: StatBadgeProps) {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
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
          <div className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            {target !== undefined && suffix !== undefined ? (
              <AnimatedCounter target={target} suffix={suffix} delay={delay} />
            ) : (
              value
            )}
          </div>
          <div className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}