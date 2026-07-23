"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";

/**
 * Renders the floating chat assistant on public pages only.
 * Hides on /admin/* (admin uses KB management) and /account/* (private user dashboard).
 */
export function ChatWidgetHost() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return null;
  }
  return <ChatWidget />;
}
