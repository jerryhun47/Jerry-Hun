import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

const Particle = ({ size, defaultSpeed, xOffset, yOffset, opacity }: any) => {
  const { scrollY } = useScroll();
  // Reverse scroll mapping: scrolling down means particles move UP (so Y value is negative scroll value)
  // We use useSpring to make the movement smooth and floaty.
  const smoothY = useSpring(scrollY, { stiffness: 50, damping: 20 });
  
  // Parallax effect: faster for bigger particles, slower for smaller
  const y = useTransform(smoothY, (val) => -val * defaultSpeed + yOffset);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: `${xOffset}%`,
        y,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#dc2626', // red-600
        opacity,
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default function ParticleSystem() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate static particle definitions so they don't reposition on each render
    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      const isSmall = i % 3 === 0;
      const isMedium = i % 3 === 1;
      
      const size = isSmall ? 3 : isMedium ? 6 : 10;
      const speed = isSmall ? 0.2 : isMedium ? 0.5 : 0.8;
      const opacity = isSmall ? 0.2 : isMedium ? 0.4 : 0.6;
      
      return {
        id: i,
        size,
        defaultSpeed: speed,
        // Randomly distribute across the page, we'll allow yOffset from 0 to 3000px so they spread vertically
        xOffset: Math.random() * 100, 
        yOffset: Math.random() * 3000, 
        opacity
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}
