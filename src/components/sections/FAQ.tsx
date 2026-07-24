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
              title="Frequently Asked Questions"
              subtitle="Everything you need to know about sourcing and exporting vehicles from China with 86Connect."
            />

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
                    Our team is ready to help you source the perfect vehicle. Reach
                    out and get a response within 24 hours.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-4 w-full sm:mt-5 sm:w-auto"
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
