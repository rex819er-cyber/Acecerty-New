import React, { useState, useMemo } from 'react';
import { Search, Clock, Play, HelpCircle, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CSV_COURSES, COURSES_PER_PAGE, TOTAL_CSV_PAGES, getCsvCoursePage } from '../data/csvCourses';
import type { CsvCourse } from '../data/csvCourses';
import { COURSES } from '../data/courses';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const ALL_CATEGORIES = Array.from(new Set(CSV_COURSES.map((c) => c.category))).sort();

function MetaBadge({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
      style={{ backgroundColor: color + '18', border: `1px solid ${color}30`, fontSize: '0.68rem', fontWeight: 600, color, fontFamily: 'var(--ace-font)' }}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      {label}
    </span>
  );
}

function CsvCourseCard({ course }: { course: CsvCourse }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: hovered ? 'var(--ace-shadow-lg)' : 'var(--ace-shadow-sm)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 168 }}>
        <ImageWithFallback
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full"
            style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(0,162,182,0.88)', color: '#fff', backdropFilter: 'blur(6px)', fontFamily: 'var(--ace-font)' }}
          >
            {course.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="mb-2 leading-snug" style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
          {course.title}
        </h3>

        <p className="leading-relaxed mb-3 flex-1" style={{ fontSize: '0.76rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          {course.description.slice(0, 95)}…
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <MetaBadge icon={Clock} label={course.duration} color="var(--ace-brand)" />
          <MetaBadge icon={Play} label={course.videos} color="#8B5CF6" />
          {course.questions !== '—' && (
            <MetaBadge icon={HelpCircle} label={course.questions} color="#F59E0B" />
          )}
        </div>

        {/* Price + View link */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
            ₦{course.price.toLocaleString()}
          </span>
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--ace-brand)', color: '#fff', fontSize: '0.78rem', fontFamily: 'var(--ace-font)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
          >
            View Course <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function CourseCatalog() {
  const { addToCart, items } = useCart();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return CSV_COURSES.filter((c) => {
      const matchQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase());
      const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [query, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / COURSES_PER_PAGE);
  const currentPageCourses = filtered.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE);

  const clearFilters = () => { setQuery(''); setCategoryFilter('all'); setPage(1); };
  const hasFilters = query || categoryFilter !== 'all';

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* Page hero — always dark */}
      <div className="pt-24 sm:pt-28 pb-14 px-4" style={{ background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ace-brand)', marginBottom: 10, fontFamily: 'var(--ace-font)' }}>
            Course Catalog
          </p>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
            Find Your Next Certification
          </h1>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: 520, fontFamily: 'var(--ace-font)' }}>
            Browse {CSV_COURSES.length}+ courses — from accelerated bootcamps to self-paced online training.
            All priced at ₦60,000 flat.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by course name, certification, or category…"
              className="w-full pl-12 pr-10 py-4 rounded-2xl outline-none shadow-lg"
              style={{ fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--ace-font)' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setPage(1); }} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Category filter chips */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          <button
            onClick={() => { setCategoryFilter('all'); setPage(1); }}
            className="px-4 py-2 rounded-full font-semibold transition-all"
            style={{ fontSize: '0.82rem', backgroundColor: categoryFilter === 'all' ? 'var(--ace-brand)' : 'var(--card)', color: categoryFilter === 'all' ? '#fff' : 'var(--muted-foreground)', border: '1px solid var(--border)', fontFamily: 'var(--ace-font)' }}
          >
            All Categories
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(categoryFilter === cat ? 'all' : cat); setPage(1); }}
              className="px-4 py-2 rounded-full font-semibold transition-all"
              style={{ fontSize: '0.82rem', backgroundColor: categoryFilter === cat ? 'var(--ace-brand)' : 'var(--card)', color: categoryFilter === cat ? '#fff' : 'var(--muted-foreground)', border: '1px solid var(--border)', fontFamily: 'var(--ace-font)' }}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              {filtered.length} courses
            </span>
          </div>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--muted)' }}>
              <Search className="h-7 w-7" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 8, fontFamily: 'var(--ace-font)' }}>No courses found</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="px-6 py-3 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Course grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${page}-${categoryFilter}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10"
          >
            {currentPageCourses.map((course) => (
              <CsvCourseCard key={course.id} course={course} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 pb-10">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2.5 rounded-xl font-semibold transition-all"
              style={{ backgroundColor: 'var(--card)', color: page === 1 ? 'var(--muted-foreground)' : 'var(--foreground)', border: '1px solid var(--border)', opacity: page === 1 ? 0.45 : 1, fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
            >
              ← Prev
            </button>

            {/* Page buttons */}
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className="px-5 py-2.5 rounded-xl font-bold transition-all"
                style={{
                  backgroundColor: page === p ? 'var(--ace-brand)' : 'var(--card)',
                  color: page === p ? '#fff' : 'var(--muted-foreground)',
                  border: page === p ? '1px solid var(--ace-brand)' : '1px solid var(--border)',
                  boxShadow: page === p ? '0 4px 14px rgba(0,162,182,0.30)' : 'none',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--ace-font)',
                }}
              >
                Page {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2.5 rounded-xl font-semibold transition-all"
              style={{ backgroundColor: 'var(--card)', color: page === totalPages ? 'var(--muted-foreground)' : 'var(--foreground)', border: '1px solid var(--border)', opacity: page === totalPages ? 0.45 : 1, fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Bootcamp / Featured divider ─────────────────── */}
        <div className="mt-8 mb-6 flex items-center gap-4">
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
            Live Bootcamps
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16">
          {COURSES.filter((c) => c.type === 'bootcamp').slice(0, 8).map((course) => {
            const inCart = items.some((i) => i.course.id === course.id);
            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="rounded-2xl overflow-hidden flex flex-col group"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--ace-shadow-sm)', textDecoration: 'none' }}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden flex-shrink-0" style={{ height: 168, background: course.gradient || '#0A1628' }}>
                  {course.image && (
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full" style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(0,162,182,0.88)', color: '#fff', fontFamily: 'var(--ace-font)' }}>
                      Bootcamp
                    </span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ace-brand)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>
                    {course.category}
                  </span>
                  <h3 className="mb-1 leading-snug" style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
                    {course.title}
                  </h3>
                  <p className="flex-1 mb-3 leading-relaxed" style={{ fontSize: '0.76rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                    {course.description.slice(0, 80)}…
                  </p>
                  <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                    <Clock className="h-3.5 w-3.5" /> {course.duration}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                      ₦{course.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
