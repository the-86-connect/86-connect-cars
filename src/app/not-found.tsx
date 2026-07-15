import Link from "next/link";
import { Home, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="glass-card max-w-md p-8 text-center sm:p-12">
        <p className="font-display text-7xl font-bold text-brand-500 sm:text-8xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-brand-glow)] transition-colors hover:bg-brand-600"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/inventory"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            <Car className="h-4 w-4" />
            Browse inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
