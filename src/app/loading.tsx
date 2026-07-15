import { SkeletonHero, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero skeleton */}
      <SkeletonHero />

      {/* Featured vehicles skeleton */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="skeleton h-8 w-32 rounded-full" />
            <div className="skeleton h-10 w-64" />
            <div className="skeleton h-5 w-80" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* More sections skeleton */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="skeleton h-8 w-32 rounded-full" />
            <div className="skeleton h-10 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="skeleton mx-auto h-12 w-12 rounded-full" />
                <div className="skeleton h-5 w-2/3 mx-auto" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}