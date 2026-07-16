"use client";

import { useState, useEffect } from "react";
import { Home, Car, Image, Ship, MessageCircle, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToId } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Car, label: "Inventory", id: "inventory" },
  { icon: Image, label: "Gallery", id: "gallery" },
  { icon: Ship, label: "Shipping", id: "shipping" },
  { icon: MessageCircle, label: "Contact", id: "contact" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("home");

  // ponytail: IntersectionObserver for active tab detection — O(n) scan, fine for 5 sections
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -80px 0px" }
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  // Inventory and Gallery have dedicated pages — always navigate to them.
  const handleTabClick = (id: string) => {
    if (id === "inventory") {
      router.push("/inventory");
    } else if (id === "gallery") {
      router.push("/gallery");
    } else if (pathname === "/") {
      scrollToId(id);
    } else {
      router.push(`/#${id}`);
    }
  };

  const tabClass = (isActive: boolean) =>
    `group flex flex-col items-center gap-1 rounded-2xl border px-4 py-2.5 transition-all hover:scale-105 active:scale-95 ${
      isActive
        ? "border-accent-300 bg-accent-50 dark:border-accent-700 dark:bg-accent-900/20"
        : "border-[var(--border-color)] hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
    }`;

  const iconClass = (isActive: boolean) =>
    `h-6 w-6 transition-colors ${
      isActive ? "text-accent-500" : "text-[var(--text-secondary)] group-hover:text-brand-500"
    }`;

  const labelClass = (isActive: boolean) =>
    `text-[11px] font-semibold leading-none ${
      isActive ? "text-accent-500" : "text-[var(--text-muted)]"
    }`;

  return (
    <>
    <div className="h-16 lg:hidden" aria-hidden />
    <nav className="mobile-bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={tabClass(activeSection === id)}
          >
            <Icon className={iconClass(activeSection === id)} strokeWidth={2} />
            <span className={labelClass(activeSection === id)}>
              {label}
            </span>
          </button>
        ))}
        <Link
          href="/account"
          className={tabClass(pathname === "/account")}
        >
          <UserCircle className={iconClass(pathname === "/account")} strokeWidth={2} />
          <span className={labelClass(pathname === "/account")}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
    </>
  );
}
