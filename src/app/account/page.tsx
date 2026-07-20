"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageSquareQuote, LogOut, User, Package, Truck, CheckCircle2, Clock, Ship, Anchor, FileCheck, Loader } from "lucide-react";

interface UserData { id: string; name: string; email: string; whatsapp?: string; country?: string; }
interface Quote {
  id: string;
  vehicleBrand: string;
  model: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  message?: string;
}
interface Favorite {
  favId: string;
  vehicleId: string;
  favoritedAt: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  bodyType: string;
  image?: string;
  badge?: string;
}

const DELIVERY_STEPS = [
  { key: "pending", label: "Shipment Pending", icon: Clock },
  { key: "booking_confirmed", label: "Booking Confirmed", icon: FileCheck },
  { key: "loading", label: "Loading", icon: Loader },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "at_destination_port", label: "At Destination Port", icon: Anchor },
  { key: "customs_clearance", label: "Customs Clearance", icon: Ship },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  const idx = DELIVERY_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function DeliveryTracker({ status }: { status: string }) {
  const currentStep = getStepIndex(status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {DELIVERY_STEPS.map((step, i) => {
          const isComplete = i <= currentStep;
          const isCurrent = i === currentStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    isComplete
                      ? isCurrent
                        ? "bg-brand-500 text-white ring-4 ring-brand-100"
                        : "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`mt-1 text-[10px] font-medium ${isComplete ? "text-gray-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < DELIVERY_STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-brand-500" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activeTab, setActiveTab] = useState<"quotes" | "favorites">("quotes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const [meResult, quotesResult, favsResult] = await Promise.all([
        fetch("/api/user/me").then((r) => r.ok ? r.json() : null),
        fetch("/api/user/quotes").then((r) => r.ok ? r.json() : []),
        fetch("/api/user/favorites").then((r) => r.ok ? r.json() : []),
      ]);

      if (!meResult || !meResult.authenticated) { router.push("/account/login"); return; }

      const userData: UserData = {
        id: meResult.id,
        name: meResult.name ?? "",
        email: meResult.email ?? "",
        whatsapp: meResult.whatsapp,
        country: meResult.country,
      };

      setUser(userData);
      setQuotes(Array.isArray(quotesResult) ? quotesResult : []);
      setFavorites(Array.isArray(favsResult) ? favsResult : []);
      setLoading(false);
    }

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const removeFavorite = async (vehicleId: string) => {
    await fetch("/api/user/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId }),
    });
    setFavorites((prev) => prev.filter((f) => f.vehicleId !== vehicleId));
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-secondary)] pt-28"><p className="text-[var(--text-muted)]">Loading...</p></div>;

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    closed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Profile header — glass card */}
        <div className="glass-card rounded-3xl p-5 sm:p-7">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/25 sm:h-16 sm:w-16">
              <User className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-[var(--text-primary)] sm:text-xl">{user?.name || "User"}</h1>
              <p className="truncate text-sm text-[var(--text-secondary)]">{user?.email}</p>
              {user?.country && <p className="truncate text-xs text-[var(--text-muted)]">{user.country}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-[var(--bg-card)] p-3 text-center sm:p-4">
              <p className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{quotes.length}</p>
              <p className="text-[11px] text-[var(--text-muted)] sm:text-xs">My Quotes</p>
            </div>
            <div className="rounded-2xl bg-[var(--bg-card)] p-3 text-center sm:p-4">
              <p className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{favorites.length}</p>
              <p className="text-[11px] text-[var(--text-muted)] sm:text-xs">Favorites</p>
            </div>
          </div>

          {/* Tabs — horizontal scroll on mobile */}
          <div className="-mx-5 mt-5 overflow-x-auto border-b border-[var(--border-color)] px-5 sm:-mx-7 sm:px-7">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("quotes")}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  activeTab === "quotes"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <MessageSquareQuote className="h-4 w-4" /> My Quotes
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  activeTab === "favorites"
                    ? "border-brand-500 text-brand-500"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Heart className="h-4 w-4" /> Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "quotes" ? (
            quotes.length === 0 ? (
              <div className="glass-card rounded-3xl py-12 text-center">
                <MessageSquareQuote className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No quotes yet</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                  Submit a quote request and track its delivery status here.
                </p>
                <Link
                  href="/#contact"
                  className="mt-5 inline-block rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
                >
                  Get a Quote
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {quotes.map((q) => (
                  <div key={q.id} className="glass-card rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[var(--text-primary)]">
                          {q.vehicleBrand} {q.model}
                        </h3>
                        <p className="truncate text-xs text-[var(--text-muted)] sm:text-sm">
                          Submitted {new Date(q.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-xs ${
                          statusColors[q.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                    {q.message && (
                      <p className="mt-3 rounded-xl bg-[var(--bg-card)] p-3 text-sm text-[var(--text-secondary)]">
                        {q.message}
                      </p>
                    )}
                    <DeliveryTracker status={q.deliveryStatus || "pending"} />
                  </div>
                ))}
              </div>
            )
          ) : (
            favorites.length === 0 ? (
              <div className="glass-card rounded-3xl py-12 text-center">
                <Heart className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">No favorites yet</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                  Browse vehicles and tap the heart icon to save favorites.
                </p>
                <Link
                  href="/inventory"
                  className="mt-5 inline-block rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600"
                >
                  Browse Vehicles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.favId}
                    className="glass-card overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5"
                  >
                    <Link href={`/inventory/${fav.slug}`} className="block">
                      <div className="relative h-36 bg-[var(--bg-card)] sm:h-40">
                        {fav.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fav.image}
                            alt={`${fav.brand} ${fav.model}`}
                            className={`h-full w-full ${fav.image.startsWith("/cars/") ? "object-contain p-3" : "object-cover"}`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                        {fav.badge && (
                          <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                            {fav.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFavorite(fav.vehicleId);
                          }}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                          aria-label="Remove from favorites"
                        >
                          <Heart className="h-4 w-4 text-brand-500" fill="currentColor" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs font-semibold uppercase tracking-wider text-brand-500">
                            {fav.brand}
                          </span>
                          <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{fav.year}</span>
                        </div>
                        <h3 className="mt-0.5 truncate font-semibold text-[var(--text-primary)]">{fav.model}</h3>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap gap-1">
                            <span className="shrink-0 rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {fav.fuel}
                            </span>
                            <span className="shrink-0 rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {fav.bodyType}
                            </span>
                          </div>
                          <div className="shrink-0 font-bold text-brand-500">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(fav.price)}
                          </div>
                        </div>
                        <p className="mt-2 truncate text-[11px] text-[var(--text-muted)]">
                          Saved {new Date(fav.favoritedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Sign Out — bottom of page */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-brand-500/50 hover:text-brand-500 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
