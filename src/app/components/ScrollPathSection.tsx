import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Zap, Shield, Globe } from 'lucide-react';

const WAYPOINTS = [
  { icon: Zap, title: 'Accelerated Learning', desc: 'Intensive bootcamps that compress months of study into days of high-impact training.', x: '10%', y: '18%' },
  { icon: Shield, title: 'Exam Guarantee', desc: 'Pass your cert on the first attempt or we cover your retake — no questions asked.', x: '62%', y: '48%' },
  { icon: Globe, title: 'Global Recognition', desc: 'Certifications recognised by top employers in 40+ countries worldwide.', x: '14%', y: '78%' },
];

export function ScrollPathSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawLength = useTransform(scrollYProgress, [0.05, 0.75], [0, 1]);
  const pathLength = useSpring(rawLength, { stiffness: 60, damping: 20 });


  return (
    <section
      ref={ref}
      className="bg-background" style={{ fontFamily: 'var(--ace-font)', position: 'relative', overflow: 'hidden' }}
      className="py-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>
            Your Journey
          </p>
          <h2
            className="text-foreground" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.1 }}
          >
            From novice to certified in three steps
          </h2>
        </div>

        {/* SVG path + waypoints */}
        <div style={{ position: 'relative', height: 520 }}>
          <svg
            viewBox="0 0 1000 480"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
          >
            {/* Ghost path (background) */}
            <path
              d="M 80 80 C 200 80, 300 220, 500 220 C 700 220, 800 360, 920 380"
              fill="none"
              stroke={'var(--border)'}
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Animated cyan path */}
            <motion.path
              d="M 80 80 C 200 80, 300 220, 500 220 C 700 220, 800 360, 920 380"
              fill="none"
              stroke="#00A2B6"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>

          {/* Waypoint cards */}
          {WAYPOINTS.map(({ icon: Icon, title, desc, x, y }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -80px 0px' }}
              transition={{ delay: i * 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }}
            >
              <div
                className="rounded-2xl p-5 shadow-lg"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  width: 220,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(0,162,182,0.15)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#00A2B6' }} />
                </div>
                <p className="font-bold mb-1 text-foreground" style={{ fontSize: '0.9rem' }}>{title}</p>
                <p className="leading-relaxed text-muted-foreground" style={{ fontSize: '0.8rem' }}>{desc}</p>
                {/* Step dot */}
                <div
                  className="mt-3 flex items-center gap-1.5"
                >
                  <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: '#00A2B6' }}>
                    {i + 1}
                  </div>
                  <div className="h-px flex-1" style={{ backgroundColor: 'rgba(0,162,182,0.3)' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
