import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export function MouseFollower() {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const rawX = useMotionValue(-400);
  const rawY = useMotionValue(-400);
  const dotX = useMotionValue(-400);
  const dotY = useMotionValue(-400);

  const glowX = useSpring(rawX, { mass: 0.3, damping: 18, stiffness: 120 });
  const glowY = useSpring(rawY, { mass: 0.3, damping: 18, stiffness: 120 });

  const ringX = useSpring(rawX, { mass: 0.15, damping: 14, stiffness: 200 });
  const ringY = useSpring(rawY, { mass: 0.15, damping: 14, stiffness: 200 });

  const springDotX = useSpring(dotX, { mass: 0.05, damping: 10, stiffness: 500 });
  const springDotY = useSpring(dotY, { mass: 0.05, damping: 10, stiffness: 500 });

  useEffect(() => {
    const GLOW_R = 300;
    const DOT_R = 4;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - GLOW_R);
      rawY.set(e.clientY - GLOW_R);
      dotX.set(e.clientX - DOT_R);
      dotY.set(e.clientY - DOT_R);
      if (!visible) setVisible(true);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    const onOverInteractive = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest('a, button, [role="button"], input, textarea, select, label');
      setIsHoveringInteractive(!!interactive);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousemove', onOverInteractive, { passive: true });
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousemove', onOverInteractive);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [rawX, rawY, dotX, dotY, visible]);

  const accent = '#00A4AC';
  const glowColor = isDark
    ? 'radial-gradient(circle, rgba(0,164,172,0.13) 0%, rgba(0,164,172,0.04) 40%, transparent 70%)'
    : 'radial-gradient(circle, rgba(0,164,172,0.08) 0%, rgba(0,164,172,0.02) 40%, transparent 70%)';

  return (
    <>
      {/* Ambient glow blob */}
      <motion.div
        style={{
          x: glowX,
          y: glowY,
          position: 'fixed',
          top: 0,
          left: 0,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: glowColor,
          pointerEvents: 'none',
          zIndex: 9990,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Ring cursor */}
      {/* Dot */}
      <motion.div
        style={{
          x: springDotX,
          y: springDotY,
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isHoveringInteractive ? accent : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          scale: isHoveringInteractive ? 0.5 : 1,
          transition: 'opacity 0.3s ease, scale 0.15s ease, background-color 0.2s ease',
        }}
      />
    </>
  );
}
