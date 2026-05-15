"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function PlaylistSection() {
  const [isOpen, setIsOpen] = useState(false);

  const paragraphs = [
    <span key="1">
      Ada satu momen yang aku tidak akan pernah bisa jelaskan dengan sempurna. Dia membuatkan aku sebuah playlist. Bukan hal yang besar di mata orang laim. tapi bagiku, itu adalah <strong className="text-[#FFF7D3] font-semibold opacity-100">sesuatu yang belum pernah ada yang lakukan sebelumnya</strong>. Dia memilih lagu satu per satu, menyusunnya dengan cara yang entah bagaimana terasa seperti dia sedang bercerita tentang aku, tentang dia, tentang sesuatu yang belum sempat kami beri nama.
    </span>,
    <span key="2">
      Aku tidak tahu kapan tepatnya pandanganku berubah. Tapi aku tahu itu dimulai dari sini, dari playlist ini. Dari cara dia diam-diam bilang <strong className="text-[#FFF7D3] font-semibold opacity-100 italic">"aku memperhatikanmu"</strong> lewat sesuatu yang tidak membutuhkan kata-kata.
    </span>,
    <span key="3">
      Selama ini aku tidak pernah benar-benar tahu rasanya dihargai dengan cara yang tulus. Dihargai bukan karena aku memenuhi syarat tertentu, bukan karena aku diam dan menurut . tapi <strong className="text-[#FFF7D3] font-semibold opacity-100">dihargai hanya karena aku ada</strong>. Playlist ini yang mengajarkan aku itu. Dia yang mengajarkan aku itu.
    </span>,
    <span key="4">
      Setiap lagu di dalamnya, aku dengar dengan cara yang berbeda sekarang. Bukan sekadar musik tapi bukti bahwa di suatu titik dalam hidupku, <strong className="text-[#FFF7D3] font-semibold opacity-100">ada seseorang yang benar-benar melihatku</strong>.
    </span>
  ];

  return (
    <section
      className="w-full min-h-[150vh] flex flex-col items-center py-24 px-4 md:px-8 overflow-hidden"
    >
      <div className="sticky top-12 md:top-24 w-full flex flex-col items-center max-w-4xl mx-auto">

        {/* Heading and Text Above Book */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-[60px] md:text-[80px] font-bold leading-none mb-8 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            Al boom
          </motion.h2>

          <div className="space-y-6 font-body text-sm md:text-base leading-relaxed opacity-80 mb-8 max-w-2xl mx-auto text-center px-4">
            {paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  ease: [0.16, 1, 0.3, 1] as const,
                }}
                className="text-[rgba(255,247,211,0.85)] tracking-wide"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Book Container Wrapper for 3D Perspective */}
        <div className="perspective-[2000px]">
          <motion.div
            className="relative w-[300px] h-[400px] md:w-[450px] md:h-[500px] cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            animate={{
              rotateX: 5,     // Slight tilt to see top edge
              rotateY: isOpen ? 0 : -20,   // Rotate to show pages when closed, straighten when opened
              rotateZ: isOpen ? 0 : 2      // Slight playful rotation when closed
            }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsOpen(!isOpen)}
          >

            {/* Back Cover */}
            <div
              className="absolute inset-0 w-full h-full bg-[#8c1107] rounded-r-xl shadow-2xl border-l-4 border-[#6e0d05]"
              style={{
                transform: "translateZ(-30px)",
              }}
            />

            {/* Book Spine */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[30px] bg-[#6e0d05] shadow-inner"
              style={{
                transformOrigin: "left center",
                transform: "rotateY(-90deg)",
              }}
            />

            {/* Book Pages Thickness (3D Stack) */}
            <div className="absolute inset-y-1 left-1 right-0 bg-[#fefdf8] rounded-r-md border-r border-[#d4cfb4]" style={{ transform: "translateZ(-10px)" }} />
            <div className="absolute inset-y-1 left-1 right-0 bg-[#fdfbf2] rounded-r-md border-r border-[#d4cfb4]" style={{ transform: "translateZ(-15px)" }} />
            <div className="absolute inset-y-1 left-1 right-0 bg-[#fefdf8] rounded-r-md border-r border-[#d4cfb4]" style={{ transform: "translateZ(-20px)" }} />
            <div className="absolute inset-y-1 left-1 right-0 bg-[#fdfbf2] rounded-r-md border-r border-[#d4cfb4]" style={{ transform: "translateZ(-25px)" }} />

            {/* Front-most Right Page (Holds Spotify iframe) */}
            <div className="absolute inset-y-1 left-1 right-0 bg-[#fdfbf2] rounded-r-md border-r border-[#d4cfb4] shadow-inner flex items-center justify-center" style={{ transform: "translateZ(-5px)", transformStyle: "preserve-3d" }}>
              <motion.div
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.8, delay: isOpen ? 0.6 : 0, ease: "easeInOut" }}
                className="w-full h-full p-4 flex flex-col items-center justify-center pointer-events-auto"
                style={{ transform: "translateZ(1px)" }} // Pop out slightly from the page
              >
                <div className="w-full h-full bg-[rgba(171,21,9,0.05)] rounded-xl overflow-hidden p-2 shadow-lg border border-[rgba(171,21,9,0.1)]">
                  <iframe
                    style={{ borderRadius: "12px", border: "none" }}
                    src="https://open.spotify.com/embed/playlist/3FwG4viEOS8D0Kc1rNMscp?utm_source=generator&theme=0"
                    width="100%"
                    height="100%"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              </motion.div>
            </div>

            {/* Front Cover (Animates opening to the left) */}
            <motion.div
              animate={{ rotateY: isOpen ? -180 : 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d"
              }}
              className="absolute inset-0 w-full h-full bg-[#AB1509] rounded-r-xl shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-10 origin-left border border-[rgba(255,247,211,0.2)]"
            >
              {/* Outside Cover Text (visible when closed) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-[80%] h-[80%] bg-[rgba(255,247,211,0.05)] border border-[rgba(255,247,211,0.15)] flex items-center justify-center flex-col text-center shadow-inner relative overflow-hidden rounded-md">

                  {/* Animated Glowing Heart Background */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                      filter: ["blur(10px)", "blur(20px)", "blur(10px)"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 flex items-center justify-center z-0"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-48 h-48 text-[#ff2a1f]"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>

                  {/* Cover Content - Just the Heart */}
                  <div className="z-10 flex flex-col items-center justify-center">
                    <motion.svg
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-24 h-24 text-[#ff2a1f] opacity-90 drop-shadow-[0_0_15px_rgba(255,42,31,0.6)]"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </motion.svg>
                  </div>
                </div>
              </div>

              {/* Inside Cover (visible when opened, it's rotated 180deg) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#8c1107] rounded-l-xl rounded-r-none backface-hidden shadow-inner"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderRight: "4px solid #6e0d05"
                }}
              >
                <div className="text-[rgba(255,247,211,0.5)] font-display italic text-3xl mb-4">
                  Al boom
                </div>
                <p className="text-[rgba(255,247,211,0.4)] font-body text-sm text-center">
                  Sakti banget nih album<br />.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
