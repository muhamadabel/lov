"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RomanticBackground } from "@/components/scrapbook/RomanticBackground";
import { Book3D } from "@/components/scrapbook/Book3D";
import { ChallengeSlot } from "@/components/scrapbook/space/ChallengeSlot";
import { FulfillDialog } from "@/components/scrapbook/space/FulfillDialog";
import { HeartGauge } from "@/components/scrapbook/space/HeartGauge";
import { ManagePanel } from "@/components/scrapbook/space/ManagePanel";
import { isSpaceUnlocked } from "@/lib/scrapbook/auth";
import {
  fillKey,
  useSpace,
  type Fill,
  type GallerySide,
  type Placeholder,
} from "@/lib/scrapbook/gallery";

const EASE = [0.16, 1, 0.3, 1] as const;
const PER_PAGE = 4;
const SIDE_LABEL: Record<GallerySide, string> = { vie: "Vie", abel: "Abel" };

type Active = { side: GallerySide; placeholder: Placeholder } | null;

export default function SpacePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const { placeholders, byKey, loaded, error, refresh, doneFor, ratio, perSide } = useSpace();

  const [active, setActive] = useState<Active>(null);
  const [managing, setManaging] = useState(false);

  // Pastikan latar gelap edge-to-edge (globals.css bikin body crimson untuk halaman utama)
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.background;
    const prevBody = document.body.style.background;
    html.style.background = "#0E0100";
    document.body.style.background = "#0E0100";
    return () => {
      html.style.background = prevHtml;
      document.body.style.background = prevBody;
    };
  }, []);

  useEffect(() => {
    if (!isSpaceUnlocked()) {
      router.replace("/");
      return;
    }
    setReady(true);
    if (sessionStorage.getItem("lovie_intro_seen") === "1") {
      setIntro(false);
      return;
    }
    const mobile = window.innerWidth < 768;
    const t = setTimeout(() => setIntro(false), mobile ? 2400 : 3000);
    return () => clearTimeout(t);
  }, [router]);

  const pages: React.ReactNode[] = useMemo(() => {
    const out: React.ReactNode[] = [];
    out.push(<DedicationPage key="dedi" />);
    out.push(...buildSide("vie", placeholders, byKey, doneFor("vie"), (side, p) => setActive({ side, placeholder: p })));
    out.push(...buildSide("abel", placeholders, byKey, doneFor("abel"), (side, p) => setActive({ side, placeholder: p })));
    out.push(
      <HeartPage key="heart" ratio={ratio} viedone={doneFor("vie")} abeldone={doneFor("abel")} per={perSide} />
    );
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders, byKey, ratio, perSide]);

  if (!ready || !loaded) {
    return <div className="fixed inset-0" style={{ background: "#0E0100" }} />;
  }

  if (error) {
    return (
      <main className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: "#0E0100" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, color: "#FFF7D3" }}>
          bukunya lagi nyambung ke database…
        </p>
        <p className="max-w-sm" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,247,211,0.5)", lineHeight: 1.7 }}>
          kalau ini muncul terus, berarti DATABASE_URL belum diisi di .env.local (atau koneksinya bermasalah).
        </p>
        <button
          onClick={() => refresh()}
          className="mt-2 rounded-full border border-white/20 px-5 py-2 text-cream/80"
          style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          coba lagi
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden" style={{ background: "#0E0100" }}>
      <RomanticBackground variant="vie" />

      {/* tombol kelola (admin) */}
      <button
        onClick={() => setManaging(true)}
        aria-label="kelola momen"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cream/70 backdrop-blur-md transition hover:bg-white/10"
        title="kelola momen"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-24">
        <Book3D title="Collection Book" pages={pages} />
      </div>

      <AnimatePresence>
        {intro && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: "#0E0100" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <motion.p
              className="px-8 text-center"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, color: "#FFF7D3" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3, times: [0, 0.25, 0.7, 1] }}
            >
              ada sebuah ruang kecil buat kita…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <FulfillDialog
            placeholder={active.placeholder}
            side={active.side}
            existing={byKey.get(fillKey(active.side, active.placeholder.id))}
            onClose={() => setActive(null)}
            onDone={() => {
              setActive(null);
              refresh();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managing && <ManagePanel onClose={() => setManaging(false)} />}
      </AnimatePresence>
    </main>
  );
}

// ---------------- builder per sisi ----------------

function buildSide(
  side: GallerySide,
  placeholders: Placeholder[],
  byKey: Map<string, Fill>,
  done: number,
  onOpen: (side: GallerySide, p: Placeholder) => void
): React.ReactNode[] {
  const pages: React.ReactNode[] = [];
  const count = Math.max(1, placeholders.length); // minimal 1 halaman walau kosong
  for (let i = 0; i < count; i += PER_PAGE) {
    const chunk = placeholders.slice(i, i + PER_PAGE);
    pages.push(
      <SidePage key={`${side}-${i}`} side={side} showHeader={i === 0} done={done} total={placeholders.length}>
        {chunk.map((p, j) => (
          <ChallengeSlot
            key={p.id}
            placeholder={p}
            fill={byKey.get(fillKey(side, p.id))}
            index={i + j}
            onClick={() => onOpen(side, p)}
          />
        ))}
      </SidePage>
    );
  }
  return pages;
}

function SidePage({
  side,
  showHeader,
  done,
  total,
  children,
}: {
  side: GallerySide;
  showHeader: boolean;
  done: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col px-6 py-7">
      {showHeader && (
        <div className="mb-4">
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 27, color: "#4A2C1E" }}>
            {SIDE_LABEL[side]}
          </h3>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C8568" }}>
            {side === "vie" ? "punya kamu" : "punya aku"} · {done}/{total} keisi
          </p>
        </div>
      )}
      <div className="grid flex-1 grid-cols-2 content-center gap-x-3 gap-y-5">{children}</div>
    </div>
  );
}

// ---------------- pembuka & penutup ----------------

function DedicationPage() {
  const segs = ["Collection Book.", "Pelan-pelan aja ngisinya —", "satu foto tiap ada momennya."];
  return (
    <div className="flex h-full flex-col justify-center px-8">
      {segs.map((s, i) => (
        <motion.span
          key={i}
          className="block"
          style={{ fontFamily: "var(--font-hand)", fontSize: 21, color: "#4A2C1E" }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.25, ease: EASE }}
        >
          {s}
        </motion.span>
      ))}
      <p className="mt-6" style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#7A2D1C" }}>
        balik halamannya →
      </p>
    </div>
  );
}

function HeartPage({
  ratio,
  viedone,
  abeldone,
  per,
}: {
  ratio: number;
  viedone: number;
  abeldone: number;
  per: number;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <HeartGauge
        ratio={ratio}
        label={
          <span style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#9C8568" }}>
            Vie {viedone}/{per} · Abel {abeldone}/{per}
          </span>
        }
      />
    </div>
  );
}
