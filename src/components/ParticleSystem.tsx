import React, { useEffect, useState } from 'react';

const Particle = ({ size, defaultSpeed, xOffset, yOffset, opacity }: any) => {
  return (
    <div
      className="absolute bg-red-600 rounded-full"
      style={{
        top: `${yOffset}px`,
        left: `${xOffset}%`,
        width: size,
        height: size,
        opacity,
        zIndex: 0,
        pointerEvents: 'none',
        animation: `float-particle ${10 / defaultSpeed}s infinite linear alternate`,
        willChange: 'transform, opacity'
      }}
    />
  );
};

export default function ParticleSystem() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate static particle definitions
    const newParticles = Array.from({ length: 15 }).map((_, i) => {
      const isSmall = i % 3 === 0;
      const isMedium = i % 3 === 1;
      
      const size = isSmall ? 3 : isMedium ? 6 : 10;
      const speed = isSmall ? 0.2 : isMedium ? 0.5 : 0.8;
      const opacity = isSmall ? 0.1 : isMedium ? 0.2 : 0.4;
      
      return {
        id: i,
        size,
        defaultSpeed: speed,
        xOffset: Math.random() * 100, 
        yOffset: Math.random() * 3000, 
        opacity
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      <style>
        {`
          @keyframes float-particle {
            0% { transform: translateY(0px) scale(1); }
            100% { transform: translateY(-50px) scale(1.1); }
          }
        `}
      </style>
      {particles.map(p => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}
