"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { vehicles } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function RecentlyViewed() {
  const { slugs } = useRecentlyViewed();

  const recentVehicles = slugs
    .map((slug) => vehicles.find((v) => v.slug === slug))
    .filter(Boolean) as typeof vehicles;

  if (recentVehicles.length === 0) return null;

  return (
    <section className="bg-[var(--bg-primary)] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex items-center justify-between"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
          >
            Recently Viewed
          </motion.h2>
          <motion.div variants={fadeUp}>
            <Link
              href="/inventory"
              className="flex items-center gap-1 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {recentVehicles.map((v) => (
            <motion.div key={v.id} variants={fadeUp}>
              <Link
                href={`/inventory/${v.slug}`}
                className="glass-card flex w-[220px] shrink-0 items-center gap-3 rounded-xl p-3 transition-all hover:scale-[1.02] sm:w-[260px]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                  <img
                    src={v.image}
                    alt={`${v.brand} ${v.model}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {v.brand}
                  </p>
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">{v.model}</p>
                  <p className="text-xs font-semibold text-brand-500">{formatPrice(v.price)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
