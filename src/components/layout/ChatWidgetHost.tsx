"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";

const CACHE_KEY = "86c_chatbot_enabled";

// WhatsApp business number (same as Footer / ChatWidget contact card)
const WHATSAPP_NUMBER = "8617611533296";
const WHATSAPP_PREFILL =
  "Hello! I'm visiting the 86Connect Cars website and would like to ask about your vehicle sourcing and export services.";

/**
 * Renders the floating chat assistant on public pages only.
 * Hides on /admin/* and /account/*.
 *
 * - When chatbot_enabled = true  → shows the AI ChatWidget.
 * - When chatbot_enabled = false → shows a WhatsApp floating button instead,
 *   so visitors can still reach us with a pre-filled "from the website" message.
 *
 * Initial state comes from sessionStorage so returning visitors never see a
 * flash of the wrong widget. First-ever visitors default to enabled.
 */
export function ChatWidgetHost() {
  const pathname = usePathname();
  const isAdminOrAccount = pathname.startsWith("/admin") || pathname.startsWith("/account");

  const [enabled, setEnabled] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    if (isAdminOrAccount) return false;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached === null ? true : cached === "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isAdminOrAccount) return;
    let cancelled = false;
    fetch("/api/site-settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { chatbotEnabled: true }))
      .then((d) => {
        const v = !!d.chatbotEnabled;
        if (!cancelled) {
          setEnabled(v);
          try { sessionStorage.setItem(CACHE_KEY, v ? "1" : "0"); } catch { /* noop */ }
        }
      })
      .catch(() => {
        if (!cancelled) setEnabled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, isAdminOrAccount]);

  if (isAdminOrAccount) return null;

  // Chatbot disabled → WhatsApp fallback button
  if (enabled === false) {
    return <WhatsAppFab />;
  }

  // Enabled (or still loading on first visit) → AI chatbot
  if (!enabled) return null;
  return <ChatWidget />;
}

/** Floating WhatsApp button — same position as the chatbot, green brand color. */
function WhatsAppFab() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-5 z-50 transition-transform hover:scale-110 active:scale-95 lg:bottom-5"
    >
      <span className="relative block">
        {/* Hint bubble — above the icon, one line, extends left */}
        <span
          className="pointer-events-none absolute block whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-center text-xs font-medium text-gray-700 shadow-md ring-1 ring-gray-200"
          style={{
            animation: "hint-pop 0.35s ease-out",
            bottom: "100%",
            right: "0",
            left: "auto",
            transform: "none",
            marginBottom: "8px",
          }}
        >
          Chat with us on WhatsApp
          {/* Arrow pointing down (toward the icon) */}
          <span
            className="absolute h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-white"
            style={{ bottom: "-5px", right: "14px" }}
          />
        </span>
        {/* Icon circle */}
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-[#25D366]/20"
          style={{ filter: "drop-shadow(0 4px 10px rgba(37, 211, 102, 0.4))" }}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
      </span>
    </a>
  );
}
