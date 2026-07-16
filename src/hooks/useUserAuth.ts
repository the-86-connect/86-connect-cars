"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  country?: string;
}

export function useUserAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUser(data?.authenticated ? data : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setUser(null);
  }, []);

  return { user, loading, logout };
}

export function useFavorites(userId: string | null) {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setLoading(false); return; }
    fetch("/api/user/favorites")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setFavoriteIds(new Set(data.map((f: Record<string, unknown>) => f.vehicleId as string)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const toggleFavorite = useCallback(async (vehicleId: string) => {
    if (!userId) {
      router.push("/account/login");
      return false;
    }

    const isFav = favoriteIds.has(vehicleId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });

    try {
      if (isFav) {
        await fetch("/api/user/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId }),
        });
      } else {
        await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId }),
        });
      }
    } catch {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(vehicleId);
        else next.delete(vehicleId);
        return next;
      });
    }
    return true;
  }, [userId, favoriteIds]);

  return { favoriteIds, toggleFavorite, loading };
}
