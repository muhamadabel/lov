"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Collection Book — sekarang ditopang database (Postgres via /api/*).
 * Tiap "placeholder" = satu momen (mis. "lagi makan") yang slotnya awalnya kosong
 * dan diisi dengan menempel foto. Dua sisi: "vie" & "abel". Data hidup di server →
 * muncul di semua perangkat. compressImage tetap jalan di klien.
 */

export type GallerySide = "vie" | "abel";

export interface Placeholder {
  id: string;
  prompt: string;
}

export interface Fill {
  side: GallerySide;
  placeholderId: string;
  photoUrl: string;
  note?: string;
  filledAt: number;
}

interface SpaceData {
  placeholders: Placeholder[];
  fills: Fill[];
}

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("lovie-gallery"));
}

// ---------- API ----------

export async function fetchSpace(): Promise<SpaceData> {
  const res = await fetch("/api/space", { cache: "no-store" });
  if (!res.ok) throw new Error("space_fetch_failed");
  return res.json();
}

export async function addPlaceholder(prompt: string) {
  await fetch("/api/placeholders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  emit();
}

export async function updatePlaceholder(id: string, prompt: string) {
  await fetch("/api/placeholders", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, prompt }),
  });
  emit();
}

export async function removePlaceholder(id: string) {
  await fetch("/api/placeholders", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  emit();
}

export async function setFill(side: GallerySide, placeholderId: string, photoUrl: string, note?: string) {
  const res = await fetch("/api/fills", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ side, placeholderId, photoUrl, note }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error === "too_large" ? "too_large" : "fill_failed");
  }
  emit();
}

export async function removeFill(side: GallerySide, placeholderId: string) {
  await fetch("/api/fills", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ side, placeholderId }),
  });
  emit();
}

export function fillKey(side: GallerySide, placeholderId: string) {
  return `${side}:${placeholderId}`;
}

// ---------- Kompresi gambar (klien) ----------

export function compressImage(file: File, maxSize = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas tidak tersedia"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca gambar"));
    };
    img.src = url;
  });
}

// ---------- Hook ----------

export function useSpace() {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [fills, setFills] = useState<Fill[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSpace();
      setPlaceholders(data.placeholders);
      setFills(data.fills);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("lovie-gallery", on);
    return () => window.removeEventListener("lovie-gallery", on);
  }, [refresh]);

  const byKey = new Map(fills.map((f) => [fillKey(f.side, f.placeholderId), f]));
  const doneFor = (side: GallerySide) =>
    placeholders.filter((p) => byKey.has(fillKey(side, p.id))).length;

  const totalSlots = placeholders.length * 2;
  const totalDone = fills.filter((f) => placeholders.some((p) => p.id === f.placeholderId)).length;
  const ratio = totalSlots === 0 ? 0 : totalDone / totalSlots;

  return {
    placeholders,
    fills,
    byKey,
    loaded,
    error,
    refresh,
    doneFor,
    totalDone,
    totalSlots,
    perSide: placeholders.length,
    ratio,
  };
}
