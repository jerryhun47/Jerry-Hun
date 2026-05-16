import React, { useEffect, useRef } from 'react';

export default function ScrollParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseOpacity: number;
      opacity: number;
      depth: number;
      blur: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        
        // Depth distribution: more small particles, fewer big particles
        const rand = Math.random();
        if (rand < 0.6) {
          this.size = Math.random() * 1 + 0.5; // Small (far)
          this.depth = 0.2;
          this.blur = 1;
        } else if (rand < 0.9) {
          this.size = Math.random() * 1.5 + 1.5; // Medium
          this.depth = 0.5;
          this.blur = 0.5;
        } else {
          this.size = Math.random() * 2 + 3; // Large (close)
          this.depth = 1;
          this.blur = 0;
        }

        this.speedX = (Math.random() - 0.5) * 0.3 * this.depth;
        this.speedY = (Math.random() - 0.5) * 0.3 * this.depth;
        this.baseOpacity = Math.random() * 0.4 + 0.1;
        this.opacity = this.baseOpacity;
      }

      update(canvasWidth: number, canvasHeight: number, scrollDelta: number) {
        // Horizontal drift
        this.x += this.speedX;
        
        // Base vertical movement + scroll reaction based on depth
        // If scrollDelta is positive (scrolling down), y decreases (moves UP)
        this.y += this.speedY - (scrollDelta * this.depth * 0.4);

        // Wrap around screen
        if (this.x < -10) this.x = canvasWidth + 10;
        if (this.x > canvasWidth + 10) this.x = -10;
        
        if (this.y < -10) this.y = canvasHeight + 10;
        if (this.y > canvasHeight + 10) this.y = -10;
        
        // Breathing opacity
        this.opacity = this.baseOpacity + Math.sin(Date.now() * 0.001 * this.speedX * 5) * 0.15;
        if (this.opacity < 0) this.opacity = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Soft red glow
        ctx.fillStyle = `rgba(220, 38, 38, ${this.opacity})`;
        
        if (this.blur > 0) {
          ctx.shadowBlur = this.blur * 2;
          ctx.shadowColor = `rgba(220, 38, 38, ${this.opacity})`;
        } else {
          ctx.shadowBlur = this.size * 1.5;
          ctx.shadowColor = `rgba(220, 38, 38, ${this.opacity * 0.8})`;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    let particles: Particle[] = [];
    let animationFrameId: number;
    let lastScrollY = window.scrollY;
    let currentScrollY = window.scrollY;

    const resize = () => {
      // Handle high DPI displays for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      // Scale context to match physical CSS pixels
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      const numParticles = isMobile ? 30 : 80; // Limit for performance
      
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(window.innerWidth, window.innerHeight));
      }
    };

    window.addEventListener('resize', resize);
    resize(); // Initial sizing & setup

    const handleScroll = () => {
      currentScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      // Calculate scroll delta per frame
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        p.update(window.innerWidth, window.innerHeight, deltaY);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
