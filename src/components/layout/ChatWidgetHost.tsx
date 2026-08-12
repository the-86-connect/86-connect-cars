"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";

/**
 * Renders the floating AI chatbot on all public pages.
 * Always enabled (site setting is ignored — admin panel is informational only).
 * Hides on /admin/* and /account/*.
 */
export function ChatWidgetHost() {
  const pathname = usePathname();
  const isAdminOrAccount = pathname.startsWith("/admin") || pathname.startsWith("/account");
  if (isAdminOrAccount) return null;
  return <ChatWidget />;
}
