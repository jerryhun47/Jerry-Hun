import React from 'react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background (optional, usually transparent, but keeping it clean) */}
      <circle cx="200" cy="180" r="160" fill="transparent" />
      
      {/* Swoosh Background (Dark part) */}
      <path 
        d="M 120 250 C 40 220, 40 140, 150 110" 
        stroke="#1e293b" 
        strokeWidth="24" 
        strokeLinecap="round" 
      />

      {/* Swoosh Foreground (Red part) */}
      <path 
        d="M 150 110 C 350 80, 350 260, 200 280" 
        stroke="#dc2626" 
        strokeWidth="24" 
        strokeLinecap="round" 
      />

      {/* The big letter J */}
      <path 
        d="M 180 120 L 250 120 C 250 120, 240 220, 240 240 C 240 270, 200 280, 170 260 C 150 245, 145 220, 145 220" 
        stroke="#dc2626" 
        strokeWidth="48" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* J Top Serif (optional, making it thicker) */}
      <path 
        d="M 160 120 L 260 120" 
        stroke="#dc2626" 
        strokeWidth="24" 
        strokeLinecap="round" 
      />

      {/* Decorative stars / play buttons */}
      <polygon points="120,130 140,140 120,150" fill="#dc2626" />
      <polygon points="280,240 300,230 280,220" fill="#1e293b" />
      
      {/* Text: Jerry */}
      <text 
        x="200" 
        y="340" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="64" 
        fill="#1e293b" 
        textAnchor="middle"
      >
        <tspan fill="#1e293b">J</tspan>
        <tspan fill="#1e293b">e</tspan>
        <tspan fill="#dc2626">r</tspan>
        <tspan fill="#dc2626">r</tspan>
        <tspan fill="#dc2626">y</tspan>
      </text>

      {/* Text: YOUTUBE AUTOMATION */}
      <text 
        x="200" 
        y="375" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="22" 
        fill="#475569" 
        textAnchor="middle" 
        letterSpacing="2"
      >
        YOUTUBE AUTOMATION
      </text>
    </svg>
  );
}
