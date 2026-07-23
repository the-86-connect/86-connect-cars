"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import { scrollToId } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

/* ----------------------------------------------------------------
   Inline brand SVG icons (lucide-react v1 removed brand glyphs).
   Using real brand logos gives a more premium, recognizable footer.
   ---------------------------------------------------------------- */

type IconProps = { className?: string };

function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

type SocialIcon = (props: IconProps) => React.ReactElement;

const socialIcons: { icon: SocialIcon; label: string; href: string }[] = [
  { icon: FacebookIcon, label: "Facebook", href: "#" },
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: TwitterIcon, label: "Twitter", href: "#" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

const companyLinks = [
  { label: "About Us", id: "about" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Why Choose Us", id: "why-us" },
  { label: "FAQ", id: "faq" },
];

const serviceLinks = [
  { label: "Vehicle Sourcing", id: "how-it-works" },
  { label: "Export Documentation", id: "how-it-works" },
  { label: "Shipping", id: "how-it-works" },
  { label: "Inspection", id: "how-it-works" },
  { label: "Customs", id: "contact" },
];

export function Footer() {
  // Admin has its own layout — hide the public footer there.
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <footer className="border-t border-red-300/60 bg-gradient-to-br from-red-100 via-red-50 to-white dark:border-red-800/40 dark:bg-gradient-to-br dark:from-red-950/40 dark:via-red-900/20 dark:to-[var(--bg-primary)]">
      {/* Main footer content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-7xl px-6 py-10"
      >
        {/* Top: 4 columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-10">
          {/* Column 1: Brand */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <a
              href="#home"
              onClick={(e) => handleLink(e, "home")}
              className="group flex items-center"
            >
              <img
                src="/logo-86 connect.png"
                alt="86Connect"
                className="h-10 w-auto"
              />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              The digital gateway of Beijing BridgePath International Consulting Co., Ltd.
              Direct line connecting the world to China.
            </p>

            {/* Parent company + Social + Main site — one row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[var(--border-color)] pt-6">
              <div className="flex items-center gap-2">
                <img
                  src="/parent company logo 86connect.png"
                  alt="Beijing BridgePath International Consulting Co., Ltd"
                  className="h-10 w-10 shrink-0 object-contain"
                />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Parent Company
                  </p>
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Beijing BridgePath Intl.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {socialIcons.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="glass-card flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:border-brand-500 hover:text-brand-500"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>

              <a
                href="https://the86connect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-2 transition-all hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
              >
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  the86connect.com
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-brand-500" />
              </a>
            </div>
          </motion.div>

          {/* Column 2: Company */}
          <motion.div variants={fadeUp}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Company
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleLink(e, link.id)}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Services */}
          <motion.div variants={fadeUp}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Services
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleLink(e, link.id)}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-brand-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="glass-card flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-500">
                  <Mail className="h-4 w-4" />
                </span>
                <a
                  href="mailto:beijingbridgepath@gmail.com"
                  className="transition-colors hover:text-brand-500"
                >
                  beijingbridgepath@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="glass-card flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-500">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <a
                  href="https://wa.me/8617611533296"
                  className="transition-colors hover:text-brand-500"
                >
                  +86 176 1153 3296
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={fadeUp}
          className="mt-14 grid gap-3 border-t border-[var(--border-color)] pt-8 sm:grid-cols-3 sm:items-center sm:gap-6"
        >
          <p className="text-sm text-[var(--text-muted)] sm:text-left">
            © {new Date().getFullYear()} 86Connect. All rights reserved.
          </p>
          <p className="text-sm text-[var(--text-muted)] text-center sm:text-center">
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/milton-babu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-500 transition-colors hover:text-brand-600"
            >
              MD MILTON BABU
            </a>
          </p>
          <div className="flex items-center justify-center gap-6 sm:justify-end">
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-brand-500"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-brand-500"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
