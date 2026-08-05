import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { useApi, apiGetCourses, formatPrice } from '../lib/api';
import type { ApiCourse } from '../lib/api';

interface Card {
  id: string | number;
  code: string;
  title: string;
  category: string;
  duration: string;
  students: string;
  price: number;
  currency: string;
  color: string;
  tagline: string;
  desc: string;
  image?: string;
  /** Where "Enroll" goes — a real slug for live courses. */
  href?: string;
}


/* A course carries no colour column, so each card gets a stable hue derived
   from its title. Everything else on the card is real course data. */
const PALETTE = ['#005f6b', '#c0392b', '#1ba0d8', '#ff9900', '#2c5282', '#4a4a8a'];
const paletteFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

function toCard(c: ApiCourse): Card {
  const students = Number(c.students ?? 0);
  return {
    id:       c.id,
    code:     c.shortTitle ?? c.title.split(' ')[0],
    title:    c.title,
    category: c.category ?? '',
    duration: c.duration ?? '',
    students: students > 0 ? `${students.toLocaleString()}+` : '',
    price:    c.price ?? 0,
    currency: c.currency,
    color:    paletteFor(c.title),
    tagline:  c.category ?? '',
    desc:     c.description || '',
    image:    c.image,
    href:     c.slug ? `/courses/${c.slug}` : undefined,
  };
}

export function AccordionCarousel() {
  const [active, setActive] = useState(0);

  /* GET /api/courses */
  const { data, loading } = useApi(() => apiGetCourses({ limit: 6 }), []);
  const cards: Card[] = useMemo(() => (data ?? []).slice(0, 6).map(toCard), [data]);

  const activeIdx = Math.min(active, cards.length - 1);

  /* Nothing published yet — drop the section rather than show placeholders. */
  if (!loading && cards.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>
              Course Library
            </p>
            <SplitHeading text="Top Certifications" textColor='var(--foreground)' />
          </div>
          <Link
            to="/courses"
            className="flex items-center gap-2 text-sm font-semibold group"
            style={{ color: '#00A2B6' }}
          >
            View all courses
            <AnimatedArrow color="#00A2B6" />
          </Link>
        </div>

        {/* Accordion row */}
        <div className="relative flex gap-3 overflow-x-auto pb-4 snap-x">
          {loading && cards.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={`sk-${i}`} className="flex-shrink-0 rounded-3xl animate-pulse"
              style={{ width: i === 0 ? 384 : 80, height: 384, backgroundColor: 'var(--muted)' }} />
          ))}
          {cards.map((card, i) => {
            const isActive = i === activeIdx;
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
                          {card.duration && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {card.duration}
                            </div>
                          )}
                          {card.students && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              {card.students}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-black text-foreground" style={{ fontSize: '1.25rem' }}>
                              {formatPrice(card.price, card.currency)}
                            </p>
                          </div>
                          <Link
                            to={card.href ?? '/courses'}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ backgroundColor: '#00A2B6' }}
                          >
                            Enroll <ArrowRight className="h-4 w-4" />
                          </Link>
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
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeIdx ? 24 : 6,
                height: 6,
                backgroundColor: i === activeIdx ? '#00A2B6' : 'var(--border)',
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
