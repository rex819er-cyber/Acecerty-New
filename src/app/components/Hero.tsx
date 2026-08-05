import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Sparkles, Zap, Tag } from 'lucide-react';
import { Link } from 'react-router';
import { ConstellationCanvas } from './ConstellationCanvas';
import { useApi, apiGetCourses, formatPrice, type ApiCourse } from '../lib/api';

/* Vendor marks, not fabricated records — these are the real certification
   bodies the platform trains for. */
const CERT_BADGES = [
  { name: 'CompTIA', color: '#E31837', abbr: 'C+' },
  { name: 'Cisco', color: '#1BA0D7', abbr: 'CI' },
  { name: 'AWS', color: '#FF9900', abbr: 'AWS' },
  { name: 'Microsoft', color: '#00A4EF', abbr: 'MS' },
  { name: 'PMI', color: '#003087', abbr: 'PMI' },
  { name: '(ISC)²', color: '#6B21A8', abbr: 'ISC' },
  { name: 'EC-Council', color: '#00A651', abbr: 'ECC' },
  { name: 'ISACA', color: '#1A5276', abbr: 'ISA' },
];

/* Promotes one real, currently-discounted course pulled from the catalog —
   never a fabricated "bundle" — so the price/savings shown are always live. */
function DealPromoCard({ course }: { course: ApiCourse }) {
  const price = course.price ?? 0;
  const original = course.originalPrice ?? price;
  const onSale = original > price;
  const savings = onSale ? Math.round((1 - price / original) * 100) : 0;
  const tags = [course.category, course.level, course.format].filter((t): t is string => Boolean(t));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 55%, #051520 100%)',
        border: '1px solid rgba(0,162,182,0.25)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,162,182,0.1) inset',
      }}
    >
      {/* Glow accent top-right */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,162,182,0.18) 0%, transparent 65%)', filter: 'blur(30px)', transform: 'translate(40%, -40%)' }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--ace-brand)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              Featured Deal
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, fontFamily: 'var(--ace-font)' }}>
            {course.shortTitle || course.title}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: 'var(--ace-font)' }}>
            {course.description || 'Industry-recognised IT certification training'}
          </p>
        </div>
        {onSale && (
          <span
            className="flex-shrink-0 px-2.5 py-1.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: 'rgba(0,162,182,0.2)', border: '1px solid rgba(0,162,182,0.35)' }}
          >
            <Tag className="h-3 w-3" style={{ color: 'var(--ace-brand)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              {savings}% OFF
            </span>
          </span>
        )}
      </div>

      {/* Course tags */}
      {tags.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full"
              style={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--ace-font)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginInline: 24 }} />

      {/* Pricing & CTA */}
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--ace-brand)', lineHeight: 1, fontFamily: 'var(--ace-font)' }}>
              {formatPrice(price, course.currency)}
            </span>
          </div>
          {onSale && (
            <div className="flex items-center gap-2 mt-1">
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontFamily: 'var(--ace-font)' }}>
                {formatPrice(original, course.currency)}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22c55e', fontFamily: 'var(--ace-font)' }}>
                Save {formatPrice(original - price, course.currency)}
              </span>
            </div>
          )}
        </div>
        <Link
          to={`/courses/${course.slug || course.id}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white transition-all active:scale-95 flex-shrink-0"
          style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 18px rgba(0,162,182,0.4)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
        >
          <Zap className="h-3.5 w-3.5" />
          Enroll Now
        </Link>
      </div>

      {/* Guarantee strip */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--ace-font)' }}>
            30-day money-back guarantee · Exam-ready content · Free retake support
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DealPromoCardSkeleton() {
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden animate-pulse"
      style={{ background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 55%, #051520 100%)', border: '1px solid rgba(0,162,182,0.15)', minHeight: 320 }}
    />
  );
}

function CertBadgesStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ace-text-muted)', marginBottom: 10, fontFamily: 'var(--ace-font)' }}>
        Trusted by top certification bodies
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {CERT_BADGES.map((badge) => (
          <div
            key={badge.name}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', cursor: 'default' }}
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: badge.color, flexShrink: 0 }}
            >
              <span style={{ fontSize: '0.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--ace-font)' }}>
                {badge.abbr.slice(0, 2)}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--ace-font)', whiteSpace: 'nowrap' }}>
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function Hero() {
  const { data: courses, loading } = useApi(() => apiGetCourses({ limit: 100 }), []);

  /* Picks one course at random on each load, preferring ones actually on
     sale so the promo card never advertises a discount that isn't real. */
  const dealCourse = useMemo(() => {
    const list = courses ?? [];
    const discounted = list.filter(c => (c.originalPrice ?? 0) > (c.price ?? 0));
    const pool = discounted.length ? discounted : list;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [courses]);

  const showDealPanel = loading || !!dealCourse;

  return (
    <section
      className="bg-background text-foreground relative flex items-center pt-16 sm:pt-20 overflow-hidden"
      style={{ fontFamily: 'var(--ace-font)', minHeight: '100vh' }}
    >
      {/* Constellation particle engine */}
      <ConstellationCanvas />

      {/* Cyan glow blob — top left */}
      <div
        className="absolute -top-40 -left-40 pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, var(--ace-brand-glow) 0%, transparent 65%)', filter: 'blur(40px)' }}
      />
      {/* Glow blob — bottom right */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,162,182,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className={showDealPanel ? 'grid lg:grid-cols-2 gap-10 lg:gap-16 items-center' : 'max-w-3xl'}>

          {/* ── LEFT: Copy ─────────────────────────────────────────── */}
          <div>
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.02 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 bg-muted border border-border"
            >
              <span className="h-2 w-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                Enrolling now — start anytime
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.03em', fontFamily: 'var(--ace-font)' }}
              className="mb-6 text-foreground"
            >
              Learn Today.
              <br />
              <span style={{ color: 'var(--ace-brand)' }}>Lead Tomorrow.</span>
              <span style={{ fontSize: '0.7em', color: 'var(--muted-foreground)' }}>™</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="mb-7 max-w-lg leading-relaxed text-muted-foreground"
              style={{ fontSize: '1.08rem', fontFamily: 'var(--ace-font)' }}
            >
              Accelerated IT certification training designed to unlock new skills,
              fast-track your career, and deliver results — today, not someday.
            </motion.p>

            {/* Guarantee pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 bg-muted border border-border"
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
                Exam-Day Ready · Free Retake Guarantee · ₦60,000 Flat Rate
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.92rem', boxShadow: '0 8px 24px rgba(0,162,182,0.30)', fontFamily: 'var(--ace-font)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
              >
                Browse Courses <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/training"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all active:scale-95 text-foreground"
                style={{ fontSize: '0.92rem', backgroundColor: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'var(--ace-font)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ace-brand)'; (e.currentTarget as HTMLElement).style.color = 'var(--ace-brand)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; }}
              >
                View Training
              </Link>
            </motion.div>

            {/* Certification badges strip */}
            <CertBadgesStrip />
          </div>

          {/* ── RIGHT: Featured deal, sourced live from the course catalog ── */}
          {showDealPanel && (
            <div className="relative">
              {/* Glow behind card */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,162,182,0.15) 0%, transparent 65%)', filter: 'blur(24px)', transform: 'scale(1.2)' }}
              />
              {dealCourse ? <DealPromoCard course={dealCourse} /> : <DealPromoCardSkeleton />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
