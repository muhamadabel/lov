"use client";

import { useCallback, useEffect, useState } from "react";

export type Mood = "happy" | "hungry" | "ngambek";
export type Phase = "kitten" | "teen" | "adult";
export type PetAction = "feed" | "coffee" | "pet" | "cook";

export interface PetState {
  fullness: number;
  happiness: number;
  mood: Mood;
  phase: Phase;
  caffeinated: boolean;
  stuffed: boolean;
  lasagna: number;
  growth: number;
  ageDays: number;
  fedAgoH: number;
  diary: { entry: string; at: number }[];
}

/** Malam = lewat jam 22.00 waktu lokal pengunjung. */
export function isNight(): boolean {
  const h = new Date().getHours();
  return h >= 22 || h < 5;
}

/** Senin waktu lokal pengunjung. */
export function isMonday(): boolean {
  return new Date().getDay() === 1;
}

export const PHASE_LABEL: Record<Phase, string> = {
  kitten: "Anak kucing",
  teen: "Remaja",
  adult: "Dewasa (gembul)",
};

export const MOOD_LABEL: Record<Mood, string> = {
  happy: "Bahagia & kenyang",
  hungry: "Lapar & lemas",
  ngambek: "Ngambek (mogok)",
};

export function usePet() {
  const [state, setState] = useState<PetState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/pet", { cache: "no-store" });
      if (!res.ok) throw new Error("pet_unavailable");
      setState(await res.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const act = useCallback(async (action: PetAction) => {
    setBusy(true);
    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setState(await res.json());
    } catch {
      /* abaikan */
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, loaded, error, busy, refresh, act };
}
