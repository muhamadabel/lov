"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GarfieldCat } from "@/components/scrapbook/pet/GarfieldCat";
import { Game24 } from "@/components/scrapbook/pet/Game24";
import { isSpaceUnlocked } from "@/lib/scrapbook/auth";
import { isMonday, isNight, MOOD_LABEL, PHASE_LABEL, usePet } from "@/lib/scrapbook/pet";

const EASE = [0.16, 1, 0.3, 1] as const;
const NAME = "WOWO";

const SPEECH: Record<string, string[]> = {
  happy: ["ih, baru muncul? telat tau.", "ya udah sih, aku emang lucu. terus?", "jangan bengong — elus napa."],
  hungry: ["laper. tanggung jawab dong.", "perutku konser, kamu cuma nonton?", "masak gih, jangan pelit lasagna."],
  ngambek: ["telat ngasih makan. nih, kukunci bukunya.", "sogok aku. gampang kok, asal niat.", "aku ngambek. ini bukan drama, ini prinsip."],
  stuffed: ["kenyang banget… jangan ganggu, mau tidur.", "udah cukup. aku bukan tong sampah lasagna."],
};

export default function PetPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { state, loaded, error, busy, act } = usePet();
  const [burst, setBurst] = useState<{ type: "hearts" | "sparkle"; id: number } | undefined>();
  const [dream, setDream] = useState(false);
  const [game, setGame] = useState(false);
  const [anger, setAnger] = useState(100);
  const burstId = useRef(0);

  const night = isNight();
  const monday = isMonday();

  useEffect(() => {
    if (!isSpaceUnlocked()) router.replace("/");
    else setReady(true);
  }, [router]);

  useEffect(() => {
    const html = document.documentElement;
    const pHtml = html.style.background;
    const pBody = document.body.style.background;
    const base = night ? "#160e1f" : "#E0A86A";
    html.style.background = base;
    document.body.style.background = base;
    return () => {
      html.style.background = pHtml;
      document.body.style.background = pBody;
    };
  }, [night]);

  const sleeping = !!state && (state.stuffed || (night && state.mood !== "ngambek"));

  const speech = useMemo(() => {
    if (!state) return "";
    if (state.stuffed) return SPEECH.stuffed[state.fedAgoH % SPEECH.stuffed.length];
    if (monday && state.mood !== "ngambek") return "senin. males. jangan harap aku ramah.";
    const pool = SPEECH[state.mood];
    return pool[Math.floor(state.fedAgoH) % pool.length];
  }, [state, monday]);

  const fireBurst = (type: "hearts" | "sparkle") => {
    burstId.current += 1;
    setBurst({ type, id: burstId.current });
  };

  const onFeed = async () => {
    if (!state || state.lasagna <= 0 || state.stuffed || (monday && state.mood !== "ngambek")) return;
    await act("feed");
    fireBurst("hearts");
  };
  const onCoffee = async () => {
    await act("coffee");
    fireBurst("sparkle");
  };
  const onPet = async () => {
    await act("pet");
    fireBurst("hearts");
  };
  const onCookWin = async () => {
    await act("cook");
    setGame(false);
    fireBurst("sparkle");
  };
  const onBribe = async () => {
    await act("pet");
    fireBurst("hearts");
    setAnger((a) => Math.max(0, a - 34));
  };
  const onBribeFeed = async () => {
    await act("feed");
    fireBurst("hearts");
    setAnger(100);
  };

  if (!ready || !loaded) return <div className="fixed inset-0" style={{ background: "#1c0f06" }} />;

  if (error || !state) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: "#1c0f06" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "#F6E2C0" }}>{NAME} lagi nyari sinyal ke database…</p>
        <Link href="/space" className="text-cream/70 underline" style={{ fontFamily: "var(--font-hand)" }}>balik ke buku</Link>
      </main>
    );
  }

  const noFood = state.lasagna <= 0;

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden" style={{ background: cozyBg(night) }}>
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ bottom: "8%", width: "min(86vw, 420px)", height: 90, borderRadius: "50%", background: "rgba(120,40,20,0.18)", filter: "blur(2px)" }} />

      <div className="z-10 flex w-full max-w-md items-center justify-between px-5 pt-6">
        <Link href="/space" aria-label="balik ke buku" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/40 text-[#5a3a1e] backdrop-blur">‹</Link>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "0.06em", color: "#4A2C1E" }}>{NAME}</p>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: 13, color: "#9C6B3E" }}>
            {PHASE_LABEL[state.phase]} · umur {state.ageDays} hari · {state.stuffed ? "Kekenyangan (tidur)" : MOOD_LABEL[state.mood]}
          </p>
        </div>
        <div className="flex h-10 items-center rounded-full bg-white/40 px-3 backdrop-blur" title="stok lasagna">
          <span style={{ fontSize: 15 }}>🍝</span>
          <span className="ml-1" style={{ fontFamily: "var(--font-hand)", fontSize: 16, color: "#5a3a1e" }}>{state.lasagna}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={speech} className="z-10 mt-3 max-w-xs rounded-2xl px-4 py-2" style={{ background: "#FFFDF5", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.3)" }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <p className="text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 16, color: "#5a3a1e" }}>{speech}</p>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mt-1 flex flex-1 items-center justify-center">
        <button onClick={state.mood === "ngambek" || state.stuffed ? undefined : onPet} className="cursor-pointer active:scale-[0.98]" aria-label={`elus ${NAME}`}>
          <GarfieldCat mood={state.mood} phase={state.phase} caffeinated={state.caffeinated} sleeping={sleeping} night={night} burst={burst} />
        </button>

        {sleeping && !state.stuffed && (
          <motion.button onClick={() => setDream(true)} className="absolute" style={{ right: "14%", top: "8%" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} aria-label="intip mimpi">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: 20 }}>💭</span>
            </div>
          </motion.button>
        )}
      </div>

      <div className="z-10 w-full max-w-md px-5 pb-8" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white/45 p-4 backdrop-blur">
          <Bar label="Kenyang" value={state.fullness} color="#E8913C" />
          <Bar label="Bahagia" value={state.happiness} color="#E58AA0" />
          <p style={{ fontFamily: "var(--font-hand)", fontSize: 12, color: "#9C6B3E" }}>
            terakhir makan {state.fedAgoH <= 0 ? "barusan" : `${state.fedAgoH} jam lalu`} · poin tumbuh {state.growth}
          </p>
        </div>

        {state.mood === "ngambek" ? (
          <Bribe anger={anger} busy={busy} onBribe={onBribe} onFeed={onBribeFeed} />
        ) : state.stuffed ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/55 p-4 backdrop-blur">
            <p className="text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#5a3a1e" }}>
              dia kekenyangan terus ketiduran. tungguin, atau seduh kopi biar melek.
            </p>
            <button onClick={onCoffee} disabled={busy} className="min-h-[48px] rounded-xl px-6 disabled:opacity-50" style={{ background: "#FFFDF5", boxShadow: "0 6px 14px -8px rgba(0,0,0,0.3)", fontFamily: "var(--font-body)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5a3a1e" }}>☕ seduh kopi</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <ActionBtn label="Kasih makan" emoji="🍝" disabled={busy || noFood || (monday && true)} hint={monday ? "ditolak Senin" : noFood ? "stok habis" : undefined} onClick={onFeed} />
              <ActionBtn label="Kopi" emoji="☕" disabled={busy} onClick={onCoffee} />
              <ActionBtn label="Elus" emoji="🤚" disabled={busy} onClick={onPet} />
            </div>
            <button
              onClick={() => setGame(true)}
              disabled={busy || state.lasagna >= 9}
              className="mt-3 w-full rounded-2xl py-3 disabled:opacity-50"
              style={{ background: "#E8913C", color: "#3a2410", boxShadow: "0 6px 14px -8px rgba(0,0,0,0.4)", fontFamily: "var(--font-body)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              👨‍🍳 masak lasagna {noFood ? "(stok habis — main 24!)" : "(main 24)"}
            </button>
            {monday && (
              <p className="mt-2 text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 13, color: "#B5631C" }}>
                hari Senin: dia nolak lasagna. hibur pakai kopi & elus dulu ya.
              </p>
            )}
          </>
        )}

        {state.diary[0] && (
          <div className="mt-4 rounded-2xl p-4" style={{ background: "#FFFBEE", boxShadow: "0 6px 16px -10px rgba(0,0,0,0.25)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B79B6E" }}>buku harian {NAME.toLowerCase()}</p>
            <p className="mt-1" style={{ fontFamily: "var(--font-hand)", fontSize: 16, color: "#5a3a1e", lineHeight: 1.4 }}>“{state.diary[0].entry}”</p>
          </div>
        )}
      </div>

      {/* game 24 */}
      <AnimatePresence>
        {game && (
          <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" style={{ background: "rgba(20,10,4,0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGame(false)}>
            <motion.div className="w-full max-w-md rounded-t-3xl px-5 py-7 sm:rounded-3xl" style={{ background: "#F6ECCF", maxHeight: "90dvh", overflowY: "auto" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.5, ease: EASE }} onClick={(e) => e.stopPropagation()}>
              <Game24 onWin={onCookWin} onClose={() => setGame(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{dream && <DreamModal onClose={() => setDream(false)} />}</AnimatePresence>
    </main>
  );
}

function cozyBg(night: boolean) {
  return night
    ? "radial-gradient(120% 90% at 50% 18%, #3a2440 0%, #241830 55%, #160e1f 100%)"
    : "radial-gradient(120% 90% at 50% 20%, #FBE9C8 0%, #F2CE97 55%, #E0A86A 100%)";
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0" style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a5430" }}>{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(120,80,40,0.18)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={false} animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: EASE }} />
      </div>
      <span className="w-8 text-right" style={{ fontFamily: "var(--font-hand)", fontSize: 13, color: "#7a5430" }}>{value}</span>
    </div>
  );
}

