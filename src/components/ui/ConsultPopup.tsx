"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CalendarClock, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FIRST_DELAY_MS = 5000;
const VISIBLE_MS = 12000;
const REAPPEAR_INTERVAL_MS = 4 * 60 * 1000;

export function ConsultPopup() {
  const pathname = usePathname();
  const isAdminOrAccount = pathname.startsWith("/admin") || pathname.startsWith("/account");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAdminOrAccount) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    };

    const showTimer = setTimeout(show, FIRST_DELAY_MS);

    const intervalTimer = setInterval(() => {
      clearTimeout(hideTimer);
      show();
    }, REAPPEAR_INTERVAL_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, [isAdminOrAccount]);

  if (isAdminOrAccount) return null;

  const close = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 left-1/2 z-40 w-[82%] max-w-xs -translate-x-1/2 sm:left-6 sm:w-80 sm:translate-x-0 lg:bottom-8 lg:left-8"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1f2e]/95 via-[#111520]/95 to-[#0a0d14]/95 p-3.5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-5">
            <div
              className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-40 blur-2xl sm:-top-10 sm:-right-10 sm:h-32 sm:w-32"
              style={{ background: "radial-gradient(circle, rgba(227,30,36,0.6), transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(227,30,36,0.7), transparent)" }}
            />

            <button
              type="button"
              onClick={close}
              aria-label="Close consultation offer"
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white active:scale-90 sm:right-3 sm:top-3 sm:h-7 sm:w-7"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-start gap-2.5 sm:gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 sm:h-11 sm:w-11 sm:rounded-2xl">
                <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5" />
                <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-300 sm:h-3 sm:w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-300 sm:px-2 sm:text-[10px]">
                    Free
                  </span>
                  <span className="text-[9px] font-medium text-white/40 sm:text-[10px]">No obligation</span>
                </div>
                <h3 className="mt-1 font-display text-sm font-semibold leading-tight text-white sm:mt-1.5 sm:text-base">
                  Book a Free Consultation
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/60 sm:mt-1 sm:text-xs">
                  Talk to our export specialist. Get sourcing advice, pricing ranges, and shipping timelines — 100% free.
                </p>
              </div>
            </div>

            <a
              href="https://www.the86connect.com/book-consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block sm:mt-4"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs py-2.5 shadow-[0_4px_20px_rgba(227,30,36,0.4)] sm:text-sm sm:py-3.5"
              >
                Book Now — It&apos;s Free
              </Button>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
