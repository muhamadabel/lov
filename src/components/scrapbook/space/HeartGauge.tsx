"use client";

import { motion } from "framer-motion";

/**
 * Hati yang keisi "cairan" sesuai rasio (0..1). Permukaan beranimasi ombak,
 * level naik turun mengikuti seberapa banyak slot terisi.
 */

const HEART =
  "M50 88 C12 60 0 38 0 24 C0 8 14 0 26 0 C38 0 46 8 50 18 C54 8 62 0 74 0 C86 0 100 8 100 24 C100 38 88 60 50 88 Z";

// satu gelombang penuh per 100 satuan (mulus saat digeser 100)
const wavePath = (amp: number) =>
  `M-100 0 Q -75 ${-amp} -50 0 T 0 0 T 50 0 T 100 0 T 150 0 T 200 0 V 200 H -100 Z`;

export function HeartGauge({
  ratio,
  label,
}: {
  ratio: number;
  label?: React.ReactNode;
}) {
  const r = Math.max(0, Math.min(1, ratio));
  const top = 92 * (1 - r); // posisi permukaan cairan dalam viewBox
  const full = r >= 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: "min(52vw, 190px)" }}>
        <svg viewBox="0 0 100 92" width="100%" style={{ overflow: "visible" }}>
          <defs>
            <clipPath id="heart-clip">
              <path d={HEART} />
            </clipPath>
          </defs>

          {/* hati kosong (latar) */}
          <path d={HEART} fill="rgba(140,17,7,0.07)" />

          {/* cairan */}
          <g clipPath="url(#heart-clip)">
            <motion.g
              initial={false}
              animate={{ y: top }}
              transition={{ type: "spring", stiffness: 55, damping: 16 }}
            >
              <motion.path
                d={wavePath(3)}
                fill="rgba(228,109,103,0.9)"
                animate={{ x: [0, 100] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d={wavePath(2.2)}
                fill="rgba(193,52,44,0.55)"
                animate={{ x: [0, -100] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          </g>

          {/* kilau */}
          <path
            d="M30 20 C26 26 26 34 30 40"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2.5"
            strokeLinecap="round"
            clipPath="url(#heart-clip)"
          />
          {/* garis hati */}
          <path d={HEART} fill="none" stroke="#8C1107" strokeWidth="1.6" />
        </svg>
      </div>

      <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, color: "#4A2C1E" }}>
        {full ? "hatinya penuh ♡" : `${Math.round(r * 100)}% keisi`}
      </p>
      {label && <div className="text-center">{label}</div>}
    </div>
  );
}
