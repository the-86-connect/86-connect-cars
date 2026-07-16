"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  MessageCircle,
  Globe,
  Clock,
  BadgeCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const contactInfo: {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string | null;
}[] = [
  {
    icon: Mail,
    label: "Email Us",
    value: "beijingbridgepath@gmail.com",
    href: "mailto:beijingbridgepath@gmail.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+86 176 1153 3296",
    href: "https://wa.me/8617611533296",
  },
  {
    icon: Globe,
    label: "Location",
    value: "Shanghai, China",
    href: null,
  },
];

const stats: { label: string; icon: LucideIcon }[] = [
  { label: "24h Response Time", icon: Clock },
  { label: "100% Free Quote", icon: BadgeCheck },
  { label: "No Obligation", icon: ShieldCheck },
];

export function Contact() {
  return (
    <Suspense fallback={null}>
      <ContactInner />
    </Suspense>
  );
}

function ContactInner() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? undefined;
  const model = searchParams.get("model") ?? undefined;

  return (
    <section id="contact" className="bg-[var(--bg-primary)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: heading + contact info + stats */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col"
          >
            <SectionHeading
              center={false}
              eyebrow="Get Started"
              title="Request Your Free Quote"
              subtitle="Tell us what you're looking for and we'll find the perfect vehicle at the right price. Get a response within 24 hours."
            />

            <div className="mt-8 flex flex-col gap-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    </div>
                  </>
                );

                return item.href ? (
                  <motion.a
                    key={item.label}
                    variants={fadeUp}
                    href={item.href}
                    className="glass-card flex items-center gap-4 rounded-2xl p-4 transition-all"
                  >
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    className="glass-card flex items-center gap-4 rounded-2xl p-4"
                  >
                    {inner}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-wrap gap-2"
            >
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="glass-card flex items-center gap-2 rounded-full px-4 py-2"
                  >
                    <Icon className="h-4 w-4 text-accent-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{s.label}</span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right: quote form in a solid card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <div className="rounded-3xl border-2 border-brand-500/30 bg-white p-6 sm:p-8">
              <QuoteForm defaultBrand={brand} defaultModel={model} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
