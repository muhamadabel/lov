"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  addPlaceholder,
  fetchSpace,
  removePlaceholder,
  updatePlaceholder,
  type Placeholder,
} from "@/lib/scrapbook/gallery";

/** Panel kelola momen — tambah / ubah / hapus placeholder. Tersimpan di database. */

export function ManagePanel({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<Placeholder[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    try {
      const data = await fetchSpace();
      setList(data.placeholders);
    } catch {
      /* abaikan */
    }
  };

  useEffect(() => {
    reload();
    window.dispatchEvent(new CustomEvent("lovie:sheet", { detail: { open: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent("lovie:sheet", { detail: { open: false } }));
    };
  }, []);

  const add = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    await addPlaceholder(draft);
    setDraft("");
    await reload();
    setBusy(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(10,2,0,0.78)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: "#F2E6C9", maxHeight: "88dvh", padding: 24, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)", overscrollBehavior: "contain" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[rgba(91,70,54,0.3)] sm:hidden" />
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, color: "#4A2C1E" }}>
          Kelola momen
        </h3>
        <p className="mb-4" style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#9C8568" }}>
          tiap momen muncul di sisi Vie & Abel · {list.length} momen
        </p>

        <div className="flex flex-col gap-2">
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span style={{ fontSize: 14, color: "#9C8568" }}>·</span>
              <input
                defaultValue={p.prompt}
                onBlur={async (e) => {
                  const v = e.target.value.trim();
                  if (v && v !== p.prompt) {
                    await updatePlaceholder(p.id, v);
                    reload();
                  }
                }}
                className="flex-1 bg-transparent pb-1 outline-none"
                style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#2B1408", borderBottom: "1px solid rgba(91,70,54,0.25)" }}
              />
              <button
                onClick={async () => {
                  await removePlaceholder(p.id);
                  reload();
                }}
                aria-label="hapus momen"
                className="px-2 text-lg"
                style={{ color: "#8C1107" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-end gap-2 border-t border-[rgba(91,70,54,0.2)] pt-4">
          <div className="flex flex-1 flex-col gap-1">
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9C8568" }}>
              tambah momen baru
            </span>
            <input
              value={draft}
              maxLength={40}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="mis. lagi nugas bareng"
              className="bg-transparent pb-1 outline-none"
              style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#2B1408", borderBottom: "1px solid rgba(91,70,54,0.35)" }}
            />
          </div>
          <button
            onClick={add}
            disabled={busy}
            className="min-h-[44px] rounded-md px-4 disabled:opacity-50"
            style={{ background: "#FBF6E8", border: "1px solid rgba(91,70,54,0.4)", fontFamily: "var(--font-body)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A2C1E" }}
          >
            {busy ? "…" : "tambah"}
          </button>
        </div>

        <button onClick={onClose} className="mx-auto mt-5 block" style={{ fontFamily: "var(--font-hand)", fontSize: 16, color: "#9C8568" }}>
          selesai
        </button>
      </motion.div>
    </motion.div>
  );
}
