"use client";

import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Buku 3D dengan PAGE-TURN KERTAS ASLI.
 * Sampul tertutup bersegel → tap segel → patah → cover flip → halaman bisa dibalik.
 * Balik halaman = satu lembar (leaf) terangkat dari pinggir, berputar di tulang buku
 * (transform-origin = spine), muka depan & belakang terlihat (backface-visibility),
 * halaman di bawahnya tersingkap. Bisa di-drag dari pinggir halaman atau klik sudut.
 * Theming via CSS var (--book-leather-1/2/3, --book-foil).
 */

const HEAVY = [0.45, 0.05, 0.2, 0.95] as const;

type Phase = "sealed" | "opening" | "open";

interface Book3DProps {
  title: string;
  pages: React.ReactNode[];
}

declare global {
  interface Window {
    DeviceOrientationEvent: typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
  }
}

const PAGE_W = 420;
const PAGE_H = 560;

export function Book3D({ title, pages }: Book3DProps) {
  const [mounted, setMounted] = useState(false);
  const [cols, setCols] = useState(2);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [reduce, setReduce] = useState(false);

  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<{ dir: 1 | -1 } | null>(null);
  const prog = useMotionValue(0); // 0..1 progres balik halaman
  const flipping = useRef(false);

  const totalSpreads = cols === 2 ? Math.ceil(pages.length / 2) : pages.length;

  // tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18, mass: 0.6 });

  useEffect(() => {
    setMounted(true);
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const setResp = () => setCols(window.innerWidth < 768 ? 1 : 2);
    setResp();
    if (sessionStorage.getItem("lovie_intro_seen") === "1") {
      setPhase("open");
      const last = parseInt(sessionStorage.getItem("lovie_last_spread") || "0", 10);
      if (!Number.isNaN(last)) setSpread(last);
    }
    window.addEventListener("resize", setResp);
    return () => window.removeEventListener("resize", setResp);
  }, []);

  useEffect(() => {
    if (phase === "open") sessionStorage.setItem("lovie_last_spread", String(spread));
  }, [spread, phase]);

  // tilt pointer / gyro
  useEffect(() => {
    if (!mounted || reduce) return;
    const mobile = window.innerWidth < 768;
    let betaZero: number | null = null;
    const onPointer = (e: PointerEvent) => {
      ry.set((e.clientX / window.innerWidth - 0.5) * 12);
      rx.set(-(e.clientY / window.innerHeight - 0.5) * 8);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (betaZero == null) betaZero = e.beta;
      ry.set(Math.max(-8, Math.min(8, (e.gamma / 30) * 8)));
      rx.set(Math.max(-6, Math.min(6, ((e.beta - betaZero) / 30) * 6)));
    };
    if (mobile) window.addEventListener("deviceorientation", onOrient);
    else window.addEventListener("pointermove", onPointer);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [mounted, reduce, rx, ry]);

  const openBook = useCallback(() => {
    if (phase !== "sealed") return;
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") DOE.requestPermission().catch(() => {});
    setPhase("opening");
    setTimeout(() => {
      setPhase("open");
      sessionStorage.setItem("lovie_intro_seen", "1");
    }, reduce ? 400 : 1450);
  }, [phase, reduce]);

  // ---- mekanik balik halaman ----
  const getPage = (i: number) => (i >= 0 && i < pages.length ? pages[i] : null);

  const commitFlip = useCallback(
    (dir: 1 | -1) => {
      setSpread((s) => s + dir);
      setFlip(null);
      prog.set(0);
      flipping.current = false;
    },
    [prog]
  );

  const animateFlip = useCallback(
    (dir: 1 | -1, from = 0) => {
      flipping.current = true;
      setFlip({ dir });
      animate(prog, 1, {
        duration: reduce ? 0.45 : 1.0 * (1 - from),
        ease: HEAVY,
        onComplete: () => commitFlip(dir),
      });
    },
    [prog, reduce, commitFlip]
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      if (flipping.current) return;
      const next = spread + dir;
      if (next < 0 || next >= totalSpreads) return;
      animateFlip(dir);
    },
    [spread, totalSpreads, animateFlip]
  );

  const cancelFlip = useCallback(() => {
    animate(prog, 0, {
      duration: 0.4,
      ease: "easeOut",
      onComplete: () => {
        setFlip(null);
        flipping.current = false;
      },
    });
  }, [prog]);

  // keyboard
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, go]);

  if (!mounted) return null;

  const bookW = cols === 2 ? PAGE_W * 2 : undefined;

  // indeks halaman menurut model
  let baseLeft: number, baseRight: number, leafFront: number, leafBack: number;
  if (cols === 2) {
    if (flip?.dir === 1) {
      baseLeft = 2 * spread;
      baseRight = 2 * spread + 3; // tersingkap di bawah leaf
      leafFront = 2 * spread + 1;
      leafBack = 2 * spread + 2;
    } else if (flip?.dir === -1) {
      baseLeft = 2 * spread - 2; // tersingkap
      baseRight = 2 * spread + 1;
      leafFront = 2 * spread;
      leafBack = 2 * spread - 1;
    } else {
      baseLeft = 2 * spread;
      baseRight = 2 * spread + 1;
      leafFront = -99;
      leafBack = -99;
    }
  } else {
    // mobile: satu halaman
    if (flip?.dir === 1) {
      baseLeft = spread + 1; // halaman berikutnya tersingkap
      baseRight = -99;
      leafFront = spread;
      leafBack = spread + 1;
    } else if (flip?.dir === -1) {
      baseLeft = spread - 1;
      baseRight = -99;
      leafFront = spread;
      leafBack = spread - 1;
    } else {
      baseLeft = spread;
      baseRight = -99;
      leafFront = -99;
      leafBack = -99;
    }
  }

  return (
    <div
      className="relative flex w-full items-center justify-center"
      style={{ perspective: cols === 2 ? 2000 : 1200, perspectiveOrigin: "50% 42%" }}
    >
      {/* bayangan bernapas */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2"
        style={{
          width: cols === 2 ? bookW! * 0.82 : "72vw",
          height: 42,
          marginTop: PAGE_H * 0.46,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          filter: "blur(26px)",
        }}
        animate={reduce ? {} : { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        style={{
          transformStyle: "preserve-3d",
          rotateX: srx,
          rotateY: sry,
          width: cols === 2 ? bookW : "min(92vw, 410px)",
          aspectRatio: cols === 2 ? `${bookW} / ${PAGE_H}` : "410 / 558",
        }}
        initial={false}
        animate={phase === "open" ? { scale: 1.02, y: "-1.5vh" } : { scale: 0.94, y: 0 }}
        transition={{ duration: reduce ? 0.3 : 1, ease: HEAVY }}
      >
        {/* ====== HALAMAN ====== */}
        {phase !== "sealed" && (
          <div
            className="absolute inset-0 flex overflow-hidden rounded-r-[10px] rounded-l-[5px]"
            style={{
              transformStyle: "preserve-3d",
              boxShadow:
                "-26px 46px 80px -22px rgba(0,0,0,0.62), 0 0 120px -30px rgba(255,170,100,0.16)",
            }}
          >
            {/* halaman dasar kiri */}
            <Sheet side="left" single={cols === 1}>
              {getPage(baseLeft)}
            </Sheet>
            {/* halaman dasar kanan (desktop) */}
            {cols === 2 && (
              <Sheet side="right" single={false}>
                {getPage(baseRight)}
              </Sheet>
            )}

            {/* spine shadow */}
            {cols === 2 && (
              <div
                className="pointer-events-none absolute top-0 z-[2] h-full"
                style={{
                  left: "50%",
                  width: 64,
                  transform: "translateX(-50%)",
                  background:
                    "linear-gradient(90deg, transparent, rgba(60,30,10,0.32) 46%, rgba(60,30,10,0.42) 50%, rgba(60,30,10,0.32) 54%, transparent)",
                }}
              />
            )}

            {/* ===== LEAF yang berputar ===== */}
            {flip && (
              <Leaf
                cols={cols}
                dir={flip.dir}
                prog={prog}
                front={getPage(leafFront)}
                back={getPage(leafBack)}
              />
            )}

            {/* zona tarik pinggir + klik sudut */}
            {phase === "open" && !flip && (
              <>
                <EdgeZone
                  side="right"
                  cols={cols}
                  disabled={spread >= totalSpreads - 1}
                  pageW={cols === 2 ? PAGE_W : 410}
                  onStart={() => setFlip({ dir: 1 })}
                  prog={prog}
                  onRelease={(commit, from) => (commit ? animateFlip(1, from) : cancelFlip())}
                />
                <EdgeZone
                  side="left"
                  cols={cols}
                  disabled={spread <= 0}
                  pageW={cols === 2 ? PAGE_W : 410}
                  onStart={() => setFlip({ dir: -1 })}
                  prog={prog}
                  onRelease={(commit, from) => (commit ? animateFlip(-1, from) : cancelFlip())}
                />
              </>
            )}
          </div>
        )}

        {/* ====== COVER ====== */}
        {phase !== "open" && (
          <motion.div
            key="cover"
            onClick={phase === "sealed" ? openBook : undefined}
            className="absolute inset-0 origin-left cursor-pointer overflow-hidden rounded-r-[6px] rounded-l-[3px]"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              zIndex: 20,
              background: "linear-gradient(135deg, #9d978c, #8a847a 55%, #75706700)",
              backgroundColor: "#827d74",
            }}
            initial={false}
            animate={{ rotateY: phase === "opening" ? -180 : 0 }}
            transition={{ duration: reduce ? 0.5 : 1.4, ease: HEAVY }}
          >
            <CoverFace title={title} />
            {phase === "opening" && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.4))" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        )}
      </motion.div>

      {phase === "sealed" && (
        <motion.p
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-cream/55"
          style={{ fontFamily: "var(--font-body)" }}
          animate={{ opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          ketuk buat buka
        </motion.p>
      )}

      {phase === "open" && (
        <BookNav
          spread={spread}
          total={totalSpreads}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      )}
    </div>
  );
}

// ---------------- Sheet (halaman kertas) ----------------

function Sheet({
  side,
  single,
  children,
}: {
  side: "left" | "right";
  single: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative h-full"
      style={{ width: single ? "100%" : "50%", contentVisibility: "auto" }}
    >
      <PaperSurface side={side} />
      <div className="relative z-10 h-full w-full">{children ?? <EmptyLeaf />}</div>
    </div>
  );
}

function PaperSurface({ side }: { side: "left" | "right" }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            side === "left"
              ? "linear-gradient(90deg, #E9DAB6, #F2E6C9 16%)"
              : "linear-gradient(270deg, #E9DAB6, #F2E6C9 16%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 23px, rgba(91,70,54,0.022) 23px 24px)",
        }}
      />
    </>
  );
}

