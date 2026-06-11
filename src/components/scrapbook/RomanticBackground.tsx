"use client";

import { useEffect, useRef } from "react";

/**
 * "Kamar Baca Tengah Malam" — pengganti vanta fog.
 * L0 dasar ruangan (CSS) · L1 nyala lilin (CSS var di-drive rAF) · L2 berkas cahaya (CSS, parallax)
 * · L3 debu & bara (canvas 2D) · L4 vignette · L5 grain.
 * Satu rAF loop 30fps, governor adaptif, pause saat hidden, dim saat "lovie:sheet".
 * Lihat scrapbook-design.md §7.1.
 */

type Variant = "vie" | "abel";

interface Dust {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  aBase: number;
  aAmp: number;
  aFreq: number;
  aPhase: number;
}
interface Ember {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
}

function isMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export function RomanticBackground({ variant = "vie" }: { variant?: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const candle = candleRef.current;
    const beam = beamRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = isMobile();
    const variantScale = variant === "abel" ? 0.6 : 1;

    let DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = window.innerWidth;
    let H = window.innerHeight;

    // ---- Sprite bara (pre-render sekali, tanpa shadowBlur per frame) ----
    const emberSprite = document.createElement("canvas");
    emberSprite.width = emberSprite.height = 24;
    const sctx = emberSprite.getContext("2d")!;
    const grad = sctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, "rgba(255,200,107,0.95)");
    grad.addColorStop(0.4, "rgba(255,179,107,0.5)");
    grad.addColorStop(1, "rgba(255,179,107,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 24, 24);

    // ---- Partikel ----
    let dustCount = Math.round((mobile ? 24 : 60) * variantScale);
    let emberCount = Math.round((mobile ? 4 : 8) * variantScale);
    const dust: Dust[] = [];
    const embers: Ember[] = [];

    // poligon berkas L2 (untuk bias spawn debu) — kira-kira pita miring kiri-atas
    const inBeam = (x: number, y: number) => {
      const nx = x / W;
      const ny = y / H;
      return nx < 0.5 && ny < 0.4 + nx * 0.8;
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const spawnDust = (d: Dust, atBottom: boolean) => {
      const biasBeam = Math.random() < 0.7;
      d.x = biasBeam ? rnd(0, W * 0.5) : rnd(0, W);
      d.y = atBottom ? H + rnd(0, 40) : rnd(0, H);
      if (biasBeam && !inBeam(d.x, d.y)) d.x = rnd(0, W * 0.45);
      d.r = rnd(0.5, 2.2);
      d.vx = rnd(-2, 4);
      d.vy = rnd(-18, -6);
      d.aBase = rnd(0.05, 0.45);
      d.aAmp = rnd(0.04, 0.2);
      d.aFreq = rnd(1 / 7, 1 / 3) * Math.PI * 2;
      d.aPhase = rnd(0, Math.PI * 2);
    };
    for (let i = 0; i < dustCount; i++) {
      const d = {} as Dust;
      spawnDust(d, false);
      dust.push(d);
    }
    const spawnEmber = (e: Ember) => {
      e.x = rnd(W * 0.6, W);
      e.y = H - rnd(0, H * 0.35);
      e.r = rnd(2, 3.5);
      e.vx = rnd(-3, 1);
      e.vy = rnd(-26, -10);
      e.a = rnd(0.4, 0.9);
    };
    for (let i = 0; i < emberCount; i++) {
      const e = {} as Ember;
      spawnEmber(e);
      embers.push(e);
    }

    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    let ro: ResizeObserver | null = null;
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    };
    const RO = window.ResizeObserver;
    if (typeof RO === "function") {
      ro = new RO(onResize);
      ro.observe(document.documentElement);
    } else {
      window.addEventListener("resize", onResize);
    }

    // ---- Parallax pointer / gyro ----
    let pTarget = 0,
      pTargetY = 0;
    let pX = 0,
      pY = 0;
    let betaZero: number | null = null;

    const onPointer = (e: PointerEvent) => {
      pTarget = e.clientX / W - 0.5;
      pTargetY = e.clientY / H - 0.5;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      if (betaZero == null) betaZero = e.beta;
      pTarget = Math.max(-1, Math.min(1, e.gamma / 30)) * 0.5;
      pTargetY = Math.max(-1, Math.min(1, (e.beta - betaZero) / 30)) * 0.5;
    };
    if (!reduce) {
      if (mobile) window.addEventListener("deviceorientation", onOrient);
      else window.addEventListener("pointermove", onPointer);
    }

    // ---- Loop control ----
    let raf = 0;
    let last = performance.now();
    const FRAME = 1000 / 30;
    let acc = 0;
    let t = 0;

    // governor adaptif
    const samples: number[] = [];
    let lastSampleAt = last;
    let degraded = false;

    let sheetOpen = false;
    const onSheet = (ev: Event) => {
      const open = (ev as CustomEvent).detail?.open;
      sheetOpen = !!open;
      if (sheetOpen) {
        // gambar 1 frame statis ter-dim lalu hentikan loop
        cancelAnimationFrame(raf);
        raf = 0;
        drawStatic(0.5);
      } else if (!raf && !document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("lovie:sheet", onSheet as EventListener);

    const drawDust = (dimAlpha = 1) => {
      for (const d of dust) {
        const a = (d.aBase + d.aAmp * Math.sin(t * d.aFreq + d.aPhase)) * dimAlpha;
        ctx.fillStyle = `rgba(255,214,138,${Math.max(0, a).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const drawEmbers = (dimAlpha = 1) => {
      if (degraded) return;
      for (const e of embers) {
        ctx.globalAlpha = e.a * dimAlpha;
        ctx.drawImage(emberSprite, e.x - 12, e.y - 12, 24, 24);
      }
      ctx.globalAlpha = 1;
    };

    const drawStatic = (dim: number) => {
      ctx.clearRect(0, 0, W, H);
      drawDust(dim);
      drawEmbers(dim);
    };

    // flicker lilin triple-sinus → CSS var
    const applyCandle = () => {
      const i =
        1 +
        0.06 * Math.sin(1.1 * t) +
        0.035 * Math.sin(2.7 * t + 1.3) +
        0.02 * Math.sin(5.3 * t + 4.1);
      if (candle) {
        candle.style.opacity = String(0.75 * i);
        const shift = 4 * Math.sin(t * 0.4 * Math.PI * 2);
        candle.style.transform = `translate(${shift.toFixed(2)}px, 0)`;
      }
    };

    const step = (dt: number) => {
      t += dt / 1000;
      // partikel
      for (const d of dust) {
        d.x += (d.vx + pX * 18) * (dt / 1000);
        d.y += d.vy * (dt / 1000);
        if (d.y < -10 || d.x < -10 || d.x > W + 10) spawnDust(d, true);
      }
      if (!degraded) {
        for (const e of embers) {
          e.x += e.vx * (dt / 1000);
          e.y += e.vy * (dt / 1000);
          e.a -= 0.04 * (dt / 1000);
          if (e.y < H * 0.4 || e.a <= 0.05) spawnEmber(e);
        }
      }
      // parallax lerp
      pX += (pTarget - pX) * 0.06;
      pY += (pTargetY - pY) * 0.06;
      if (beam) {
        beam.style.transform = `translate(${(pX * 18).toFixed(2)}px, ${(pY * 10).toFixed(2)}px)`;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      drawDust();
      drawEmbers();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      let dt = now - last;
      last = now;
      if (dt > 50) dt = 50; // clamp resume
      acc += dt;
      if (acc < FRAME) return;
      const frameDt = acc;
      acc = 0;

      step(frameDt);
      applyCandle();
      draw();

      // governor: ukur tiap 2s
      samples.push(frameDt);
      if (now - lastSampleAt >= 2000) {
        const avg = samples.reduce((s, v) => s + v, 0) / Math.max(1, samples.length);
        samples.length = 0;
        lastSampleAt = now;
        if (!degraded && avg > 24) {
          governorHits++;
          if (governorHits >= 3) {
            degraded = true;
            dust.length = Math.max(8, Math.round(dust.length * 0.7));
          }
        } else {
          governorHits = 0;
        }
      }
    };
    let governorHits = 0;

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!sheetOpen && !reduce) {
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      // statis: gambar sekali, tanpa animasi
      applyCandle();
      draw();
      if (candle) candle.style.opacity = "0.75";
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("lovie:sheet", onSheet as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
      window.clearTimeout(resizeTimer);
    };
  }, [variant]);

  const baseCenter = variant === "abel" ? "#33100A" : "#2A0301";
  const candlePos = isMobileSSRSafe() ? "50% 92%" : variant === "abel" ? "50% 88%" : "78% 86%";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: "layout paint" }}
    >
      {/* L0 — dasar ruangan */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 32%, ${baseCenter} 0%, #1A0201 55%, #0E0100 100%)`,
        }}
      />
      {/* L1 — nyala lilin */}
      <div
        ref={candleRef}
        className="absolute inset-0"
        style={{
          opacity: 0.75,
          background: `radial-gradient(46vw 36vw at ${candlePos}, rgba(255,158,94,0.22) 0%, rgba(171,21,9,0.10) 45%, transparent 72%)${
            variant === "abel"
              ? ", radial-gradient(30vw 24vw at 50% 96%, rgba(255,179,107,0.12) 0%, transparent 70%)"
              : ""
          }`,
          willChange: "opacity, transform",
        }}
      />
      {/* L2 — berkas cahaya volumetrik */}
      <div ref={beamRef} className="absolute inset-0" style={{ willChange: "transform" }}>
        <div
          className="absolute"
          style={{
            top: "-15vh",
            left: "8vw",
            width: "38vw",
            height: "130vh",
            transform: "rotate(28deg)",
            background:
              "linear-gradient(180deg, rgba(255,196,128,0.15), rgba(255,196,128,0.05) 55%, transparent)",
            filter: "blur(34px)",
            mixBlendMode: "screen",
            borderRadius: "50% / 12%",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "-15vh",
            left: "18vw",
            width: "14vw",
            height: "130vh",
            transform: "rotate(24deg)",
            opacity: 0.08,
            background:
              "linear-gradient(180deg, rgba(255,196,128,0.18), transparent 60%)",
            filter: "blur(30px)",
            mixBlendMode: "screen",
            borderRadius: "50% / 12%",
          }}
        />
      </div>
      {/* L3 — debu & bara */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* L4 — vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 110% at 50% 45%, transparent 55%, rgba(10,1,0,0.55) 100%)",
        }}
      />
      {/* L5 — grain (desktop saja) */}
      <div className="absolute inset-0 hidden md:block" style={grainStyle} />
    </div>
  );
}

// Aman dipanggil saat render (SSR akan false; di-correct oleh CSS responsif tidak perlu di sini)
function isMobileSSRSafe() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

const grainStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
  backgroundSize: "240px",
  opacity: 0.05,
  mixBlendMode: "overlay",
};
