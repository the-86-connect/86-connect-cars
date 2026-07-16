"use client";

import { motion } from "motion/react";
import { Building2, Globe, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function About() {
  return (
    <section id="about" className="bg-[var(--bg-secondary)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col items-center text-center"
        >
          <SectionHeading
            eyebrow="Our Story"
            title="86Connect"
            subtitle="Bridging China & the World"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16"
        >
          {/* Left: Story */}
          <motion.div variants={fadeUp} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                86Connect is the digital gateway of{" "}
                <strong className="text-[var(--text-primary)]">
                  Beijing BridgePath International Consulting Co., Ltd
                </strong>
                , a consulting firm incorporated in Beijing, China on November 23, 2023.
                The term &quot;86Connect&quot; refers to China&apos;s international dialing code (+86),
                symbolizing our role as the direct line connecting the world to China&apos;s
                educational and economic opportunities.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                We provide a seamless online gateway for individuals and businesses seeking
                to expand, source, or study in China. With a strategic presence in West Africa,
                we connect overseas clients with trusted Chinese suppliers and universities —
                ensuring smooth end-to-end operations from sourcing to delivery, and from
                application to enrollment.
              </p>
            </div>
          </motion.div>

          {/* Right: Info cards */}
          <motion.div variants={fadeUp} className="flex flex-col gap-6">
            <div className="glass-card flex items-start gap-4 rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  Incorporated November 2023
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Beijing BridgePath International Consulting Co., Ltd — a registered consulting
                  firm in Beijing, China.
                </p>
              </div>
            </div>

            <div className="glass-card flex items-start gap-4 rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  Global Reach
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Strategic presence in West Africa, connecting overseas clients with trusted
                  Chinese suppliers and universities worldwide.
                </p>
              </div>
            </div>

            <div className="glass-card flex items-start gap-4 rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-400">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  The Number 86
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  China&apos;s international dialing code (+86) symbolizes our role as the direct line
                  connecting you to everything China has to offer.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quote */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-16 max-w-3xl"
        >
          <blockquote className="glass-card rounded-2xl border-l-4 border-brand-500 p-6 sm:rounded-3xl sm:p-8">
            <p className="text-base italic leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              &quot;Our mission is to simplify China for the world. Whether you&apos;re a student chasing
              a world-class education or a business seeking quality manufacturers, we bridge the
              gap with local expertise, transparent pricing, and relentless support.&quot;
            </p>
            <footer className="mt-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                — 86Connect Team
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Beijing BridgePath International Consulting Co., Ltd
              </p>
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}