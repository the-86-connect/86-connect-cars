"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageSquareQuote, LogOut, User, Package, Truck, CheckCircle2, Clock, Ship } from "lucide-react";

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
  { key: "pending", label: "Pending", icon: Clock },
  { key: "received", label: "Order Received", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "shipped", label: "Shipped", icon: Ship },
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

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    closed: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.country && <p className="text-xs text-gray-400">{user.country}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("quotes")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "quotes" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquareQuote className="h-4 w-4" /> My Quotes ({quotes.length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "favorites" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart className="h-4 w-4" /> Favorites ({favorites.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {activeTab === "quotes" ? (
          quotes.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareQuote className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No quotes yet</h3>
              <p className="mt-2 text-sm text-gray-500">Submit a quote request and track its delivery status here.</p>
              <Link href="/#contact" className="mt-4 inline-block rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
                Get a Quote
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((q) => (
                <div key={q.id} className="rounded-xl bg-white border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{q.vehicleBrand} {q.model}</h3>
                      <p className="text-sm text-gray-500">Submitted {new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[q.status] || ""}`}>
                      {q.status}
                    </span>
                  </div>
                  {q.message && <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{q.message}</p>}

                  {/* Delivery tracking timeline */}
                  <DeliveryTracker status={q.deliveryStatus || "pending"} />
                </div>
              ))}
            </div>
          )
        ) : (
          favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No favorites yet</h3>
              <p className="mt-2 text-sm text-gray-500">Browse vehicles and tap the heart icon to save favorites.</p>
              <Link href="/inventory" className="mt-4 inline-block rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
                Browse Vehicles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {favorites.map((fav) => (
                <div key={fav.favId} className="overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <Link href={`/inventory/${fav.slug}`} className="block">
                    <div className="relative h-40 bg-gray-100">
                      {fav.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fav.image}
                          alt={`${fav.brand} ${fav.model}`}
                          className={`h-full w-full ${fav.image.startsWith("/cars/") ? "object-contain p-3" : "object-cover"}`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                      {fav.badge && (
                        <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {fav.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFavorite(fav.vehicleId); }}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-red-500">{fav.brand}</span>
                        <span className="text-[11px] text-gray-500">{fav.year}</span>
                      </div>
                      <h3 className="mt-0.5 font-semibold text-gray-900">{fav.model}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{fav.fuel}</span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{fav.bodyType}</span>
                        </div>
                        <div className="font-bold text-red-500">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(fav.price)}
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400">Saved {new Date(fav.favoritedAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Sign Out — bottom of page so it's always reachable */}
      <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
