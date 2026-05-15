"use client";
import React, { useState } from 'react';
import { GlowCard } from './GlowCard';

interface FlipCardProps {
  title: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  backContent?: React.ReactNode;
}

export const FlipCard = ({ title, glowColor = 'purple', backContent }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-[1200px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full max-w-[280px] sm:w-64 h-80 mx-auto transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
          <GlowCard glowColor={glowColor} className="w-full h-full flex flex-col items-center justify-center text-center">
            <h3 className="text-xl sm:text-2xl font-serif text-[#FFF7D3] leading-relaxed px-4 text-balance z-10">{title}</h3>
          </GlowCard>
        </div>
        
        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <GlowCard glowColor={glowColor} className="w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="text-sm sm:text-base font-sans text-[#FFF7D3] opacity-90 z-10">
              {backContent || "Teks balikan (nanti akan diisi)"}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};
