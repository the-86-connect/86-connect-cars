"use client";

import { motion } from "motion/react";
import {
  BadgeCheck,
  ShieldCheck,
  Ship,
  ReceiptText,
  Headphones,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { features } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger, staggerSlow, viewportOnce } from "@/lib/motion";

const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  ShieldCheck,
  Ship,
  ReceiptText,
  Headphones,
  Globe2: Globe,
};

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-[var(--bg-primary)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <SectionHeading
            eyebrow="Why 86Connect"
            title="Why Choose Us"
            subtitle="We combine deep Chinese market expertise with global logistics mastery to deliver an unmatched export experience."
          />
        </motion.div>

        <motion.div
          variants={staggerSlow}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? BadgeCheck;
            return (
              <motion.div
                key={feature.id}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card group relative overflow-hidden rounded-3xl p-8"
              >
                {/* Hover accent line */}
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-brand-300 transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
