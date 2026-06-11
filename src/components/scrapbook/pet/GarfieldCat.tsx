"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Mood, Phase } from "@/lib/scrapbook/pet";

/**
 * Kucing oranye gembul orisinal (terinspirasi arketipe kucing pemalas pecinta
 * lasagna — bukan salinan karakter berhak cipta). Ekspresif per mood & fase.
 */

const ORANGE = "#E8913C";
const ORANGE_D = "#CE7526";
const ORANGE_DD = "#B5631C";
const CREAM = "#F6E2C0";
const PINK = "#E58AA0";

export function GarfieldCat({
  mood,
  phase,
  caffeinated,
  sleeping,
  night = false,
  burst,
}: {
  mood: Mood;
  phase: Phase;
  caffeinated: boolean;
  sleeping: boolean;
  night?: boolean;
  burst?: { type: "hearts" | "sparkle"; id: number };
}) {
  const scale = phase === "kitten" ? 0.82 : phase === "teen" ? 0.95 : 1.08;
  const eyeBig = phase === "kitten" ? 1.25 : phase === "teen" ? 1.08 : 1;

  return (
    <div className="relative" style={{ width: "min(72vw, 280px)", aspectRatio: "1 / 1" }}>
      <motion.svg
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        animate={sleeping ? { y: [0, 3, 0] } : { y: [0, -5, 0] }}
        transition={{ duration: sleeping ? 4 : 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ overflow: "visible", filter: "drop-shadow(0 18px 16px rgba(0,0,0,0.28))" }}
      >
        <g transform={`translate(120 130) scale(${scale}) translate(-120 -130)`}>
          {mood === "ngambek" ? (
            <CatBack />
          ) : (
            <CatFront mood={mood} caffeinated={caffeinated} sleeping={sleeping} night={night} eyeBig={eyeBig} />
          )}
        </g>
      </motion.svg>

      {/* ground shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "6%", width: "52%", height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.18)", filter: "blur(6px)" }}
      />

      {/* burst efek */}
      <AnimatePresence>
        {burst && (
          <Burst key={burst.id} type={burst.type} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- tampak depan ----------------

function CatFront({
  mood,
  caffeinated,
  sleeping,
  night,
  eyeBig,
}: {
  mood: Mood;
  caffeinated: boolean;
  sleeping: boolean;
  night: boolean;
  eyeBig: number;
}) {
  return (
    <>
      {/* ekor */}
      <motion.path
        d="M185 175 q40 -6 34 -42 q-3 -18 -18 -16 q12 8 6 26 q-6 18 -28 18 z"
        fill={ORANGE_D}
        style={{ transformOrigin: "185px 175px" }}
        animate={sleeping ? {} : { rotate: [0, -8, 0, 6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* badan */}
      <ellipse cx="120" cy="168" rx="72" ry="54" fill={ORANGE} />
      <ellipse cx="120" cy="182" rx="46" ry="34" fill={CREAM} />
      {/* belang badan */}
      <path d="M70 150 q8 14 0 30" stroke={ORANGE_D} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M170 150 q-8 14 0 30" stroke={ORANGE_D} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.65" />
      {/* kaki depan */}
      <ellipse cx="98" cy="212" rx="18" ry="12" fill={ORANGE} />
      <ellipse cx="142" cy="212" rx="18" ry="12" fill={ORANGE} />

      {/* kepala */}
      <g>
        {/* telinga */}
        <path d="M82 70 l-10 -34 l34 16 z" fill={ORANGE} />
        <path d="M158 70 l10 -34 l-34 16 z" fill={ORANGE} />
        <path d="M84 62 l-5 -18 l17 9 z" fill={PINK} opacity="0.75" />
        <path d="M156 62 l5 -18 l-17 9 z" fill={PINK} opacity="0.75" />
        {/* wajah */}
        <circle cx="120" cy="96" r="54" fill={ORANGE} />
        {/* belang dahi */}
        <path d="M112 50 q8 8 0 16" stroke={ORANGE_D} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M128 50 q-8 8 0 16" stroke={ORANGE_D} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
        {/* pipi */}
        <ellipse cx="96" cy="112" rx="20" ry="16" fill={CREAM} />
        <ellipse cx="144" cy="112" rx="20" ry="16" fill={CREAM} />

        {/* mata + mulut per-mood */}
        <Eyes mood={mood} caffeinated={caffeinated} sleeping={sleeping} eyeBig={eyeBig} />
        {/* hidung */}
        <path d="M114 108 l12 0 l-6 7 z" fill={PINK} />
        <Mouth mood={mood} sleeping={sleeping} />

        {/* kumis */}
        <g stroke={ORANGE_DD} strokeWidth="1.6" opacity="0.5" strokeLinecap="round">
          <line x1="78" y1="108" x2="56" y2="104" />
          <line x1="78" y1="114" x2="55" y2="116" />
          <line x1="162" y1="108" x2="184" y2="104" />
          <line x1="162" y1="114" x2="185" y2="116" />
        </g>

        {/* aksesori */}
        {sleeping && night && <SleepMask />}
      </g>

      {sleeping && <Zzz />}
      {mood === "hungry" && !sleeping && <EmptyPlate />}
    </>
  );
}

function Eyes({ mood, caffeinated, sleeping, eyeBig }: { mood: Mood; caffeinated: boolean; sleeping: boolean; eyeBig: number }) {
  if (sleeping) {
    return (
      <g stroke={ORANGE_DD} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M88 92 q10 8 20 0" />
        <path d="M132 92 q10 8 20 0" />
      </g>
    );
  }
  if (mood === "hungry") {
    // mata sayu setengah tertutup
    return (
      <g>
        <ellipse cx="98" cy="94" rx={9 * eyeBig} ry={7} fill="#3A2A1C" />
        <ellipse cx="142" cy="94" rx={9 * eyeBig} ry={7} fill="#3A2A1C" />
        {/* kelopak turun */}
        <path d={`M${98 - 11 * eyeBig} 92 q${11 * eyeBig} -5 ${22 * eyeBig} 0`} stroke={ORANGE} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={`M${142 - 11 * eyeBig} 92 q${11 * eyeBig} -5 ${22 * eyeBig} 0`} stroke={ORANGE} strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  // happy / caffeinated → mata bulat
  const r = (caffeinated ? 12 : 10) * eyeBig;
  return (
    <g>
      <ellipse cx="98" cy="92" rx={r} ry={r + 2} fill="#fff" />
      <ellipse cx="142" cy="92" rx={r} ry={r + 2} fill="#fff" />
      <circle cx="100" cy="94" r={caffeinated ? 6 : 5.5} fill="#2A1D12" />
      <circle cx="144" cy="94" r={caffeinated ? 6 : 5.5} fill="#2A1D12" />
      <circle cx="98" cy="91" r="2" fill="#fff" />
      <circle cx="142" cy="91" r="2" fill="#fff" />
      {caffeinated && (
        <g fill="#FFD66B">
          <Star x={84} y={78} />
          <Star x={158} y={78} />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood, sleeping }: { mood: Mood; sleeping: boolean }) {
  if (sleeping) return <path d="M112 120 q8 4 16 0" stroke={ORANGE_DD} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  if (mood === "hungry")
    return <path d="M108 124 q12 -8 24 0" stroke={ORANGE_DD} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
  // happy
  return (
    <path d="M104 118 q16 16 32 0" stroke={ORANGE_DD} strokeWidth="2.8" fill="none" strokeLinecap="round" />
  );
}

function Star({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 5} l1.6 3.4 l3.4 0.4 l-2.6 2.4 l0.8 3.6 l-3.2 -1.8 l-3.2 1.8 l0.8 -3.6 l-2.6 -2.4 l3.4 -0.4 z`} />;
}

// ---------------- tampak belakang (ngambek) ----------------

function CatBack() {
  return (
    <>
      {/* awan badai */}
      <g>
        <motion.g
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="120" cy="40" rx="46" ry="22" fill="#5A5560" />
          <ellipse cx="92" cy="44" rx="22" ry="16" fill="#6B6570" />
          <ellipse cx="150" cy="44" rx="22" ry="16" fill="#6B6570" />
          <path d="M108 56 l-6 14 l8 -4 l-4 14" stroke="#FFD66B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </g>
      {/* ekor menjuntai kesal */}
      <motion.path
        d="M58 180 q-34 -4 -30 -40 q2 -16 16 -14 q-10 8 -4 24 q6 16 26 14 z"
        fill={ORANGE_D}
        style={{ transformOrigin: "58px 180px" }}
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* punggung */}
      <ellipse cx="120" cy="172" rx="74" ry="58" fill={ORANGE} />
      {/* belang punggung */}
      <path d="M120 120 v40" stroke={ORANGE_D} strokeWidth="7" strokeLinecap="round" opacity="0.55" />
      <path d="M96 128 v34" stroke={ORANGE_D} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M144 128 v34" stroke={ORANGE_D} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      {/* kepala dari belakang */}
      <circle cx="120" cy="118" r="50" fill={ORANGE} />
      <path d="M84 92 l-8 -30 l30 14 z" fill={ORANGE} />
      <path d="M156 92 l8 -30 l-30 14 z" fill={ORANGE} />
      {/* teks hmph */}
      <text x="176" y="96" fontFamily="var(--font-hand)" fontSize="20" fill={ORANGE_DD}>hmph!</text>
    </>
  );
}

// ---------------- aksesori ----------------

function SleepMask() {
  return (
    <g>
      <path d="M76 90 q44 -16 88 0 l0 12 q-44 14 -88 0 z" fill="#7C5BD6" opacity="0.92" />
      <line x1="76" y1="90" x2="60" y2="82" stroke="#7C5BD6" strokeWidth="3" strokeLinecap="round" />
      <line x1="164" y1="90" x2="180" y2="82" stroke="#7C5BD6" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Zzz() {
  return (
    <g fill={CREAM} opacity="0.9" fontFamily="var(--font-hand)">
      <motion.text x="170" y="60" fontSize="20" animate={{ y: [60, 44], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>z</motion.text>
      <motion.text x="184" y="48" fontSize="26" animate={{ y: [48, 30], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>Z</motion.text>
    </g>
  );
}

function EmptyPlate() {
  return (
    <g>
      <ellipse cx="120" cy="216" rx="40" ry="9" fill="#D8C7B0" />
      <ellipse cx="120" cy="214" rx="30" ry="6" fill="#C2AE92" />
      {/* garpu */}
      <g stroke="#9A9088" strokeWidth="2.4" strokeLinecap="round">
        <line x1="150" y1="196" x2="150" y2="214" />
        <line x1="146" y1="196" x2="146" y2="204" />
        <line x1="154" y1="196" x2="154" y2="204" />
      </g>
    </g>
  );
}

// ---------------- burst efek ----------------

function Burst({ type }: { type: "hearts" | "sparkle" }) {
  const items = [0, 1, 2, 3];
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((i) => {
        const x = 30 + i * 14 + (i % 2) * 6;
        return (
          <motion.span
            key={i}
            className="absolute"
            style={{ left: `${x}%`, top: "38%", fontSize: type === "hearts" ? 22 : 18 }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -70 - i * 8, scale: 1, x: (i % 2 ? 1 : -1) * 14 }}
            transition={{ duration: 1.1, delay: i * 0.08, ease: "easeOut" }}
          >
            {type === "hearts" ? "💛" : "✨"}
          </motion.span>
        );
      })}
    </div>
  );
}