// ---------------- Leaf (lembar yang berputar) ----------------

function Leaf({
  cols,
  dir,
  prog,
  front,
  back,
}: {
  cols: number;
  dir: 1 | -1;
  prog: import("framer-motion").MotionValue<number>;
  front: React.ReactNode;
  back: React.ReactNode;
}) {
  const forward = dir === 1;
  // rotateY: forward 0→-180 (origin kiri/spine), backward 0→+180 (origin kanan/spine)
  const rotateY = useTransform(prog, [0, 1], [0, forward ? -180 : 180]);
  // bayangan kertas saat menekuk
  const shade = useTransform(prog, (p) => Math.sin(p * Math.PI) * 0.5);
  // bayangan jatuh ke halaman di bawahnya
  const castX = useTransform(prog, [0, 1], forward ? [0, -40] : [0, 40]);

  const half = cols === 2 ? "50%" : "100%";
  const pos =
    cols === 2
      ? forward
        ? { right: 0 }
        : { left: 0 }
      : { left: 0 };

  return (
    <>
      {/* bayangan cast di halaman bawah */}
      <motion.div
        className="pointer-events-none absolute top-0 z-[6] h-full"
        style={{
          width: half,
          ...(cols === 2 ? (forward ? { right: 0 } : { left: 0 }) : { left: 0 }),
          x: castX,
          opacity: shade,
          background: forward
            ? "linear-gradient(90deg, rgba(20,10,2,0.5), transparent 60%)"
            : "linear-gradient(270deg, rgba(20,10,2,0.5), transparent 60%)",
        }}
      />
      <motion.div
        className="absolute top-0 z-[8] h-full"
        style={{
          width: half,
          ...pos,
          transformStyle: "preserve-3d",
          transformOrigin: forward ? "left center" : "right center",
          rotateY,
        }}
      >
        {/* muka depan */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <PaperSurface side={forward ? "right" : "left"} />
          <div className="relative z-10 h-full w-full">{front ?? <EmptyLeaf />}</div>
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: shade,
              background: forward
                ? "linear-gradient(90deg, rgba(30,15,4,0), rgba(30,15,4,0.55))"
                : "linear-gradient(270deg, rgba(30,15,4,0), rgba(30,15,4,0.55))",
            }}
          />
        </div>
        {/* muka belakang */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <PaperSurface side={forward ? "left" : "right"} />
          <div className="relative z-10 h-full w-full">{back ?? <EmptyLeaf />}</div>
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: shade,
              background: forward
                ? "linear-gradient(270deg, rgba(30,15,4,0), rgba(30,15,4,0.4))"
                : "linear-gradient(90deg, rgba(30,15,4,0), rgba(30,15,4,0.4))",
            }}
          />
        </div>
      </motion.div>
    </>
  );
}

