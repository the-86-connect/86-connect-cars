"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface UserData {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  country?: string;
}

function sessionToUser(session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null): UserData | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    name: (u.user_metadata?.name as string) ?? "",
    email: u.email ?? "",
    whatsapp: u.user_metadata?.whatsapp as string | undefined,
    country: u.user_metadata?.country as string | undefined,
  };
}

export function useUserAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(sessionToUser(session));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, logout, userId: user?.id ?? null, isLoggedIn: !!user };
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
