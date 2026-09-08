import React, { useEffect, useRef } from 'react';

interface Bird {
  x: number;
  y: number;
  vx: number;
  baseY: number;
  size: number;
  wingPhase: number;
  wingRate: number;
  glidePhase: number;
  glideRate: number;
  glideAmp: number;
  tilt: number;
  opacity: number;
}

export const FlyingBirds: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // 20 graceful birds flying across the entire banner
    const BIRD_COUNT = 20;
    const birds: Bird[] = [];

    for (let i = 0; i < BIRD_COUNT; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      const size = 14 + depth * 16; // 14px to 30px
      const y = Math.random() * (height || 450);

      birds.push({
        x: Math.random() * (width || 900),
        y: y,
        baseY: y,
        vx: 1.8 + depth * 1.6, // Gently tuned flight speed (1.8 to 3.4 px/frame)
        size: size,
        wingPhase: Math.random() * Math.PI * 2,
        wingRate: 0.14 + Math.random() * 0.08, // graceful, natural wing flap tempo
        glidePhase: Math.random() * Math.PI * 2,
        glideRate: 0.02 + Math.random() * 0.015,
        glideAmp: 6 + Math.random() * 9,
        tilt: 0,
        opacity: 0.75 + depth * 0.25,
      });
    }

    // Draw realistic rightward-flying swallow / bird silhouette
    const drawBird = (b: Bird) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.tilt);

      const scale = b.size / 22;
      ctx.scale(scale, scale);

      // Flapping amplitude: sin creates smooth up-and-down stroke (-1 to 1)
      const flap = Math.sin(b.wingPhase);
      const wingY = flap * 12; // -12 (high up) to +12 (low down)

      ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity})`;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Soft shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      // Far wing (drawn behind body)
      ctx.beginPath();
      ctx.moveTo(3, -2);
      ctx.quadraticCurveTo(0, -8 - wingY * 0.8, -8, -14 - wingY * 0.9);
      ctx.quadraticCurveTo(-4, -6 - wingY * 0.4, -4, -1);
      ctx.closePath();
      ctx.fill();

      // Bird Main Body (Sleek aerodynamic torpedo shape facing RIGHT)
      ctx.beginPath();
      ctx.moveTo(14, 0); // Beak tip pointing forward (right)
      ctx.quadraticCurveTo(8, -3, 0, -2); // Top head/back
      ctx.lineTo(-12, -2.5); // Tail top
      ctx.lineTo(-9, 0); // Forked tail notch
      ctx.lineTo(-13, 2.5); // Tail bottom
      ctx.quadraticCurveTo(-2, 3, 6, 2.5); // Belly
      ctx.quadraticCurveTo(11, 1.5, 14, 0); // Throat to beak
      ctx.closePath();
      ctx.fill();

      // Near wing (Front articulated wing)
      ctx.beginPath();
      ctx.moveTo(4, -1);
      // Leading edge to wingtip
      ctx.quadraticCurveTo(-1, -10 - wingY, -11, -18 - wingY * 1.1);
      // Trailing edge back to body
      ctx.quadraticCurveTo(-6, -6 - wingY * 0.5, -5, 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;
      const step = dt * 60;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < birds.length; i++) {
        const b = birds[i];

        // Smooth horizontal flight forward
        b.x += b.vx * step;

        // Smooth wave vertical glide
        b.glidePhase += b.glideRate * step;
        const prevY = b.y;
        b.y = b.baseY + Math.sin(b.glidePhase) * b.glideAmp;

        // Dynamic aerodynamic pitch angle based on climb/dive rate
        const dy = b.y - prevY;
        const targetTilt = Math.max(-0.22, Math.min(0.22, dy * 0.15));
        b.tilt += (targetTilt - b.tilt) * 0.15;

        // Flap wings smoothly
        b.wingPhase += b.wingRate * step;

        // Wrap around seamlessly when flying off right edge
        if (b.x > width + 50) {
          b.x = -50;
          b.baseY = Math.random() * (height - 40) + 20; // spread across all heights
          b.y = b.baseY;
          const depth = Math.random();
          b.vx = 1.8 + depth * 1.6;
          b.size = 14 + depth * 16;
          b.opacity = 0.75 + depth * 0.25;
        }

        drawBird(b);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    />
  );
};