// ---------------- Edge zone (tarik / klik untuk balik) ----------------

function EdgeZone({
  side,
  cols,
  disabled,
  pageW,
  onStart,
  prog,
  onRelease,
}: {
  side: "left" | "right";
  cols: number;
  disabled: boolean;
  pageW: number;
  onStart: () => void;
  prog: import("framer-motion").MotionValue<number>;
  onRelease: (commit: boolean, from: number) => void;
}) {
  const dragging = useRef(false);
  const startX = useRef(0);
  if (disabled) return null;

  const width = cols === 2 ? pageW : Math.min(window.innerWidth * 0.92, 410);

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startX.current = e.clientX;
    onStart();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const p = side === "right" ? -dx / width : dx / width;
    prog.set(Math.max(0, Math.min(1, p)));
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    const p = side === "right" ? -dx / width : dx / width;
    onRelease(p > 0.4, Math.max(0, Math.min(1, p)));
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="group absolute top-0 z-[12] h-full cursor-grab touch-none active:cursor-grabbing"
      style={{ width: 40, [side]: 0 }}
      aria-label={side === "right" ? "balik ke halaman berikutnya" : "balik ke halaman sebelumnya"}
    >
      {/* hint curl di sudut bawah */}
      <span
        className="absolute bottom-0 h-16 w-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          [side]: 0,
          background:
            side === "right"
              ? "linear-gradient(225deg, rgba(228,212,174,0.95), transparent 62%)"
              : "linear-gradient(135deg, rgba(228,212,174,0.95), transparent 62%)",
          clipPath:
            side === "right"
              ? "polygon(100% 0, 100% 100%, 0 100%)"
              : "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />
    </div>
  );
}

