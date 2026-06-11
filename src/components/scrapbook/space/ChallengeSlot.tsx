"use client";

import { motion } from "framer-motion";
import type { Fill, Placeholder } from "@/lib/scrapbook/gallery";

/** Satu slot momen: kosong (tampil prompt) atau terisi (foto polaroid). */

const EASE = [0.16, 1, 0.3, 1] as const;
const ROT = [-3, 2, -2, 3];

function isDataUrl(s: string) {
  return s.startsWith("data:");
}

export function ChallengeSlot({
  placeholder,
  fill,
  index,
  onClick,
}: {
  placeholder: Placeholder;
  fill?: Fill;
  index: number;
  onClick: () => void;
}) {
  const rotate = ROT[index % 4];

  if (!fill) {
    return (
      <motion.div
        className="relative mx-auto"
        style={{ width: "min(38vw, 150px)" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.07 }}
      >
        <motion.button
          onClick={onClick}
          className="flex w-full cursor-pointer flex-col items-center justify-center px-3 text-center"
          style={{
            aspectRatio: "1 / 1.16",
            background: "rgba(251,246,232,0.4)",
            border: "2px dashed rgba(91,70,54,0.4)",
            borderRadius: 2,
          }}
          whileHover={{ scale: 1.04, background: "rgba(251,246,232,0.6)" }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none" style={{ opacity: 0.6 }}>
            <rect x="1" y="5" width="24" height="16" rx="2.5" stroke="#7A2D1C" strokeWidth="1.3" />
            <path d="M8 5l1.6-3h6.8L18 5" stroke="#7A2D1C" strokeWidth="1.3" strokeLinejoin="round" />
            <circle cx="13" cy="13" r="4.2" stroke="#7A2D1C" strokeWidth="1.3" />
          </svg>
          <span className="mt-2" style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#7A2D1C", lineHeight: 1.15 }}>
            {placeholder.prompt}
          </span>
          <span className="mt-1.5" style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9C8568" }}>
            + tempel
          </span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: "min(38vw, 150px)" }}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.07 }}
    >
      <motion.button
        onClick={onClick}
        className="relative block w-full cursor-pointer select-none"
        style={{
          rotate,
          background: "#FBF6E8",
          padding: 7,
          paddingBottom: 30,
          borderRadius: 2,
          boxShadow: "0 9px 22px -8px rgba(0,0,0,0.55)",
        }}
        whileHover={{ scale: 1.05, rotate: rotate * 0.3, zIndex: 5 }}
        whileTap={{ scale: 0.97 }}
      >
        <span
          className="pointer-events-none absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2"
          style={{
            transform: `translateX(-50%) rotate(${rotate}deg)`,
            background: `linear-gradient(rgba(255,255,255,0.25), transparent), ${
              index % 2 === 0 ? "rgba(228,154,144,0.7)" : "rgba(232,162,76,0.55)"
            }`,
            clipPath:
              "polygon(0 3px,3px 0,6px 3px,9px 0,12px 3px,15px 0,100% 0,100% 100%,15px 100%,12px calc(100% - 3px),9px 100%,6px calc(100% - 3px),3px 100%,0 calc(100% - 3px))",
          }}
        />
        <div className="relative aspect-square w-full overflow-hidden bg-night-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fill.photoUrl}
            alt={placeholder.prompt}
            loading={isDataUrl(fill.photoUrl) ? "lazy" : undefined}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.14), transparent 42%)" }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5 pt-1 text-center">
          <span
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 12.5,
              color: "#4A2C1E",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {fill.note || placeholder.prompt}
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}
