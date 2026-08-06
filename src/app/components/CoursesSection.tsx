import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Clock, Monitor, ArrowRight, Zap, BookOpen, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { apiGetCourses } from '../lib/api';
import type { ApiCourse } from '../lib/api';

/* ── category → dark header colour ───────────────────────────────────────── */
function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    cybersecurity: '#0B1D3A', 'cloud security': '#0d2347', networking: '#17202a',
    cloud: '#0d2347', management: '#154360', audit: '#1a3a6e',
    privacy: '#1a3a6e', 'entry level': '#1a5276', 'it service mgmt': '#154360',
  };
  return map[(cat ?? '').toLowerCase()] ?? '#0B1D3A';
}

const CATEGORY_ACCENT: Record<string, string> = {
  cybersecurity: '#dc2626', 'entry level': '#16a34a', management: '#7c3aed',
  networking: '#2563eb', 'cloud security': '#0891b2', audit: '#d97706',
  cloud: '#0284c7', 'it service mgmt': '#6366f1', privacy: '#db2777',
};

function getCategoryAccent(cat: string): string {
  return CATEGORY_ACCENT[(cat ?? '').toLowerCase()] ?? '#F97316';
}

/* Derive a short code label from the course title */
function deriveCode(title: string): string {
  const acronym = title.match(/\b[A-Z]/g)?.join('') ?? '';
  if (acronym.length >= 2 && acronym.length <= 6) return acronym;
  return title.split(' ')[0].toUpperCase().slice(0, 6);
}

