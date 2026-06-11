"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * Game "bikin 24": 4 kartu (1-11), gabungkan pakai + − × ÷ sampai jadi 24.
 * Cara main: tap kartu → tap operator → tap kartu lain → keduanya jadi satu kartu hasil.
 * Ulangi sampai sisa satu kartu = 24. Kartu dijamin selalu ada solusinya.
 */

type Frac = { n: number; d: number };
type Op = "+" | "−" | "×" | "÷";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function frac(n: number, d = 1): Frac {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
const fAdd = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const fSub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const fMul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
const fDiv = (a: Frac, b: Frac): Frac | null => (b.n === 0 ? null : frac(a.n * b.d, a.d * b.n));
const is24 = (a: Frac) => a.d === 1 && a.n === 24;
const fStr = (a: Frac) => (a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`);

function apply(op: Op, a: Frac, b: Frac): Frac | null {
  if (op === "+") return fAdd(a, b);
  if (op === "−") return fSub(a, b);
  if (op === "×") return fMul(a, b);
  return fDiv(a, b);
}

// solver: bisa nggak sih dari `nums` dibikin 24
function solvable(nums: Frac[]): boolean {
  if (nums.length === 1) return is24(nums[0]);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue;
      const rest = nums.filter((_, k) => k !== i && k !== j);
      const a = nums[i];
      const b = nums[j];
      const results = [fAdd(a, b), fSub(a, b), fMul(a, b), fDiv(a, b)].filter(Boolean) as Frac[];
      for (const r of results) {
        if (solvable([...rest, r])) return true;
      }
    }
  }
  return false;
}

function newHand(): number[] {
  for (let tries = 0; tries < 500; tries++) {
    const h = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 11));
    if (solvable(h.map((v) => frac(v)))) return h;
  }
  return [4, 6, 10, 11]; // fallback (solvable: 10-(11-6-4)... pasti ada)
}

interface Card {
  id: number;
  v: Frac;
}

export function Game24({ onWin, onClose }: { onWin: () => void; onClose: () => void }) {
  const [seed, setSeed] = useState(0);
  const start = useMemo(() => newHand(), [seed]);
  const [cards, setCards] = useState<Card[]>(() => start.map((v, i) => ({ id: i, v: frac(v) })));
  const [sel, setSel] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [nextId, setNextId] = useState(4);
  const [failed, setFailed] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    setCards(start.map((v, i) => ({ id: i, v: frac(v) })));
    setSel(null);
    setOp(null);
    setNextId(4);
    setFailed(false);
    setWon(false);
  }, [start]);

  const resetSame = () => {
    setCards(start.map((v, i) => ({ id: i, v: frac(v) })));
    setSel(null);
    setOp(null);
    setNextId(4);
    setFailed(false);
  };

  const tapCard = (id: number) => {
    if (won) return;
    if (sel === null) {
      setSel(id);
      return;
    }
    if (sel === id) {
      setSel(null);
      setOp(null);
      return;
    }
    if (op === null) {
      setSel(id); // pindah pilihan
      return;
    }
    // gabung sel (op) id
    const a = cards.find((c) => c.id === sel)!;
    const b = cards.find((c) => c.id === id)!;
    const r = apply(op, a.v, b.v);
    if (!r) {
      setOp(null);
      return;
    }
    const merged: Card = { id: nextId, v: r };
    const next = cards.filter((c) => c.id !== sel && c.id !== id);
    next.push(merged);
    setNextId((n) => n + 1);
    setSel(null);
    setOp(null);
    if (next.length === 1) {
      if (is24(next[0].v)) {
        setWon(true);
        setTimeout(onWin, 900);
      } else {
        setFailed(true);
      }
    }
    setCards(next);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "#4A2C1E" }}>masak lasagna: bikin 24</p>
        <p style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#9C6B3E" }}>
          gabungin semua kartu pakai + − × ÷ sampai jadi 24
        </p>
      </div>

      {/* kartu */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {cards.map((c) => {
          const active = sel === c.id;
          return (
            <motion.button
              key={c.id}
              layout
              onClick={() => tapCard(c.id)}
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 64,
                height: 84,
                background: active ? "#E8913C" : "#FFFDF5",
                color: active ? "#3a2410" : "#4A2C1E",
                border: active ? "2px solid #B5631C" : "2px solid rgba(91,70,54,0.2)",
                boxShadow: "0 6px 14px -8px rgba(0,0,0,0.4)",
                fontFamily: "var(--font-display)",
                fontSize: c.v.d === 1 ? 30 : 20,
                fontWeight: 600,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {fStr(c.v)}
            </motion.button>
          );
        })}
      </div>

      {/* operator */}
      {!won && cards.length > 1 && (
        <div className="flex gap-3">
          {(["+", "−", "×", "÷"] as Op[]).map((o) => (
            <button
              key={o}
              onClick={() => sel !== null && setOp(o)}
              disabled={sel === null}
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl disabled:opacity-40"
              style={{
                background: op === o ? "#E8913C" : "#FFFDF5",
                color: op === o ? "#3a2410" : "#5a3a1e",
                border: "2px solid rgba(91,70,54,0.2)",
                fontFamily: "var(--font-display)",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {won && (
          <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontFamily: "var(--font-hand)", fontSize: 20, color: "#2e7d32" }}>
            24! lasagna jadi 🍝
          </motion.p>
        )}
      </AnimatePresence>
      {failed && !won && (
        <p style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#8C1107" }}>yah, bukan 24. coba ulang.</p>
      )}

      {/* tombol */}
      {!won && (
        <div className="flex items-center gap-4">
          <button onClick={resetSame} style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#7A2D1C" }}>↺ ulang kartu ini</button>
          <button onClick={() => setSeed((s) => s + 1)} style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C6B3E" }}>kartu baru</button>
          <button onClick={onClose} style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C8568" }}>nanti aja</button>
        </div>
      )}
    </div>
  );
}
