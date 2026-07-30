"use client";

import { motion } from "motion/react";
import { CalendarClock, MessageCircle, ShieldCheck, Zap, Truck, Award } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import type { FAQItem } from "@/types";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { scrollToId } from "@/lib/utils";

export function FAQ({ items }: { items: FAQItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className="bg-[var(--bg-secondary)] py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: heading + contact prompt */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col"
          >
            <SectionHeading
              center={false}
              eyebrow="FAQ"
              title="Answers to Common Questions"
              subtitle="Everything you need to know about sourcing and exporting vehicles from China with 86Connect."
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: "24h Quote", value: "Fast response" },
                { icon: Truck, label: "Global Shipping", value: "50+ countries" },
                { icon: ShieldCheck, label: "Quality Check", value: "150-point inspection" },
                { icon: Award, label: "Trusted", value: "500+ vehicles delivered" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="glass-card flex items-center gap-3 rounded-2xl p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {item.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-card mt-6 rounded-2xl p-5 sm:mt-auto sm:rounded-3xl sm:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                    Still have questions?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Get a free 30-minute consultation with our export specialist. We&rsquo;ll walk you through sourcing, pricing, and shipping — no obligation.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
                    <a
                      href="https://www.the86connect.com/book-consultation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="md" className="w-full sm:w-auto">
                        <CalendarClock className="h-4 w-4" />
                        Book Free Consultation
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto"
                      onClick={() => scrollToId("contact")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <Accordion items={items} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
