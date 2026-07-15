"use client";

import { useEffect, useState } from "react";

/** SSR-safe media query hook. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = () => setMatches(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** True on coarse-pointer (touch) devices. */
export function useIsTouch() {
  return useMediaQuery("(pointer: coarse)");
}
