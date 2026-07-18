"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes/unread-count");
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      // silently fail — badge just won't show
    }
  }, []);

  useEffect(() => {
    fetchCount();
    // Poll every 30s for new submissions
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleClick = async () => {
    if (count === 0) {
      router.push("/admin/quotes");
      return;
    }
    // Mark all as read, then navigate
    try {
      await fetch("/api/quotes/mark-read", { method: "POST" });
      setCount(0);
    } catch {
      // still navigate even if mark fails
    }
    router.push("/admin/quotes");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      aria-label={`Notifications${count > 0 ? `: ${count} new` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
