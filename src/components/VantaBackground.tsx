"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const VantaBackground = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make THREE globally available for Vanta
    (window as any).THREE = THREE;
    
    // Dynamically import Vanta
    const initVanta = async () => {
      if (!vantaEffect && vantaRef.current) {
        // vanta/dist/vanta.fog.min often needs dynamic import or global setup
        const FOG = (await import('vanta/dist/vanta.fog.min')).default;
        
        setVantaEffect(
          FOG({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0x0,
            midtoneColor: 0xff00a5,
            lowlightColor: 0xa200a4,
            baseColor: 0x0,
            blurFactor: 0.90,
            speed: 2.50,
            zoom: 0.60
          })
        );
      }
    };
    
    initVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="fixed inset-0 w-full h-full z-[-1]" />;
};
