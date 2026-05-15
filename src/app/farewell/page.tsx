"use client";

import { VantaBackground } from '@/components/VantaBackground';
import { FlipCard } from '@/components/FlipCard';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function FarewellPage() {
  const { scrollY } = useScroll();
  // Fade out effect based on scroll position for the top content
  const opacityTop = useTransform(scrollY, [0, 300], [1, 0]);
  const yTop = useTransform(scrollY, [0, 300], [0, -50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 100 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative px-6 py-20 overflow-x-hidden">
      <VantaBackground />

      {/* Content Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-12 md:gap-16 z-10 text-center">

        <motion.div
          style={{ opacity: opacityTop, y: yTop }}
          className="flex flex-col items-center gap-12 md:gap-16 w-full"
        >
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-serif text-[#FFF7D3] tracking-widest mt-10 md:mt-20">
            Moy
          </h1>

          {/* Top Text */}
          <div className="text-[#FFF7D3] text-xs md:text-sm lg:text-base font-sans leading-relaxed md:leading-loose space-y-4 max-w-4xl text-balance">
            <p>
              makasih buat semua yang udah kamu kasih ke aku. Aku beneran ngerasa dihargai, mungkin lebih dari yang bisa aku ungkapin dengan kata-kata. Tapi justru karena itu, aku harus jujur sekarang.
            </p>
            <p>
              Aku memutuskan untuk berhenti di sini. Bukan karena kamu kurang, kamu lebih dari cukup. Tapi karena aku tau kalau dilanjut, ini akan semakin menyakitkan, buat kamu dan buat aku. Ada banyak hal tentang aku yang kamu belum tau, dan aku ga yakin semua orang bisa nerima itu, termasuk orang yang paling tulus sekalipun. Aku juga punya masa lalu empat tahun yang masih belum selesai, masa lalu yang berat, yang ga adil kalau harus kamu tanggung juga.
            </p>
          </div>
        </motion.div>

        {/* Cards Section */}
        <motion.div 
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 lg:gap-8 mt-12 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={itemVariants}>
            <FlipCard
              title="Alasan aku Ngeselin"
              glowColor="purple"
              backContent="Aku sengaja ngeselin kamu biar kamu bisa benci aku duluan sebelum baca ini, biar kamu merasa tidak ada yang hilang. Padahal sebenernya aku pengen banget excited sama kamu. Bahkan aku sering ga sadar udah ngabisin seharian buat call kamu, sampai waktu kelas pun. Bukan karena kebiasaan, tapi karena kamu emang se-menarik itu."
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FlipCard
              title="Alasan aku suka kamu"
              glowColor="purple"
              backContent="kayanya gaperlu aku jelasin kamu juga udah tau seberapa besar kamu dicintai sama orang2 sekitarmu"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FlipCard
              title="REMINDER KERAS!!"
              glowColor="purple"
              backContent="Jaga pola tidurmu, jangan sering begadang. Makan tepat waktu. Kurangi kopi. Jangan jahat sama Rafa. Dan apapun yang terjadi, kesehatanmu selalu nomor satu."
            />
          </motion.div>
        </motion.div>

        {/* Galervie Button */}
        <motion.div 
          className="mt-8 md:mt-12 relative z-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div
            className="inline-block px-12 md:px-16 py-4 md:py-5 bg-white/5 border border-white/20 text-[#FFF7D3] font-sans tracking-[0.2em] uppercase backdrop-blur-sm opacity-70 cursor-not-allowed"
          >
            Galervie. Coming Soon
          </div>
        </motion.div>

        {/* Bottom Text */}
        <motion.div 
          className="text-[#FFF7D3] text-xs md:text-sm lg:text-base font-sans leading-relaxed md:leading-loose max-w-3xl mt-12 mb-10 opacity-90 text-balance"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <p>
            Kalau kamu berdoa biar alam mendukungmu untuk tidak bertemu aku di kesempatan apapun, aku berdoa sebaliknya. Aku berdoa agar kita dipertemukan di waktu yang tepat, jika memang takdir. Dan jika tidak pun, semoga kamu selalu dikelilingi hal-hal baik, selalu mendapatkan apa yang kamu mau, dengan versi yang paling terbaik.
          </p>
        </motion.div>

      </div>

      {/* Floating Music Button */}
      <a 
        href="https://open.spotify.com/playlist/7vgb9HkvYTyUyXEMl4f4ft?si=hWPcgUPuSGG0x5K9xy902A&pi=AoscZR_URV-Ul" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[#FFF7D3] transition-all duration-300 hover:scale-110 shadow-lg group"
        title="Dengarkan Playlist"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-pulse">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </a>
    </main>
  );
}
