"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const themeChanged = "86connect:theme-change";

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChanged, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChanged, callback);
  };
}

function getThemeSnapshot() {
  return localStorage.getItem("theme") === "dark";
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(themeChanged));
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="glass-btn flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-all hover:text-brand-500"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
