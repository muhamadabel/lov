"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const customEase = [0.16, 1, 0.3, 1] as const;

  const words = "God of 35".split(" ");

  // Track global scroll to animate elements out when scrolling down
  const { scrollYProgress } = useScroll();
  
  // Title fades and moves up first
  const yTitle = useTransform(scrollYProgress, [0, 0.1], [0, -150]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Scroll indicator fades out immediately
  const opacityIndicator = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: customEase }}
          style={{ y: yTitle, opacity: opacityTitle }}
          className="text-[120px] font-bold uppercase tracking-widest leading-none"
        >
          LOVIE
        </motion.h1>

        <div className="mt-4 flex space-x-3 text-[64px] font-light italic">
          {words.map((word, i) => {
            // Each word in the subtitle fades out one by one with a staggered scroll range
            const startScroll = 0.05 + i * 0.03;
            const endScroll = 0.15 + i * 0.03;
            
            // Note: calling hooks in loop is generally bad in React, but useTransform is fine if we do it carefully.
            // Actually, to obey Rules of Hooks, we shouldn't use useTransform in a map. 
            // Instead we'll calculate it inline or use a constant stagger offset.
            return (
              <Word 
                key={i} 
                word={word} 
                index={i} 
                scrollYProgress={scrollYProgress} 
                customEase={customEase} 
              />
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: opacityIndicator }}
        className="absolute bottom-12 flex justify-center w-full"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-cream opacity-60"
          style={{ backgroundColor: "var(--color-cream)" }}
        />
      </motion.div>
    </section>
  );
}

// Sub-component for individual words to obey Rules of Hooks
function Word({ word, index, scrollYProgress, customEase }: any) {
  const startScroll = 0.04 + index * 0.04;
  const endScroll = 0.12 + index * 0.04;
  
  const yOffset = useTransform(scrollYProgress, [startScroll, endScroll], [0, -150]);
  const opacity = useTransform(scrollYProgress, [startScroll, endScroll - 0.02], [1, 0]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.2,
        delay: 0.8 + index * 0.15,
        ease: customEase,
      }}
      style={{ y: yOffset, opacity }}
    >
      {word}
    </motion.span>
  );
}