function ActionBtn({ label, emoji, onClick, disabled, hint }: { label: string; emoji: string; onClick: () => void; disabled?: boolean; hint?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1 rounded-2xl py-3 transition active:scale-95 disabled:opacity-45" style={{ background: "#FFFDF5", boxShadow: "0 6px 14px -8px rgba(0,0,0,0.3)" }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5a3a1e" }}>{label}</span>
      {hint && <span style={{ fontFamily: "var(--font-hand)", fontSize: 10, color: "#B5631C" }}>{hint}</span>}
    </button>
  );
}

function Bribe({ anger, busy, onBribe, onFeed }: { anger: number; busy: boolean; onBribe: () => void; onFeed: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/55 p-4 backdrop-blur">
      <p className="text-center" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#8C1107" }}>
        dia ngambek & ngunci bukunya! sogok dulu — elus sampai amarahnya turun.
      </p>
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 18 }}>😾</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(120,80,40,0.18)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "#8C1107" }} initial={false} animate={{ width: `${anger}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
      {anger > 0 ? (
        <button onClick={onBribe} disabled={busy} className="min-h-[52px] rounded-xl disabled:opacity-50" style={{ background: "#FFFDF5", boxShadow: "0 6px 14px -8px rgba(0,0,0,0.3)", fontFamily: "var(--font-body)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5a3a1e" }}>
          🤚 elus buat melunakkan
        </button>
      ) : (
        <button onClick={onFeed} disabled={busy} className="min-h-[52px] rounded-xl disabled:opacity-50" style={{ background: "#E8913C", color: "#3a2410", fontFamily: "var(--font-body)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          🍝 sajikan lasagna penebus
        </button>
      )}
    </div>
  );
}

const DREAMS = [
  { emoji: "🍝🌊", text: "WOWO lagi berenang di lautan saus lasagna. Tanpa diet." },
  { emoji: "🐟👑", text: "WOWO mimpi jadi raja, semua ikan tunduk. Sombong, sesuai aslinya." },
  { emoji: "💛", text: "…dia mimpi momen manis kalian berdua. Tapi awas, jangan bilang dia." },
  { emoji: "🛋️☁️", text: "WOWO rebahan di atas awan empuk. Surga kucing males." },
];

function DreamModal({ onClose }: { onClose: () => void }) {
  const d = DREAMS[Math.floor((Date.now() / 1000) % DREAMS.length)];
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-6" style={{ background: "rgba(20,10,30,0.7)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="w-full max-w-xs rounded-3xl p-7 text-center" style={{ background: "#FFFDF5" }} initial={{ scale: 0.85, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 44 }}>{d.emoji}</div>
        <p className="mt-3" style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#5a3a1e", lineHeight: 1.4 }}>{d.text}</p>
        <button onClick={onClose} className="mt-4" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C6B3E" }}>sst, biarin dia tidur</button>
      </motion.div>
    </motion.div>
  );
}
