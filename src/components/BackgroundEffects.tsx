import React from 'react';
import NetworkBackground from './NetworkBackground';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <NetworkBackground />
      {/* Subtle Static Red Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none opacity-60" />
    </div>
  );
}