// ---------------- Cover & seal ----------------

function CoverFace({ title }: { title: string }) {
  return (
    <div className="relative h-full w-full">
      {/* serat kain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* tepi agak gelap */}
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 70px rgba(0,0,0,0.28)" }} />
      {/* highlight lembut */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.10) 0%, transparent 36%)" }}
      />

      {/* label perpustakaan yang nempel */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(62%, 240px)" }}
      >
        <div className="relative" style={{ transform: "rotate(-1.4deg)" }}>
          {/* selotip dua sudut */}
          {[
            { left: -10, top: -8, rot: -34 },
            { right: -10, top: -8, rot: 34 },
          ].map((t, i) => (
            <span
              key={i}
              className="absolute h-[18px] w-[56px]"
              style={{
                ...t,
                transform: `rotate(${t.rot}deg)`,
                background: "linear-gradient(rgba(255,255,255,0.3), transparent), rgba(214,205,186,0.65)",
              }}
            />
          ))}
          <div
            className="relative px-5 py-6 text-center"
            style={{ background: "#ece6d8", boxShadow: "0 8px 18px -10px rgba(0,0,0,0.55)" }}
          >
            <div className="mx-auto mb-2 h-px w-10" style={{ background: "rgba(74,70,63,0.4)" }} />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(74,70,63,0.55)",
              }}
            >
              {title}
            </p>
            <div className="mx-auto mt-2 h-px w-10" style={{ background: "rgba(74,70,63,0.4)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookNav({
  spread,
  total,
  onPrev,
  onNext,
}: {
  spread: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-4">
      <button
        aria-label="sebelumnya"
        onClick={onPrev}
        disabled={spread <= 0}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition disabled:opacity-20"
      >
        ‹
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === spread ? 16 : 6, background: i === spread ? "var(--book-foil, #D9A441)" : "rgba(255,247,211,0.3)" }}
          />
        ))}
      </div>
      <button
        aria-label="berikutnya"
        onClick={onNext}
        disabled={spread >= total - 1}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition disabled:opacity-20"
      >
        ›
      </button>
    </div>
  );
}

function EmptyLeaf() {
  return <div className="h-full w-full" />;
}
