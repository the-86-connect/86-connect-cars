"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ponytail: log to console for now — swap for Sentry/Bugsnag when integrated.
    console.error("[app-error]", error.digest ?? error.message, error.stack);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="glass-card max-w-md p-8 text-center sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
          <AlertTriangle className="h-8 w-8 text-brand-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          An unexpected error occurred. You can try again or go back home.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-brand-glow)] transition-colors hover:bg-brand-600"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
