"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the URL hash element after navigation.
 *
 * ponytail: Homepage below-the-fold sections (Gallery, HowItWorks, FAQ, …) are
 * React.lazy/dynamic and may not be in the DOM on arrival. A MutationObserver
 * waits for the target element to appear — no arbitrary polling timeout that
 * could give up too early on slow connections or dev-mode compiles.
 *
 * After the initial scroll, a setInterval polls the element's absolute position
 * every 300ms and re-scrolls if it has shifted. This fixes the quote-button bug:
 * when #contact first appears it's high on the page because the dynamic sections
 * above it haven't loaded yet. As they stream in (often >5s in dev mode), they
 * push #contact down by ~500px, leaving the user scrolled to the wrong spot.
 * Polling catches every shift until the layout settles, then stops.
 */
export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const offset = 80;
    let scrolled = false;
    let pollId: ReturnType<typeof setInterval>;
    let stopTimer: ReturnType<typeof setTimeout>;

    const performScroll = () => {
      const el = document.getElementById(hash);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const startPolling = (el: HTMLElement) => {
      let lastTop = -1;

      // Re-scroll whenever the target's absolute position shifts by >5px.
      pollId = setInterval(() => {
        const currentTop = el.getBoundingClientRect().top + window.scrollY - offset;
        if (Math.abs(currentTop - lastTop) > 5) {
          lastTop = currentTop;
          window.scrollTo({ top: currentTop, behavior: "smooth" });
        }
      }, 300);

      // Stop after 15s (dev mode + slow connections) and do a final correction.
      stopTimer = setTimeout(() => {
        clearInterval(pollId);
        performScroll();
      }, 15000);
    };

    const doScroll = () => {
      const el = document.getElementById(hash);
      if (el && !scrolled) {
        scrolled = true;

        performScroll();
        startPolling(el);

        // Clear hash so re-clicking the same nav link re-triggers scroll,
        // but preserve query params (vehicleSlug/brand/model pre-fill the form).
        history.replaceState(null, "", window.location.pathname + window.location.search);
        return true;
      }
      return false;
    };

    // Try immediately (element may already be in the DOM).
    if (doScroll()) {
      return () => {
        clearInterval(pollId);
        clearTimeout(stopTimer);
      };
    }

    // Otherwise watch for it to appear.
    const observer = new MutationObserver(() => doScroll());
    observer.observe(document.body, { childList: true, subtree: true });

    // Safety timeout: stop observing after 10s.
    const timeout = setTimeout(() => observer.disconnect(), 10000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      clearInterval(pollId);
      clearTimeout(stopTimer);
    };
  }, [pathname]);

  return null;
}
