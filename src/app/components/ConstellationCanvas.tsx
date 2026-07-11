import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  size: number;
}

const MOUSE_RADIUS = 200;
const PROXIMITY = 130;

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function init() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        dirX: (Math.random() - 0.5) * 0.6,
        dirY: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
      }));
    }

    function connect(particles: Particle[]) {
      if (!canvas || !ctx) return;
      const mouse = mouseRef.current;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > PROXIMITY) continue;
          const opacity = 1 - dist / PROXIMITY;
          const nearMouse =
            Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y) < MOUSE_RADIUS ||
            Math.hypot(particles[b].x - mouse.x, particles[b].y - mouse.y) < MOUSE_RADIUS;
          if (isDarkRef.current) {
            ctx.strokeStyle = nearMouse
              ? `rgba(255,255,255,${opacity * 0.7})`
              : `rgba(200,150,255,${opacity * 0.4})`;
          } else {
            ctx.strokeStyle = nearMouse
              ? `rgba(17,17,17,${opacity * 0.7})`
              : `rgba(100,110,125,${opacity * 0.35})`;
          }
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        p.x += p.dirX;
        p.y += p.dirY;

        if (p.x < 0 || p.x > canvas.width) p.dirX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dirY *= -1;

        // Draw particle
        if (isDarkRef.current) {
          ctx.fillStyle = 'rgba(191,128,255,0.8)';
        } else {
          ctx.fillStyle = 'rgba(0,162,182,0.8)';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      connect(particles);
      rafRef.current = requestAnimationFrame(animate);
    }

    init();
    animate();

    const onResize = () => init();
    window.addEventListener('resize', onResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseOut = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseOut);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0 }}
    />
  );
}
