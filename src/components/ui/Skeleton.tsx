import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-[var(--bg-elevated)]">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-28">
        <div className="flex flex-col items-center text-center gap-6">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-16 w-full max-w-2xl" />
          <Skeleton className="h-16 w-3/4 max-w-xl" />
          <Skeleton className="h-12 w-64" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-14 w-40 rounded-xl" />
            <Skeleton className="h-14 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}