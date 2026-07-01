import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import ScrollParticles from './ScrollParticles';

export default function BackgroundEffects() {
  const { scrollY } = useScroll();

  // Smooth scroll for parallax
  const smoothY = useSpring(scrollY, { stiffness: 50, damping: 20 });
  
  // Parallax transforms for the logo
  const logoY = useTransform(smoothY, [0, 3000], [0, 400]);
  const logoRotate = useTransform(smoothY, [0, 3000], [-5, 15]);
  const logoScale = useTransform(smoothY, [0, 3000], [1, 1.1]);

  const [bubbles, setBubbles] = useState<{ id: number; left: string; size: number; duration: number; delay: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate random bubbles
    const newBubbles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 60 + 20, // 20px to 80px
      duration: Math.random() * 20 + 20, // 20s to 40s
      delay: Math.random() * -40, // random start time
      opacity: Math.random() * 0.15 + 0.05,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Scroll Reactive Particles */}
      <ScrollParticles />

      {/* Background Logo Parallax */}
      <motion.div 
        style={{ y: logoY, rotate: logoRotate, scale: logoScale }}
        className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] blur-[8px] flex flex-col items-center justify-center pointer-events-none w-full"
      >
        <div className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] bg-white rounded-[3rem] flex items-center justify-center mb-8 md:mb-12 rotate-12 overflow-hidden shadow-2xl">
           <img src="/logo.webp" alt="Background Logo" width="200" height="200" className="w-[80%] h-[80%] object-contain" />
        </div>
        <span className="font-extrabold text-[15vw] md:text-[10vw] whitespace-nowrap text-white tracking-tighter">
          Jerry <span className="text-red-500 font-extrabold">Automation</span>
        </span>
      </motion.div>

      {/* Floating Bubbles */}
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          className="absolute bottom-[-100px] rounded-full bg-red-500 blur-md pointer-events-none"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: ['-20px', '20px', '-20px', '20px'],
          }}
          transition={{
            y: { duration: bubble.duration, repeat: Infinity, ease: 'linear', delay: bubble.delay },
            x: { duration: bubble.duration / 2, repeat: Infinity, ease: 'easeInOut', delay: bubble.delay, repeatType: 'mirror' }
          }}
        />
      ))}
    </div>
  );
}
