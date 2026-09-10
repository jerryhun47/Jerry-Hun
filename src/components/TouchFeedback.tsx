import React, { useEffect, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function TouchFeedback() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleTouchOrClick = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        size: Math.random() > 0.5 ? 60 : 80,
      };

      setRipples((prev) => [...prev.slice(-6), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 700);
    };

    window.addEventListener('pointerdown', handleTouchOrClick, { passive: true });
    return () => window.removeEventListener('pointerdown', handleTouchOrClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-touch-pop border border-rose-400/80 bg-gradient-to-r from-rose-500/30 to-red-600/30 shadow-[0_0_25px_rgba(244,63,94,0.9)]"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </div>
  );
}
