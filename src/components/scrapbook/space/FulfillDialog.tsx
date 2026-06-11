"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  compressImage,
  removeFill,
  setFill,
  type Fill,
  type GallerySide,
  type Placeholder,
} from "@/lib/scrapbook/gallery";

/** Tempel (atau ganti) foto untuk satu momen. */

function isDataUrl(s: string) {
  return s.startsWith("data:");
}

export function FulfillDialog({
  placeholder,
  side,
  existing,
  onClose,
  onDone,
}: {
  placeholder: Placeholder;
  side: GallerySide;
  existing?: Fill;
  onClose: () => void;
  onDone: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lovie:sheet", { detail: { open: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent("lovie:sheet", { detail: { open: false } }));
    };
  }, []);

  const pickFile = async (file: File) => {
    setError("");
    setBusy(true);
    try {
      let data = await compressImage(file, 1000, 0.82);
      if (data.length > 520_000) data = await compressImage(file, 1000, 0.62);
      if (data.length > 760_000) {
        setError("fotonya kegedean — coba yang lain ya?");
        setBusy(false);
        return;
      }
      setPhotoUrl(data);
    } catch {
      setError("gagal baca fotonya — coba lagi?");
    }
    setBusy(false);
  };

  const submit = async () => {
    if (!photoUrl) return setError("pilih atau upload satu foto dulu.");
    setError("");
    setSaving(true);
    try {
      await setFill(side, placeholder.id, photoUrl, note);
      onDone();
    } catch (e) {
      setError(e instanceof Error && e.message === "too_large" ? "fotonya kegedean — coba yang lain ya?" : "gagal nyimpen — coba lagi?");
      setSaving(false);
    }
  };

  const unfill = async () => {
    setSaving(true);
    try {
      await removeFill(side, placeholder.id);
      onDone();
    } catch {
      setError("gagal lepas foto — coba lagi?");
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(10,2,0,0.78)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: "#F2E6C9", maxHeight: "90dvh", padding: 24, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)", overscrollBehavior: "contain" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[rgba(91,70,54,0.3)] sm:hidden" />

        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9C8568" }}>
          {side === "vie" ? "punya Vie" : "punya Abel"} · momen
        </p>
        <h3 className="mb-4" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, color: "#4A2C1E" }}>
          {placeholder.prompt}
        </h3>

        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) pickFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="relative mx-auto flex cursor-pointer items-center justify-center"
          style={{ width: 180, height: 210, background: "#FBF6E8", padding: 8, paddingBottom: 32, border: "2px dashed rgba(91,70,54,0.4)", transform: "rotate(-2deg)" }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="preview" className="h-full w-full object-cover" loading={isDataUrl(photoUrl) ? "lazy" : undefined} />
          ) : (
            <span className="px-3 text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C8568" }}>
              {busy ? "memuat…" : "ketuk untuk pilih foto dari galeri"}
            </span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
          }}
        />

        <label className="mt-5 flex flex-col gap-1">
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9C8568" }}>
            catatan kecil (opsional)
          </span>
          <input
            value={note}
            maxLength={60}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cerita di balik fotonya…"
            className="bg-transparent pb-1 outline-none"
            style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#2B1408", borderBottom: "1px solid rgba(91,70,54,0.35)" }}
          />
        </label>

        {error && (
          <p className="mt-3 text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#8C1107" }}>
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col items-center gap-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            onClick={submit}
            disabled={saving}
            className="min-h-[52px] w-full rounded-md disabled:opacity-60"
            style={{ background: "#FBF6E8", border: "1px solid rgba(91,70,54,0.4)", fontFamily: "var(--font-body)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4A2C1E" }}
          >
            {saving ? "nyimpen…" : existing ? "ganti fotonya" : "tempel foto"}
          </button>
          {existing ? (
            <button onClick={unfill} disabled={saving} className="disabled:opacity-50" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#8C1107" }}>
              lepas foto ini
            </button>
          ) : (
            <button onClick={onClose} style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C8568" }}>
              nanti aja
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