/* ── Skeleton card ────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ width: 280, border: '2px solid transparent' }}
    >
      <div className="px-6 pt-6 pb-8" style={{ backgroundColor: '#0B1D3A' }}>
        <div className="h-5 w-20 rounded mb-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="h-10 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.10)' }} />
      </div>
      <div className="bg-white px-6 pt-5 pb-5">
        <div className="h-4 w-full rounded mb-2 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="h-4 w-3/4 rounded mb-4 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="h-3 w-28 rounded mb-2 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="h-3 w-24 rounded mb-5 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="h-9 w-full rounded-xl mb-2 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="h-9 w-full rounded-xl animate-pulse" style={{ background: '#f3f4f6' }} />
      </div>
    </div>
  );
}

/* ── Course card ──────────────────────────────────────────────────────────── */
function CourseCard({
  course,
  isActive,
  onClick,
  index,
}: {
  course: ApiCourse;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion    = useReducedMotion();
  const accent   = getCategoryAccent(course.category ?? '');
  const bgColor  = categoryColor(course.category ?? '');
  const code     = deriveCode(course.title);
  const price    = course.price ? `₦${course.price.toLocaleString()}` : 'Contact us';
  const format   = course.format
    ? course.format.charAt(0).toUpperCase() + course.format.slice(1)
    : 'Online';
  const level    = course.level ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden"
      style={{
        width: 280,
        boxShadow: hovered
          ? '0 12px 36px rgba(11,42,74,0.18)'
          : isActive
          ? '0 8px 24px rgba(11,42,74,0.12)'
          : '0 2px 8px rgba(11,42,74,0.06)',
        border: isActive ? `2px solid #F97316` : '2px solid transparent',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      {/* ── Card header ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        {/* Thumbnail — visible image strip when the API provides one */}
        {course.image && (
          <div style={{ position: 'relative', height: 112, overflow: 'hidden' }}>
            <img
              src={course.image}
              alt={course.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* gradient so the code text below stays readable */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
          </div>
        )}

        {/* Code + category badge row */}
        <div className="px-6 pt-5 pb-7 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: `radial-gradient(ellipse at 30% 40%, ${accent}33 0%, transparent 70%)` }}
          />

          <div className="flex items-start justify-between mb-4 relative">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
              style={{ background: `${accent}44`, letterSpacing: '0.04em', fontFamily: 'var(--ace-font)' }}
            >
              {course.category ?? 'Course'}
            </span>
            <AnimatePresence>
              {isActive && (
                <motion.span
                  key="dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: '#F97316' }}
                />
              )}
            </AnimatePresence>
          </div>

          <div
            className="text-4xl font-black text-white opacity-90 mb-1 relative"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: 'var(--ace-font)' }}
          >
            {code}
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="bg-white px-6 pt-5 relative overflow-hidden">
        <h3
          className="text-gray-900 mb-3 leading-snug"
          style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--ace-font)' }}
        >
          {course.title}
        </h3>

        {/* Meta rows: duration / format / level */}
        <div className="flex flex-col gap-1.5 mb-4">
          {course.duration && (
            <div className="flex items-center gap-2 text-gray-500 text-xs" style={{ fontFamily: 'var(--ace-font)' }}>
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{course.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500 text-xs" style={{ fontFamily: 'var(--ace-font)' }}>
            <Monitor className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{format}</span>
          </div>
          {level && (
            <div
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: accent, fontFamily: 'var(--ace-font)' }}
            >
              <BarChart2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{level}</span>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="relative" style={{ minHeight: 108 }}>
          <div className="flex flex-col gap-2 pb-5">
            <Link
              to={`/courses/${course.id}`}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 text-center block"
              style={{ backgroundColor: '#0B1D3A', fontFamily: 'var(--ace-font)' }}
              onClick={e => e.stopPropagation()}
            >
              View Course
            </Link>
            <div
              className="w-full py-2.5 rounded-xl text-sm font-semibold border text-center"
              style={{ color: '#F97316', borderColor: '#F97316', fontFamily: 'var(--ace-font)' }}
            >
              {price}
            </div>
          </div>

          {/* Hover overlay — Enroll Now CTA */}
          <AnimatePresence>
            {hovered && !shouldReduceMotion && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-0 flex flex-col gap-2 pb-5 bg-white"
              >
                <Link
                  to={`/courses/${course.id}`}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-95 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F97316', fontFamily: 'var(--ace-font)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <Zap className="h-4 w-4" />
                  Enroll Now
                </Link>
                <Link
                  to={`/courses/${course.id}`}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 text-center block"
                  style={{ backgroundColor: '#0B1D3A', fontFamily: 'var(--ace-font)' }}
                  onClick={e => e.stopPropagation()}
                >
                  View Course
                </Link>
                <div
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border text-center"
                  style={{ color: '#F97316', borderColor: '#F97316', fontFamily: 'var(--ace-font)' }}
                >
                  {price}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export function CoursesSection() {
  const [courses, setCourses]             = useState<ApiCourse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [active, setActive]               = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterKey, setFilterKey]         = useState(0);

  const scrollRef       = useRef<HTMLDivElement>(null);
  const sectionRef      = useRef<HTMLElement>(null);
  const tabRefs         = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  /* ── fetch on mount ─────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGetCourses()
      .then(data => { if (!cancelled) { setCourses(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Could not load courses.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  /* ── derived state ──────────────────────────────────────────────────── */
  const allCategories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))] as string[];
  const filtered = selectedCategory === 'All' ? courses : courses.filter(c => c.category === selectedCategory);
  const activeCourse = filtered[Math.min(active, Math.max(0, filtered.length - 1))];

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActive(0);
    setFilterKey(k => k + 1);
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  /* Pill underline on active category tab */
  useEffect(() => {
    const idx = allCategories.indexOf(selectedCategory);
    const el = tabRefs.current[idx];
    const container = tabContainerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setPillStyle({ left: eRect.left - cRect.left, width: eRect.width });
    }
  }, [selectedCategory, allCategories.join(',')]);

  return (
    <section
      ref={sectionRef}
      id="courses"
      className="py-20 lg:py-28"
      style={{ backgroundColor: '#F8FAFC', fontFamily: 'var(--ace-font)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F97316', fontFamily: 'var(--ace-font)' }}>
            WE ARE ACECERTY
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeCourse?.id ?? 'loading'}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="text-gray-900 mb-4 leading-tight"
                  style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}
                >
                  {loading ? 'Our Training Catalogue' : (activeCourse?.title ?? 'Explore Our Courses')}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={(activeCourse?.id ?? 'loading') + '-desc'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: '1.05rem', fontFamily: 'var(--ace-font)' }}
                >
                  {loading
                    ? 'Loading available courses from our catalogue…'
                    : (activeCourse?.description ?? 'Browse our full range of professional certification courses.')}
                </motion.p>
              </AnimatePresence>
            </div>
            {!loading && filtered.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium flex-shrink-0" style={{ fontFamily: 'var(--ace-font)' }}>
                <motion.span
                  key={active + '-' + selectedCategory}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {Math.min(active, filtered.length - 1) + 1}
                </motion.span>
                <span>/ {filtered.length}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category filter tabs — hidden while loading */}
        {!loading && courses.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div
              ref={tabContainerRef}
              className="relative flex items-center gap-1 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {pillStyle.width > 0 && (
                <motion.div
                  className="absolute top-0 rounded-full pointer-events-none z-0"
                  animate={{ left: pillStyle.left, width: pillStyle.width }}
                  transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ height: '100%', backgroundColor: '#0B1D3A' }}
                />
              )}
              {allCategories.map((cat, i) => (
                <button
                  key={cat}
                  ref={el => (tabRefs.current[i] = el)}
                  onClick={() => handleCategoryChange(cat)}
                  className="relative z-10 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors duration-200"
                  style={{ color: selectedCategory === cat ? '#fff' : '#6b7280', fontFamily: 'var(--ace-font)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Carousel controls row */}
        {!loading && courses.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={selectedCategory}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium text-gray-500"
                style={{ fontFamily: 'var(--ace-font)' }}
              >
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* ── Cards / Skeleton / Empty states ── */}
        <div
          ref={scrollRef}
          className="relative flex gap-5 overflow-x-auto pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Loading skeletons */}
          {loading && (
            <div className="flex gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              className="w-full flex flex-col items-center justify-center py-16 gap-3"
              style={{ color: '#9ca3af', fontFamily: 'var(--ace-font)' }}
            >
              <BookOpen className="h-10 w-10 opacity-30" />
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(''); setLoading(true);
                  apiGetCourses().then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => { setError('Could not load courses.'); setLoading(false); });
                }}
                className="text-xs px-4 py-2 rounded-full border border-gray-300 hover:border-gray-500 transition-colors"
                style={{ fontFamily: 'var(--ace-font)' }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && courses.length === 0 && (
            <div
              className="w-full flex flex-col items-center justify-center py-16 gap-3"
              style={{ color: '#9ca3af', fontFamily: 'var(--ace-font)' }}
            >
              <BookOpen className="h-10 w-10 opacity-30" />
              <p className="text-sm">No courses available at the moment.</p>
            </div>
          )}

          {/* Empty filtered state */}
          {!loading && !error && courses.length > 0 && filtered.length === 0 && (
            <div
              className="w-full flex flex-col items-center justify-center py-16 gap-3"
              style={{ color: '#9ca3af', fontFamily: 'var(--ace-font)' }}
            >
              <p className="text-sm">No courses in this category.</p>
              <button
                onClick={() => handleCategoryChange('All')}
                className="text-xs px-4 py-2 rounded-full border border-gray-300 hover:border-gray-500 transition-colors"
                style={{ fontFamily: 'var(--ace-font)' }}
              >
                Show all
              </button>
            </div>
          )}

          {/* Live course cards */}
          {!loading && !error && filtered.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div key={filterKey} className="flex gap-5">
                {filtered.map((c, i) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    isActive={activeCourse?.id === c.id}
                    onClick={() => setActive(i)}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Mobile dot indicators */}
        {!loading && filtered.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 lg:hidden">
            {filtered.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                animate={{
                  width: active === i ? 24 : 8,
                  backgroundColor: active === i ? '#F97316' : '#d1d5db',
                }}
                transition={{ duration: 0.25 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Browse all CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Link to="/courses">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3, boxShadow: '0 12px 28px rgba(11,29,58,0.25)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white shadow-lg cursor-pointer"
              style={{ backgroundColor: '#0B1D3A', fontFamily: 'var(--ace-font)' }}
            >
              View All Courses <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
