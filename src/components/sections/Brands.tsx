"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { BrandCategory } from "@/lib/brands";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { Vehicle } from "@/types";

export interface BrandMeta {
  name: string;
  logo: string; // resolved: /brands/file.png or https://...
  category: BrandCategory;
}

export function Brands({
  vehicles,
  brands,
}: {
  vehicles: Vehicle[];
  brands: BrandMeta[];
}) {
  const brandList = useMemo(() => {
    // Count vehicles per brand from live DB data
    const countMap = new Map<string, number>();
    for (const v of vehicles) {
      countMap.set(v.brand, (countMap.get(v.brand) ?? 0) + 1);
    }
    return brands.map((b) => ({
      name: b.name,
      logo: b.logo,
      displayName: b.name,
      count: countMap.get(b.name) ?? 0,
    }));
  }, [vehicles, brands]);

  return (
    <section className="bg-[var(--bg-secondary)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <SectionHeading
            eyebrow="Top Brands"
            title="China's Best & Global Favorites"
            subtitle="From Chinese innovators like BYD and NIO to global giants like Toyota, BMW, and Tesla — all available for export."
          />

          {/* Brand grid */}
          <motion.div
            variants={fadeUp}
            className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          >
            {brandList.map((brand) => (
              <Link
                key={brand.name}
                href={`/inventory?brand=${encodeURIComponent(brand.name)}`}
                className="glass-btn group flex cursor-pointer flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200 hover:scale-[1.04] hover:shadow-lg hover:border-brand-500/40 active:scale-95"
              >
                <div className="relative flex aspect-[3/2] w-full items-center justify-center rounded-xl">
                  <img
                    src={brand.logo}
                    alt={brand.displayName}
                    className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight">
                  {brand.displayName}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/brands">
                View All Brands
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}