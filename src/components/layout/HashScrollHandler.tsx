"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the URL hash element after navigation.
 *
 * ponytail: Homepage below-the-fold sections (FAQ, Contact, HowItWorks, …)
 * are React.lazy/dynamic, so the target element may not be in the DOM on
 * arrival. Poll up to ~2s for it to mount, then give up. Ceiling is fine
 * for 6 lazy sections; if section count grows much beyond that, consider
 * a router-based approach that awaits the dynamic import.
 */
export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 20; // 20 × 100ms = 2s ceiling
    const offset = 80;

    const tick = () => {
      attempts += 1;
      const el = document.getElementById(hash);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        // Clear hash so re-clicking the same nav link re-triggers scroll.
        history.replaceState(null, "", window.location.pathname);
      } else if (attempts < maxAttempts) {
        setTimeout(tick, 100);
      }
    };
    tick();
  }, [pathname]);

  return null;
}
