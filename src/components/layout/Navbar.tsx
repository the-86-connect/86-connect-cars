"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navLinks } from "@/lib/data";
import { scrollToId, cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export function Navbar() {
  // Admin has its own layout — hide the public navbar there.
  const pathname = usePathname();
  const router = useRouter();
  if (pathname?.startsWith("/admin")) return null;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // ponytail: anchor links (#home, #faq, …) only exist on the homepage route.
  // On any other route, navigate to /#id so the user lands on the homepage section.
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const id = href.replace("#", "");
    if (pathname === "/") {
      scrollToId(id);
    } else {
      router.push(`/#${id}`);
    }
    setMenuOpen(false);
  };

  const goToContact = () => {
    if (pathname === "/") {
      scrollToId("contact");
    } else {
      router.push("/#contact");
    }
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed top-0 inset-x-0 z-50"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-color)]"
            : "border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <a
            href="/#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="group flex items-center"
          >
            <Image
              src="/logo-86 connect.png"
              alt="86Connect"
              width={140}
              height={36}
              priority
              className="h-9 w-auto transition-opacity duration-300"
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-accent-500"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-accent-500"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <MagneticButton>
              <Button
                variant="primary"
                size="sm"
                onClick={goToContact}
              >
                Get Quote
              </Button>
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl glass-btn text-[var(--text-secondary)] transition-colors hover:text-brand-500"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden lg:hidden"
          >
            <div className="bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
              <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
                {navLinks.map((link) =>
                  link.href.startsWith("/") ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-base font-medium text-[var(--text-primary)] transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="rounded-xl px-4 py-3 text-base font-medium text-[var(--text-primary)] transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
                    >
                      {link.label}
                    </a>
                  ),
                )}
                <Button
                  variant="primary"
                  size="md"
                  className="mt-3 w-full"
                  onClick={goToContact}
                >
                  Get Quote
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
