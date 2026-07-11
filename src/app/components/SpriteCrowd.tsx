import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';

interface Peep {
  x: number;
  anchorY: number;
  bobY: number;
  scaleX: 1 | -1;
  speed: number;
  size: number;
  hue: number;
  tl: gsap.core.Timeline;
  walkTl: gsap.core.Timeline;
}

const PEEP_COUNT = 22;
const STAGE_ROWS = 3;

function drawPeep(ctx: CanvasRenderingContext2D, p: Peep, isDark: boolean) {
  ctx.save();
  ctx.translate(p.x, p.anchorY + p.bobY);
  ctx.scale(p.scaleX * p.size, p.size);

  const alpha = isDark ? 0.72 : 0.55;
  const fill = isDark
    ? `hsla(${p.hue},30%,75%,${alpha})`
    : `hsla(${p.hue},25%,35%,${alpha})`;

  // Body
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(-8, -20, 16, 22, 4);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, -27, 8, 0, Math.PI * 2);
  ctx.fill();

  // Legs (simple rects that will bob with parent)
  ctx.fillStyle = fill;
  ctx.fillRect(-7, 2, 6, 14);
  ctx.fillRect(1, 2, 6, 14);

  ctx.restore();
}

export function SpriteCrowd() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  const peepsRef = useRef<Peep[]>([]);
  const tickerRef = useRef<() => void>(() => {});

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function spawnPeep(stageW: number, stageH: number): Peep {
      const row = Math.floor(Math.random() * STAGE_ROWS);
      const yFrac = 0.35 + (row / (STAGE_ROWS - 1)) * 0.55;
      const anchorY = stageH * yFrac;
      const goRight = Math.random() > 0.5;
      const speed = 40 + Math.random() * 60;
      const size = 0.6 + (row / (STAGE_ROWS - 1)) * 0.7;

      const proxy = { x: goRight ? -30 : stageW + 30, bobY: 0 };

      const tl = gsap.timeline({ repeat: -1, onRepeat: () => {
        proxy.x = goRight ? -30 : stageW + 30;
      }});
      tl.to(proxy, {
        x: goRight ? stageW + 30 : -30,
        duration: stageW / speed,
        ease: 'none',
      });

      const bobSpeed = 0.15 + Math.random() * 0.25;
      const walkTl = gsap.timeline({ repeat: -1, yoyo: true });
      walkTl.to(proxy, { bobY: -8, duration: bobSpeed, ease: 'sine.inOut' });

      const p: Peep = {
        get x() { return proxy.x; },
        anchorY,
        get bobY() { return proxy.bobY; },
        scaleX: goRight ? 1 : -1,
        speed,
        size,
        hue: Math.random() * 360,
        tl,
        walkTl,
      };

      return p;
    }

    function init() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Kill existing
      for (const p of peepsRef.current) {
        p.tl.kill();
        p.walkTl.kill();
      }
      peepsRef.current = [];

      for (let i = 0; i < PEEP_COUNT; i++) {
        peepsRef.current.push(spawnPeep(canvas.width, canvas.height));
      }
    }

    const ticker = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Depth sort by anchorY
      const sorted = [...peepsRef.current].sort((a, b) => a.anchorY - b.anchorY);
      for (const p of sorted) {
        drawPeep(ctx, p, isDarkRef.current);
      }
    };

    tickerRef.current = ticker;
    gsap.ticker.add(ticker);

    init();

    const onResize = () => {
      init();
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(ticker);
      for (const p of peepsRef.current) {
        p.tl.kill();
        p.walkTl.kill();
      }
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    null
  );
}
