"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Car, Tags, Search, MessageCircle, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToId } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Car, label: "Inventory", id: "inventory" },
  { icon: Tags, label: "Brands", id: "brands" },
  { icon: Search, label: "Track", id: "track" },
  { icon: MessageCircle, label: "Contact", id: "contact" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("home");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement | HTMLAnchorElement>>(new Map());

  useEffect(() => {
    const pathToSection: Record<string, string> = {
      "/": "home",
      "/inventory": "inventory",
      "/brands": "brands",
      "/account": "account",
    };
    if (pathname && pathToSection[pathname]) {
      setActiveSection(pathToSection[pathname]);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" || pathname?.startsWith("/admin")) return;
    const sectionIds = ["home", "inventory", "brands", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -80px 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const activeId = pathname === "/account" ? "account" : activeSection;
    const el = itemRefs.current.get(activeId);
    const container = navRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeSection, pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const handleTabClick = (id: string) => {
    if (id === "inventory") {
      router.push("/inventory");
    } else if (id === "brands") {
      router.push("/brands");
    } else if (id === "track") {
      window.open("https://www.the86connect.com/car-shipping/track", "_blank", "noopener,noreferrer");
    } else if (pathname === "/") {
      scrollToId(id);
    } else {
      router.push(`/#${id}`);
    }
  };

  const setItemRef = (id: string) => (el: HTMLButtonElement | HTMLAnchorElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  return (
    <>
    <div className="mobile-nav-spacer h-20 lg:hidden" aria-hidden />
    <nav className="mobile-bottom-nav lg:hidden">
      <div ref={navRef} className="mobile-bottom-nav-bar relative flex items-center justify-around px-1.5 py-1.5">
        <div
          className="mobile-nav-pill absolute top-1.5 bottom-1.5 rounded-2xl bg-brand-500/10 transition-all duration-300"
          style={{
            left: `${pillStyle.left + 3}px`,
            width: `${pillStyle.width - 6}px`,
            opacity: pillStyle.width > 0 ? 1 : 0,
          }}
        />
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              ref={setItemRef(id) as React.Ref<HTMLButtonElement>}
              onClick={() => handleTabClick(id)}
              className="mobile-nav-item relative z-10 flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-200"
            >
              <Icon
                className={`h-[22px] w-[22px] transition-all duration-200 ${
                  isActive ? "text-brand-500 scale-110" : "text-[var(--text-secondary)]"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold leading-none transition-all duration-200 ${
                  isActive ? "text-brand-500" : "text-[var(--text-muted)]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
        <Link
          ref={setItemRef("account") as React.Ref<HTMLAnchorElement>}
          href="/account"
          className={`mobile-nav-item relative z-10 flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-200 ${
            pathname === "/account" ? "text-brand-500" : "text-[var(--text-muted)]"
          }`}
        >
          <UserCircle
            className={`h-[22px] w-[22px] transition-all duration-200 ${
              pathname === "/account" ? "text-brand-500 scale-110" : "text-[var(--text-secondary)]"
            }`}
            strokeWidth={pathname === "/account" ? 2.5 : 2}
          />
          <span
            className={`text-[10px] font-semibold leading-none transition-all duration-200 ${
              pathname === "/account" ? "text-brand-500" : "text-[var(--text-muted)]"
            }`}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
    </>
  );
}
