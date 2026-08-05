import React, { useState, useMemo, useCallback } from 'react';
import { Search, Clock, Play, HelpCircle, X, ChevronRight, ChevronLeft, BookOpen, Wifi } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useApi, apiGetCourses, formatPrice } from '../lib/api';
import type { ApiCourse } from '../lib/api';

const COURSES_PER_PAGE = 12;

/* Every card is a course the backend actually publishes. */
interface CatalogCourse {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  videos: string;
  questions: string;
  category: string;
  price: number;
  currency: string;
}

function fromApi(c: ApiCourse): CatalogCourse {
  return {
    id:          c.id,
    slug:        c.slug,
    title:       c.title,
    description: c.description || '',
    image:       c.image || '',
    duration:    c.duration || '—',
    videos:      c.videos || '—',
    questions:   c.questions || '—',
    category:    c.category || 'IT Training',
    price:       c.price ?? 0,
    currency:    c.currency,
  };
}

const CATEGORY_ACCENT: Record<string, string> = {
  CompTIA:            '#E31837',
  Cisco:              '#1BA0D7',
  AWS:                '#FF9900',
  Microsoft:          '#00A4EF',
  'Project Management': '#6366F1',
  Security:           '#8B5CF6',
  DevOps:             '#10B981',
  Development:        '#F59E0B',
  Design:             '#EC4899',
  Marketing:          '#F97316',
  Business:           '#14B8A6',
  Healthcare:         '#22C55E',
  'AI & Data':        '#A855F7',
  'IT Training':      'var(--ace-brand)',
};

function accentFor(category: string): string {
  return CATEGORY_ACCENT[category] ?? 'var(--ace-brand)';
}

// ─── Meta badge ────────────────────────────────────────────────────────────
function MetaBadge({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  accent: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap"
      style={{
        backgroundColor: accent + '18',
        border: `1px solid ${accent}35`,
        color: accent,
        fontSize: '0.67rem',
        fontWeight: 600,
        fontFamily: 'var(--ace-font)',
      }}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      {label}
    </span>
  );
}

