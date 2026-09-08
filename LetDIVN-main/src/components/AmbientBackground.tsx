import React, { useEffect, useRef } from 'react';

interface EcoElement {
  x: number;
  y: number;
  size: number;
  type: 'leaf' | 'sprout' | 'recycle' | 'tree' | 'drop' | 'flower';
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  tiltAngle: number;
  vTilt: number;
  opacity: number;
  color: string;
  depth: number;
}

interface LitterParticle {
  x: number;
  y: number;
  size: number;
  type: 'bottle' | 'can' | 'wrapper';
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
  collecting: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frame = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Fixed "trash bin" HUD anchor, bottom-right of the viewport
    let binX = width - 54;
    let binY = height - 54;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      binX = width - 54;
      binY = height - 54;
    };

    window.addEventListener('resize', handleResize);

    const ecoColors = [
      '#10B981', // Emerald
      '#059669', // Deep green
      '#34D399', // Mint
      '#E81A7F', // Brand Pink
      '#06B6D4', // Ocean Cyan
      '#84CC16', // Lime Green
      '#F59E0B'  // Sun Gold
    ];

    const types: EcoElement['type'][] = ['leaf', 'sprout', 'recycle', 'leaf', 'tree', 'drop', 'flower'];
    const count = Math.min(32, Math.floor(width / 45));
    const elements: EcoElement[] = [];

    for (let i = 0; i < count; i++) {
      elements.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 16,
        type: types[i % types.length],
        vx: (Math.random() - 0.5) * 0.35 + 0.2, // gentle drift to right
        vy: Math.random() * 0.4 + 0.25,        // gentle float downward
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        tiltAngle: Math.random() * Math.PI * 2,
        vTilt: Math.random() * 0.03 + 0.01,
        opacity: Math.random() * 0.45 + 0.35,
        color: ecoColors[Math.floor(Math.random() * ecoColors.length)],
        depth: Math.random() * 0.6 + 0.4 // 3D depth scale
      });
    }

    // --- "Vứt rác vào thùng" homing litter system ---
    // Litter drifts down, then gets pulled toward the fixed bin and "poofs"
    // into a burst of green leaves once collected — a small visual story that
    // ties the ambient background back to the cleanup mission.
    const litterTypes: LitterParticle['type'][] = ['bottle', 'can', 'wrapper'];
    const LITTER_COUNT = 5;

    const spawnLitter = (existing?: LitterParticle): LitterParticle => {
      const l = existing ?? ({} as LitterParticle);
      l.x = Math.random() * width;
      l.y = -Math.random() * height * 0.6 - 30;
      l.size = Math.random() * 10 + 16;
      l.type = litterTypes[Math.floor(Math.random() * litterTypes.length)];
      l.vx = (Math.random() - 0.5) * 0.6;
      l.vy = Math.random() * 0.5 + 0.3;
      l.rotation = Math.random() * Math.PI * 2;
      l.vRot = (Math.random() - 0.5) * 0.04;
      l.opacity = 0.85;
      l.collecting = false;
      return l;
    };

    const litterParticles: LitterParticle[] = [];
    for (let i = 0; i < LITTER_COUNT; i++) {
      const l = spawnLitter();
      // Stagger initial heights so they don't fall in sync
      l.y = Math.random() * height - height * 0.4;
      litterParticles.push(l);
    }

    const bursts: BurstParticle[] = [];
    const burstColors = ['#10B981', '#34D399', '#84CC16', '#FFFFFF'];

    const spawnBurst = (x: number, y: number) => {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.2 + 0.8;
        bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          size: Math.random() * 3 + 2,
          life: 28,
          maxLife: 28,
          color: burstColors[Math.floor(Math.random() * burstColors.length)]
        });
      }
    };

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Draw functions for crisp vector eco symbols on canvas
    const drawLeaf = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.beginPath();
      context.moveTo(0, -size / 2);
      context.bezierCurveTo(size / 1.8, -size / 3, size / 1.8, size / 3, 0, size / 2);
      context.bezierCurveTo(-size / 1.8, size / 3, -size / 1.8, -size / 3, 0, -size / 2);
      context.fillStyle = color;
      context.fill();

      // Leaf middle vein
      context.beginPath();
      context.moveTo(0, -size / 2.3);
      context.lineTo(0, size / 2.3);
      context.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      context.lineWidth = 1.2;
      context.stroke();
    };

    const drawSprout = (context: CanvasRenderingContext2D, size: number, color: string) => {
      // Stem
      context.beginPath();
      context.moveTo(0, size / 2);
      context.quadraticCurveTo(size * 0.1, 0, 0, -size * 0.2);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();

      // Left leaf
      context.save();
      context.translate(-size * 0.05, -size * 0.1);
      context.rotate(-0.7);
      drawLeaf(context, size * 0.55, color);
      context.restore();

      // Right leaf
      context.save();
      context.translate(size * 0.05, -size * 0.25);
      context.rotate(0.7);
      drawLeaf(context, size * 0.55, color);
      context.restore();
    };

    const drawRecycle = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.font = `${Math.round(size)}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = color;
      context.fillText('♻', 0, 0);
    };

    const drawTree = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.font = `${Math.round(size * 1.1)}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = color;
      context.fillText('🌱', 0, 0);
    };

    const drawWaterDrop = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.beginPath();
      context.moveTo(0, -size / 2);
      context.bezierCurveTo(size / 2, 0, size / 2, size / 2, 0, size / 2);
      context.bezierCurveTo(-size / 2, size / 2, -size / 2, 0, 0, -size / 2);
      context.fillStyle = '#06B6D4';
      context.fill();
    };

    const drawFlower = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.font = `${Math.round(size)}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌸', 0, 0);
    };

    // Litter silhouettes — deliberately muted/desaturated so they read as
    // "trash" in contrast with the vivid eco-color particles above.
    const drawBottle = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(-size * 0.18, size * 0.5);
      context.lineTo(-size * 0.22, -size * 0.05);
      context.lineTo(-size * 0.08, -size * 0.3);
      context.lineTo(-size * 0.08, -size * 0.5);
      context.lineTo(size * 0.08, -size * 0.5);
      context.lineTo(size * 0.08, -size * 0.3);
      context.lineTo(size * 0.22, -size * 0.05);
      context.lineTo(size * 0.18, size * 0.5);
      context.closePath();
      context.fill();
      context.strokeStyle = 'rgba(255,255,255,0.45)';
      context.lineWidth = 1;
      context.stroke();
    };

    const drawCan = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(-size * 0.22, -size * 0.42, size * 0.44, size * 0.84);
      context.fillStyle = 'rgba(255,255,255,0.35)';
      context.fillRect(-size * 0.22, -size * 0.42, size * 0.44, size * 0.08);
      context.fillRect(-size * 0.22, size * 0.34, size * 0.44, size * 0.08);
    };

    const drawWrapper = (context: CanvasRenderingContext2D, size: number, color: string) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(-size * 0.3, -size * 0.15);
      context.lineTo(-size * 0.05, -size * 0.35);
      context.lineTo(size * 0.2, -size * 0.1);
      context.lineTo(size * 0.32, size * 0.18);
      context.lineTo(size * 0.02, size * 0.32);
      context.lineTo(-size * 0.28, size * 0.12);
      context.closePath();
      context.fill();
    };

    // Fixed trash-bin HUD icon — always visible, gives the litter above
    // somewhere to "land" so the loop reads as an intentional story.
    const drawBin = (context: CanvasRenderingContext2D, x: number, y: number, pulse: number) => {
      context.save();
      context.translate(x, y);

      const glowR = 34 + pulse * 4;
      const glow = context.createRadialGradient(0, 0, 4, 0, 0, glowR);
      glow.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(0, 0, glowR, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(51, 65, 85, 0.85)';
      context.beginPath();
      context.moveTo(-14, -8);
      context.lineTo(14, -8);
      context.lineTo(11, 22);
      context.lineTo(-11, 22);
      context.closePath();
      context.fill();

      context.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(-6, -6);
      context.lineTo(-5, 20);
      context.moveTo(0, -6);
      context.lineTo(0, 20);
      context.moveTo(6, -6);
      context.lineTo(5, 20);
      context.stroke();

      context.fillStyle = 'rgba(71, 85, 105, 0.95)';
      context.fillRect(-18, -14, 36, 6);
      context.fillRect(-5, -19, 10, 5);

      context.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];

        // 3D swaying physics
        el.tiltAngle += el.vTilt;
        el.rotation += el.vRot;

        // Sway drift
        const sway = Math.sin(el.tiltAngle) * 0.6;
        el.x += el.vx + sway;
        el.y += el.vy;

        // Interactive mouse breeze (pushes gently)
        const dx = el.x - mouseX;
        const dy = el.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0) {
          const force = (160 - dist) / 160;
          el.x += (dx / dist) * force * 1.8;
          el.y += (dy / dist) * force * 1.8;
          el.rotation += 0.03;
        }

        // Boundary wrap
        if (el.y > height + 40) {
          el.y = -40;
          el.x = Math.random() * width;
        }
        if (el.x > width + 40) el.x = -40;
        if (el.x < -40) el.x = width + 40;

        // 3D Matrix transform (Pitch & Yaw flip)
        const scaleX = Math.cos(el.tiltAngle) * el.depth;
        const scaleY = el.depth;

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.scale(Math.abs(scaleX) < 0.15 ? 0.15 : scaleX, scaleY);
        ctx.globalAlpha = el.opacity * Math.abs(Math.sin(el.tiltAngle * 0.5) * 0.5 + 0.5);

        // Render appropriate eco graphic
        switch (el.type) {
          case 'leaf':
            drawLeaf(ctx, el.size, el.color);
            break;
          case 'sprout':
            drawSprout(ctx, el.size, el.color);
            break;
          case 'recycle':
            drawRecycle(ctx, el.size, el.color);
            break;
          case 'tree':
            drawTree(ctx, el.size, el.color);
            break;
          case 'drop':
            drawWaterDrop(ctx, el.size, el.color);
            break;
          case 'flower':
            drawFlower(ctx, el.size, el.color);
            break;
        }

        ctx.restore();
      }

      // --- Litter homing toward the bin, then bursting into greenery ---
      for (let i = 0; i < litterParticles.length; i++) {
        const l = litterParticles[i];

        if (l.collecting) {
          l.opacity -= 0.08;
          l.size *= 0.9;
          if (l.opacity <= 0.05) {
            spawnLitter(l);
          }
        } else {
          l.rotation += l.vRot;
          l.x += l.vx;
          l.y += l.vy;

          if (l.y > height * 0.4) {
            // Once past the halfway point, home in on the bin
            const dx = binX - l.x;
            const dy = binY - l.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            l.vx += (dx / dist) * 0.08;
            l.vy += (dy / dist) * 0.08;
            const speed = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
            const maxSpeed = 3.4;
            if (speed > maxSpeed) {
              l.vx = (l.vx / speed) * maxSpeed;
              l.vy = (l.vy / speed) * maxSpeed;
            }

            if (dist < 22) {
              l.collecting = true;
              spawnBurst(binX, binY - 10);
            }
          } else {
            l.vy += 0.012; // gentle gravity before homing kicks in
          }

          if (l.y > height + 60 || l.x < -60 || l.x > width + 60) {
            spawnLitter(l);
          }
        }

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.globalAlpha = Math.max(l.opacity, 0);
        switch (l.type) {
          case 'bottle':
            drawBottle(ctx, l.size, 'rgba(125, 211, 252, 0.8)');
            break;
          case 'can':
            drawCan(ctx, l.size, 'rgba(148, 163, 184, 0.85)');
            break;
          case 'wrapper':
            drawWrapper(ctx, l.size, 'rgba(251, 191, 36, 0.85)');
            break;
        }
        ctx.restore();
      }

      // Collection bursts — confirms the litter became greenery
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.03;
        b.life -= 1;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(b.life / b.maxLife, 0);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Fixed trash-bin HUD icon on top of everything else
      drawBin(ctx, binX, binY, Math.sin(frame * 0.05));
      frame++;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 3D Ambient Nature Mesh Glowing Orbs */}
      <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-emerald-500/12 via-teal-500/8 to-transparent blur-[120px] animate-ambient-pulse" />
      <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-pink-500/12 via-emerald-500/10 to-transparent blur-[130px] animate-ambient-float" />
      <div className="absolute -bottom-[20%] left-[25%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-cyan-500/10 via-emerald-500/12 to-transparent blur-[140px] animate-ambient-pulse" style={{ animationDelay: '-4s' }} />

      {/* 3D Eco Nature Floating Canvas + "vứt rác vào thùng" litter loop */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
