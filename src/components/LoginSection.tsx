"use client";

import { useState } from "react";
import { GlowingShadow } from "./GlowingButton";
import Image from "next/image";
import bgImage from "@/gambar/bga.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/scrapbook/auth";

const WELCOME: Record<string, { title: string; subtitle: string }> = {
  "/farewell": { title: "Welcome, Vie.", subtitle: "Jangan cengeng yaww" },
  "/space": { title: "Welcome.", subtitle: "Sabar tunggu…" },
};

export function LoginSection() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [unlockedRoute, setUnlockedRoute] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = () => {
    const result = authenticate(name, password);
    if (result) {
      setUnlockedRoute(result.route);
      setError(false);

      // Redirect setelah sedikit delay
      setTimeout(() => {
        router.push(result.route);
      }, 2500);
    } else {
      setError(true);
    }
  };

  const welcome = unlockedRoute ? WELCOME[unlockedRoute] ?? WELCOME["/farewell"] : null;

  return (
    <section
      className="fixed bottom-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden z-0"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={bgImage}
          alt="Login Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        {/* Dark overlay to make form stand out */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          {!welcome ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              className="flex flex-col w-full gap-6 items-center"
            >
              <div className="w-full flex flex-col gap-6 bg-[rgba(20,0,0,0.4)] p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
                <div className="flex flex-col gap-2">
                  <label className="text-[#FFF7D3]/80 text-sm font-medium tracking-widest uppercase">Nama</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-[#FFF7D3] outline-none focus:border-[#AB1509] focus:bg-white/10 transition-all font-body w-full shadow-inner"
                    placeholder="Masukkan nama..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#FFF7D3]/80 text-sm font-medium tracking-widest uppercase">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-[#FFF7D3] outline-none focus:border-[#AB1509] focus:bg-white/10 transition-all font-body w-full shadow-inner"
                    placeholder="Masukkan password..."
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#ff4d4d] text-sm text-center mt-1 italic font-light drop-shadow-md"
                  >
                    Nama atau password salah.
                  </motion.p>
                )}

                <div className="mt-4 w-full">
                  <GlowingShadow onClick={handleLogin}>
                    <span className="text-[#FFF7D3] tracking-widest uppercase text-xl font-bold">LOGIN</span>
                  </GlowingShadow>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center flex flex-col items-center"
            >
              <h2 className="text-5xl md:text-7xl font-display text-[#FFF7D3] mb-6">{welcome.title}</h2>
              <p className="text-xl text-[#FFF7D3]/80 italic font-light max-w-lg text-center leading-relaxed">
                {welcome.subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