// ─── Course card ───────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: CatalogCourse; index: number }) {
  const accent = accentFor(course.category);
  /* Live courses resolve by slug; CSV rows keep their bundled id. */
  const href = `/courses/${encodeURIComponent(course.slug ?? course.id)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--ace-shadow-sm)',
      }}
    >
      {/* ── Thumbnail ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ height: 172, backgroundColor: 'var(--ace-surface-alt)' }}
      >
        {course.image ? (
          <ImageWithFallback
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-4"
            style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)' }}
          >
            <span
              className="text-white/80 leading-tight"
              style={{ fontSize: 'clamp(1rem,2.5vw,1.3rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}
            >
              {course.title.split(' ').slice(0, 4).join(' ')}
            </span>
          </div>
        )}

        {/* Category pill */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="px-2.5 py-1 rounded-full"
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              backgroundColor: accent + 'DD',
              color: '#fff',
              backdropFilter: 'blur(6px)',
              fontFamily: 'var(--ace-font)',
            }}
          >
            {course.category}
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3
          className="mb-2 leading-snug line-clamp-2"
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--foreground)',
            fontFamily: 'var(--ace-font)',
          }}
        >
          {course.title}
        </h3>

        {/* Description */}
        <p
          className="flex-1 mb-3 line-clamp-2 leading-relaxed"
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--ace-font)',
          }}
        >
          {course.description}
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.duration !== '—' && (
            <MetaBadge icon={Clock} label={course.duration} accent="var(--ace-brand)" />
          )}
          {course.videos !== '—' && (
            <MetaBadge icon={Play} label={course.videos} accent="#8B5CF6" />
          )}
          {course.questions !== '—' && (
            <MetaBadge icon={HelpCircle} label={course.questions} accent="#F59E0B" />
          )}
        </div>

        {/* ── Footer: price + CTA ────────────────────────── */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              color: 'var(--ace-brand)',
              fontFamily: 'var(--ace-font)',
            }}
          >
            {formatPrice(course.price, course.currency)}
          </span>

          <Link
            to={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 hover:gap-2"
            style={{
              backgroundColor: 'var(--ace-brand)',
              fontSize: '0.78rem',
              fontFamily: 'var(--ace-font)',
              boxShadow: '0 2px 10px rgba(0,162,182,0.25)',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)')
            }
          >
            Enroll Now <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  // Build visible page numbers: always show first, last, current ±1, with ellipsis
  const pages: (number | '…')[] = [];
  const addPage = (n: number) => { if (!pages.includes(n)) pages.push(n); };

  addPage(1);
  if (currentPage > 3) pages.push('…');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) addPage(i);
  if (currentPage < totalPages - 2) pages.push('…');
  if (totalPages > 1) addPage(totalPages);

  return (
    <div className="flex items-center justify-center gap-2 py-10 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: currentPage === 1 ? 'var(--muted-foreground)' : 'var(--foreground)',
          opacity: currentPage === 1 ? 0.4 : 1,
          fontSize: '0.82rem',
          fontFamily: 'var(--ace-font)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', padding: '0 4px', fontFamily: 'var(--ace-font)' }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className="px-4 py-2.5 rounded-xl font-bold transition-all"
            style={{
              minWidth: 44,
              backgroundColor: currentPage === p ? 'var(--ace-brand)' : 'var(--card)',
              color: currentPage === p ? '#fff' : 'var(--muted-foreground)',
              border: currentPage === p ? '1px solid var(--ace-brand)' : '1px solid var(--border)',
              boxShadow: currentPage === p ? '0 4px 14px rgba(0,162,182,0.30)' : 'none',
              fontSize: '0.85rem',
              fontFamily: 'var(--ace-font)',
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: currentPage === totalPages ? 'var(--muted-foreground)' : 'var(--foreground)',
          opacity: currentPage === totalPages ? 0.4 : 1,
          fontSize: '0.82rem',
          fontFamily: 'var(--ace-font)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main catalog page ─────────────────────────────────────────────────────
export default function CourseCatalog() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  /* GET /api/courses — search and paging stay client-side so the filters stay
     instant once the catalog is loaded. */
  const { data, loading, error, slowConnection } = useApi(() => apiGetCourses({ limit: 100 }), []);

  const allCourses = useMemo(() => (data ?? []).map(fromApi), [data]);

  const ALL_CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(allCourses.map((c) => c.category))).sort()],
    [allCourses],
  );

  // Filtered master list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchCat = activeCategory === 'All' || c.category === activeCategory;
      return matchQ && matchCat;
    });
  }, [allCourses, query, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / COURSES_PER_PAGE));

  // Clamp page when filters change
  const safePage = Math.min(page, totalPages);

  const currentCourses = useMemo(
    () => filtered.slice((safePage - 1) * COURSES_PER_PAGE, safePage * COURSES_PER_PAGE),
    [filtered, safePage]
  );

  const handlePageChange = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages]
  );

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  }, []);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    setPage(1);
  }, []);

  const pageStart = (safePage - 1) * COURSES_PER_PAGE + 1;
  const pageEnd = Math.min(safePage * COURSES_PER_PAGE, filtered.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* ── Hero header ────────────────────────────────────── */}
      <div
        className="pt-24 sm:pt-28 pb-14 px-4"
        style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 60%,#051520 100%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ace-brand)',
              marginBottom: 10,
              fontFamily: 'var(--ace-font)',
            }}
          >
            Course Catalog
          </p>
          <h1
            className="text-white leading-tight mb-3"
            style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}
          >
            Find Your Next Certification
          </h1>
          <p
            className="mb-8"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              maxWidth: 520,
              fontFamily: 'var(--ace-font)',
            }}
          >
            {allCourses.length} courses — from accelerated bootcamps to self-paced online training.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by name, certification, or category…"
              className="w-full pl-12 pr-10 py-4 rounded-2xl outline-none shadow-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff',
                fontSize: '0.9rem',
                fontFamily: 'var(--ace-font)',
              }}
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter + grid area ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">

        {slowConnection && loading && (
          <div
            className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl"
            style={{ background: 'var(--ace-brand-light)', color: 'var(--ace-brand)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}
          >
            <Wifi className="h-4 w-4 animate-pulse flex-shrink-0" /> Loading the catalog…
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl"
            style={{ background: 'var(--muted)', color: 'var(--destructive)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}
          >
            <X className="h-4 w-4 flex-shrink-0" /> Could not load the catalog: {error}
          </div>
        )}

        {/* Category chips — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const accent = cat === 'All' ? 'var(--ace-brand)' : accentFor(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className="flex-shrink-0 px-4 py-2 rounded-full font-semibold transition-all"
                style={{
                  fontSize: '0.8rem',
                  backgroundColor: isActive ? accent : 'var(--card)',
                  color: isActive ? '#fff' : 'var(--muted-foreground)',
                  border: isActive ? `1px solid ${accent}` : '1px solid var(--border)',
                  fontFamily: 'var(--ace-font)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Result count + page indicator */}
        <div className="flex items-center justify-between mb-6">
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
            Showing <strong style={{ color: 'var(--foreground)' }}>{pageStart}–{pageEnd}</strong> of{' '}
            <strong style={{ color: 'var(--foreground)' }}>{filtered.length}</strong> courses
            {activeCategory !== 'All' && (
              <> in <strong style={{ color: accentFor(activeCategory) }}>{activeCategory}</strong></>
            )}
          </p>
          {(query || activeCategory !== 'All') && (
            <button
              onClick={() => { setQuery(''); setActiveCategory('All'); setPage(1); }}
              className="flex items-center gap-1.5"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Loading skeleton ─────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 350, backgroundColor: 'var(--muted)' }} />
            ))}
          </div>
        )}

        {/* ── No results ───────────────────────────────────── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <BookOpen className="h-7 w-7" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>
              {allCourses.length === 0 ? 'No courses have been published yet' : 'No courses match your search'}
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>
              {allCourses.length === 0
                ? 'Published courses will appear here as soon as they go live.'
                : 'Try different keywords or browse all categories.'}
            </p>
            {allCourses.length > 0 && (
              <button
                onClick={() => { setQuery(''); setActiveCategory('All'); setPage(1); }}
                className="px-6 py-3 rounded-full font-bold text-white"
                style={{ backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}
              >
                Show All Courses
              </button>
            )}
          </div>
        )}

        {/* ── Course grid ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {currentCourses.length > 0 && (
            <motion.div
              key={`page-${safePage}-${activeCategory}-${query}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {currentCourses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ───────────────────────────────────── */}
        {totalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
