"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import React from "react";

// Data gambar carousel
// Pastikan file foto dinamakan 1.jpg sampai 5.jpg dan ditaruh di folder `public`
const carouselImages = [
  { id: "1", src: "/1.jpg", color: "#AB1509", rotation: -5 },
  { id: "2", src: "/2.jpg", color: "#8c1107", rotation: 5 },
  { id: "3", src: "/3.jpg", color: "#6e0d05", rotation: -3 },
  { id: "4", src: "/4.jpg", color: "#FFF7D3", rotation: 3 },
  { id: "5", src: "/5.jpg", color: "#e6debc", rotation: -6 },
];

export function AboutSection() {
  const customEase = [0.16, 1, 0.3, 1] as const;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [rotatingCards, setRotatingCards] = useState<number[]>([]);

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingCards((prev) => prev.map((val) => (val + 0.3) % 360));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Initialize rotating cards
  useEffect(() => {
    setRotatingCards(carouselImages.map((_, i) => i * (360 / carouselImages.length)));
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const paragraphs = [
    <span key="1">
      Panggilannya Puput, dan kalau kamu sudah mengenalnya lebih dari lima menit, kamu akan tahu bahwa dia tidak bisa diam. Bukan karena gelisah, tapi karena ada sesuatu di otaknya. Tentang negaranya. Tentang hal-hal kecil yang orang lain lewati begitu saja.
    </span>,
    <span key="2">
      Orang-orang di sekitarnya selalu menjadikannya tempat bercerita. Bukan tanpa alasan, dia punya cara menanggapi yang tidak banyak orang miliki. Dia mendengarkan dengan sungguh-sungguh, lalu merespons dengan cara yang membuat kamu merasa seolah kamu penting. <strong className="text-[#FFF7D3] font-semibold">Membuat kamu merasa kamu penting.</strong>
    </span>,
    <span key="3">
      Termasuk aku. Hanyut dalam responnya adalah hal paling bodoh sekaligus paling jujur yang pernah aku lakukan. Dan sampai sekarang, <strong className="text-[#FFF7D3] font-semibold italic">aku tidak pernah menyesal bisa mengenalnya.</strong>
    </span>,
    <span key="4">
    </span>
  ];

  return (
    <section className="w-full min-h-screen flex items-center justify-center py-24 px-8 md:px-16 overflow-hidden max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-16 lg:gap-24">

        {/* Left Column - Rotating Image Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: customEase }}
          className="relative w-full max-w-[400px] h-[400px] md:h-[500px] flex-shrink-0"
        >
          <div
            className="absolute inset-0 flex items-center justify-center perspective-[1000px]"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {carouselImages.map((image, index) => {
              const angle = (rotatingCards[index] || 0) * (Math.PI / 180);
              const radius = 140; // Adjust radius of the circle
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              // 3D perspective effect based on mouse position
              const perspectiveX = (mousePosition.x - 0.5) * 30;
              const perspectiveY = (mousePosition.y - 0.5) * 30;

              return (
                <div
                  key={image.id}
                  className="absolute w-28 h-36 md:w-36 md:h-48 transition-all duration-300"
                  style={{
                    transform: `
                      translate(${x}px, ${y}px)
                      rotateX(${perspectiveY}deg)
                      rotateY(${perspectiveX}deg)
                      rotateZ(${image.rotation}deg)
                    `,
                    transformStyle: "preserve-3d",
                    zIndex: Math.round(y), // Give depth based on Y position in the circle
                  }}
                >
                  <div
                    className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer group border border-[rgba(255,247,211,0.2)]"
                    style={{
                      backgroundColor: image.color,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Render Image if src exists, otherwise show dummy text */}
                    {image.src ? (
                      <img
                        src={image.src}
                        alt={`Carousel image ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <span className={`text-4xl font-bold font-display ${image.color === '#FFF7D3' || image.color === '#e6debc' ? 'text-[#AB1509]' : 'text-[#FFF7D3]'}`}>
                          {image.id}
                        </span>
                      </div>
                    )}

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column - Text Content */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: customEase }}
            className="text-[60px] md:text-[80px] font-bold leading-none mb-4"
          >
            VIE
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: customEase }}
            className="text-[12px] md:text-[14px] tracking-[0.2em] uppercase opacity-60 mb-8 font-body border-b border-[rgba(255,247,211,0.2)] pb-4 inline-block md:block w-fit"
          >
            Puput Octaviana Siam
          </motion.p>

          <div className="space-y-6 font-body text-sm md:text-base leading-relaxed opacity-85">
            {paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 1.2,
                  delay: 0.3 + i * 0.15,
                  ease: customEase,
                }}
                className="text-[rgba(255,247,211,0.8)]"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
