"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  MessageCircle,
  Globe,
  MapPin,
  Clock,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
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
    value: "info@the86connect.com",
    href: "mailto:info@the86connect.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+86 176 1153 3296",
    href: "https://wa.me/8617611533296",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Beijing, China",
    href: null,
  },
];

const stats: { label: string; icon: LucideIcon }[] = [
  { label: "24h Response Time", icon: Clock },
  { label: "100% Free Quote", icon: BadgeCheck },
  { label: "No Obligation", icon: ShieldCheck },
];

export function Contact() {
  // ponytail: id="contact" lives OUTSIDE the <Suspense> boundary so the anchor
  // target always exists in the DOM — even while ContactInner is suspending on
  // useSearchParams(). This makes scrollToId("contact") and #contact hash links
  // work reliably instead of failing silently when the section hasn't resolved yet.
  return (
    <section id="contact" className="scroll-mt-24 bg-[var(--bg-primary)] py-12 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ContactInner />
        </Suspense>
      </div>
    </section>
  );
}

function ContactInner() {
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? undefined;
  const model = searchParams.get("model") ?? undefined;
  const vehicleSlug = searchParams.get("vehicleSlug") ?? undefined;

  return (
    <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
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
              title="Let's Find Your Perfect Vehicle"
              subtitle="Tell us what you're looking for and we'll source the best cars at the right price. Free quote, no obligation."
            />

            <div className="mt-8 flex flex-col gap-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
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
                    <Icon className="h-4 w-4 text-brand-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{s.label}</span>
                  </div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                What you get with your free quote
              </h4>
              <div className="mt-3 grid gap-2.5">
                {[
                  "Personalized vehicle recommendations from our experts",
                  "Transparent pricing with all fees included — no surprises",
                  "Shipping timeline and cost estimates to your country",
                  "Quality inspection reports before shipment",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: quote form in a solid card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <div className="glass-card rounded-3xl border-2 border-brand-500/30 p-5 sm:p-8">
                <QuoteForm defaultBrand={brand} defaultModel={model} vehicleSlug={vehicleSlug} />
              </div>
            </motion.div>
        </div>
  );
}
