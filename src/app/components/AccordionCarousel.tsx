import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Clock, Users } from 'lucide-react';

const IMG = 'https://wp.ituonline.com/wp-content/uploads/2023';

const CARDS = [
  {
    id: 0, code: 'CISSP', title: 'Certified Information Systems Security Professional',
    category: 'Cybersecurity', duration: '6 days', students: '12,400+',
    price: 60000, color: '#005f6b',
    tagline: 'Gold Standard in Security',
    desc: 'The world\'s premier cybersecurity leadership certification. Covers all 8 security domains.',
    image: `${IMG}/05/cissp.jpg`,
  },
  {
    id: 1, code: 'Security+', title: 'CompTIA Security+',
    category: 'Entry Level', duration: '5 days', students: '28,000+',
    price: 60000, color: '#c0392b',
    tagline: 'Launch Your Cyber Career',
    desc: 'The most in-demand entry-level security cert. DoD-approved and vendor-neutral.',
    image: `${IMG}/04/security-plus.jpg`,
  },
  {
    id: 2, code: 'CCNA', title: 'Cisco Certified Network Associate',
    category: 'Networking', duration: '5 days', students: '9,800+',
    price: 60000, color: '#1ba0d8',
    tagline: 'Master Cisco Networking',
    desc: 'Prove your networking fundamentals with hands-on Cisco lab exercises.',
    image: `${IMG}/04/200-301.jpg`,
  },
  {
    id: 3, code: 'AWS SAA', title: 'AWS Solutions Architect Associate',
    category: 'Cloud', duration: '4 days', students: '15,600+',
    price: 60000, color: '#ff9900',
    tagline: 'Design at Cloud Scale',
    desc: 'Design fault-tolerant, scalable architectures on Amazon Web Services.',
    image: `${IMG}/04/aws-saa-c02.jpg`,
  },
  {
    id: 4, code: 'PMP', title: 'Project Management Professional',
    category: 'Management', duration: '4 days', students: '21,000+',
    price: 60000, color: '#2c5282',
    tagline: 'Lead Any Project',
    desc: 'The global standard for project managers, recognized in 200+ countries.',
    image: `${IMG}/05/pmp-6th-1.jpg`,
  },
  {
    id: 5, code: 'CISM', title: 'Certified Information Security Manager',
    category: 'Management', duration: '4 days', students: '7,200+',
    price: 60000, color: '#4a4a8a',
    tagline: 'Advance Into Leadership',
    desc: 'Validates IS management expertise for senior security professionals.',
    image: `${IMG}/05/cism.jpg`,
  },
];

export function AccordionCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 px-4 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>
              Course Library
            </p>
            <SplitHeading text="Top Certifications" textColor='var(--foreground)' />
          </div>
          <a
            href="/courses"
            className="flex items-center gap-2 text-sm font-semibold group"
            style={{ color: '#00A2B6' }}
          >
            View all courses
            <AnimatedArrow color="#00A2B6" />
          </a>
        </div>

        {/* Accordion row */}
        <div className="relative flex gap-3 overflow-x-auto pb-4 snap-x">
          {CARDS.map((card, i) => {
            const isActive = i === active;
            return (
              <motion.div
                key={card.id}
                layout
                animate={{ width: isActive ? 384 : 80 }}
                transition={{ type: 'spring', stiffness: 320, damping: 38 }}
                onClick={() => setActive(i)}
                className="relative flex-shrink-0 cursor-pointer snap-start"
                style={{
                  height: 384,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: `1px solid ${isActive ? card.color + '60' : 'var(--border)'}`,
                  backgroundColor: 'var(--card)',
                }}
              >
                {/* Collapsed state */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      style={{
                        color: card.color,
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.code}
                    </span>
                  </div>
                )}

                {/* Active / expanded state */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      className="absolute inset-0 flex flex-col p-6"
                      style={{ width: 384 }}
                    >
                      {/* Background thumbnail with gradient overlay */}
                      {card.image && (
                        <div className="absolute inset-0 rounded-3xl overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover"
                            style={{ opacity: 0.18 }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Color band top */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                        style={{ backgroundColor: card.color }}
                      />

                      {/* Category pill */}
                      <div className="flex items-center justify-between mb-auto">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: card.color }}
                        >
                          {card.category}
                        </span>
                        <span
                          className="text-xs font-black"
                          style={{ color: '#00A2B6', fontSize: '1.5rem', lineHeight: 1 }}
                        >
                          {card.code}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="mt-auto">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: card.color }}>
                          {card.tagline}
                        </p>
                        <h3
                          className="mb-3 leading-snug text-foreground" style={{ fontSize: '1.05rem', fontWeight: 700 }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-xs mb-5 leading-relaxed text-muted-foreground">
                          {card.desc}
                        </p>

                        <div className="flex items-center gap-4 mb-5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {card.duration}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            {card.students}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-black text-foreground" style={{ fontSize: '1.25rem' }}>
                              ₦{card.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ backgroundColor: '#00A2B6' }}
                          >
                            Enroll <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glow on active */}
                {isActive && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-3xl"
                    style={{
                      background: `radial-gradient(ellipse at 50% 100%, ${card.color}22 0%, transparent 70%)`,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mt-6">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              style={{
                width: i === active ? 24 : 6,
                height: 6,
                backgroundColor: i === active ? '#00A2B6' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Character-split heading (System F - simplified) ──────────── */
function SplitHeading({ text, textColor }: { text: string; textColor: string }) {
  return (
    <h2
      style={{
        color: textColor,
        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
        fontWeight: 800,
        lineHeight: 1.1,
      }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.025, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </h2>
  );
}

/* ── Animated arrow (System D) ──────────────────────────────────── */
function AnimatedArrow({ color }: { color: string }) {
  return (
    <span className="relative inline-flex items-center overflow-hidden" style={{ width: 20, height: 16 }}>
      <motion.span
        className="absolute inset-0 flex items-center"
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ color }}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.span>
    </span>
  );
}
