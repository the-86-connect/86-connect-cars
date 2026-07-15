"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { faqs } from "@/lib/data";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { scrollToId } from "@/lib/utils";

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
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
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about sourcing and exporting vehicles from China with 86Connect."
            />

            <div className="glass-card mt-auto rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                    Still have questions?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Our team is ready to help you source the perfect vehicle. Reach
                    out and get a response within 24 hours.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-5"
                    onClick={() => scrollToId("contact")}
                  >
                    Contact Us
                  </Button>
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
            <Accordion items={faqs} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
