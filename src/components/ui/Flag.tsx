"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ponytail: Windows doesn't render regional-indicator flag emoji (shows "NG" instead of 🇳🇬).
// flagcdn.com serves flag images by ISO 3166-1 alpha-2 code — works on every platform.
const COUNTRY_CODE: Record<string, string> = {
  Nigeria: "ng", Ghana: "gh", Kenya: "ke", "South Africa": "za",
  Egypt: "eg", Tanzania: "tz", USA: "us", Canada: "ca",
  Mexico: "mx", Brazil: "br", Chile: "cl", Colombia: "co",
  Germany: "de", UK: "gb", Netherlands: "nl", France: "fr",
  Spain: "es", Italy: "it", Pakistan: "pk", UAE: "ae",
  Japan: "jp", Australia: "au", China: "cn",
};

export function Flag({
  country,
  className,
}: {
  country: string;
  className?: string;
}) {
  const code = COUNTRY_CODE[country];
  const [err, setErr] = useState(false);

  if (!code || err) {
    // Fallback: first two letters of country name in a styled badge
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-sm bg-[var(--bg-elevated)] text-[8px] font-bold uppercase text-[var(--text-muted)]",
          className,
        )}
        aria-label={country}
      >
        {country.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={country}
      className={cn("inline-block rounded-[2px] object-cover", className)}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}
