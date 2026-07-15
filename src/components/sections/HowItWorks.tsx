"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Search,
  Radar,
  FileText,
  ShieldCheck,
  Ship,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { processSteps } from "@/lib/data";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import type { ProcessStep } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Search,
  Radar,
  FileText,
  ShieldCheck,
  Ship,
  CheckCircle2,
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: progressDesktop } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "start 0.3"],
  });
  const { scrollYProgress: progressMobile } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.8"],
  });

  const scaleX = useTransform(progressDesktop, [0, 1], [0, 1]);
  const scaleY = useTransform(progressMobile, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative bg-[var(--bg-primary)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Process"
          title="How It Works"
          subtitle="From request to delivery — a seamless six-step process designed for your peace of mind."
        />

        {/* Desktop horizontal timeline */}
        <div className="relative mt-20 hidden lg:block">
          {/* base line */}
          <div className="absolute left-0 right-0 top-8 h-0.5 -translate-y-1/2 bg-[var(--border-color)]" />
          {/* animated fill line */}
          <motion.div
            style={{ scaleX }}
            className="absolute left-0 right-0 top-8 h-0.5 -translate-y-1/2 origin-left bg-gradient-to-r from-brand-500 to-brand-300"
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-6 gap-4"
          >
            {processSteps.map((step: ProcessStep) => {
              const Icon = iconMap[step.icon] ?? Search;
              return (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* numbered circle */}
                  <div className="glass-card relative z-10 flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full border-2 border-brand-500">
                    <Icon className="h-4 w-4 text-brand-500" />
                    <span className="font-display text-xl font-bold leading-none text-brand-500">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="relative mt-16 lg:hidden">
          {/* base line */}
          <div className="absolute bottom-8 left-8 top-8 w-0.5 -translate-x-1/2 bg-[var(--border-color)]" />
          {/* animated fill line */}
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-8 left-8 top-8 w-0.5 -translate-x-1/2 origin-top bg-gradient-to-b from-brand-500 to-brand-300"
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col gap-8"
          >
            {processSteps.map((step: ProcessStep) => {
              const Icon = iconMap[step.icon] ?? Search;
              return (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  className="relative flex items-start gap-5"
                >
                  {/* numbered circle */}
                  <div className="glass-card relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-brand-500">
                    <Icon className="h-4 w-4 text-brand-500" />
                    <span className="font-display text-xl font-bold leading-none text-brand-500">
                      {step.step}
                    </span>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
