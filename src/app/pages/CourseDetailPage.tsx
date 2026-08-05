import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ChevronDown, ChevronUp, CheckCircle2, Users, Star, Clock,
  BookOpen, Award, Play, ShoppingCart, ArrowLeft, Globe,
  Video, HelpCircle, FileText, Wifi, AlertCircle, Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import {
  apiGetCourse, apiGetCourseProgress, apiAddToCart, getStoredToken, formatPrice,
} from '../lib/api';
import type { ApiCourse } from '../lib/api';

/* ── unified course type ────────────────────────────────────────────────── */
interface LessonItem { id: string; title: string; duration?: string; type: 'video' | 'reading' | 'quiz'; order: number }
interface ModuleItem { id: string; title: string; duration?: string; order: number; lessons: LessonItem[] }
interface FullCourse {
  id: string; title: string; slug?: string; description: string; image?: string;
  price: number; originalPrice?: number; currency: string; duration: string; videos?: string; questions?: string;
  category: string; level: string; format?: string;
  /* null when the course has no instructor assigned — the block is hidden. */
  instructor: { name: string; title: string; bio: string; rating: number; students: number; reviews: number } | null;
  outcomes: string[]; requirements: string[];
  modules: ModuleItem[];
  rating: number; reviews: number; students: number;
  certificate: boolean; lastUpdated: string; highlights: string[];
  accentColor: string;
  isLive?: boolean;
}

/* Accent colour is presentation only — derived from the course's category
   because the backend has no colour column. */
const CAT_COLOR: Record<string, string> = {
  comptia: '#E31837', cisco: '#1BA0D7', aws: '#FF9900', security: '#00C7A3',
  microsoft: '#00A4EF', pmi: '#5C2D91', devops: '#0db7ed', default: 'var(--ace-brand)',
};

function accentFor(cat: string): string {
  const k = (cat ?? '').toLowerCase();
  for (const [key, color] of Object.entries(CAT_COLOR)) {
    if (key !== 'default' && k.includes(key)) return color;
  }
  return CAT_COLOR.default;
}

/* ── data transformer ───────────────────────────────────────────────────── */
/* Straight projection of the API record. Nothing is invented: a field the
   backend hasn't filled in stays empty and the UI omits that block. */
function fromApiCourse(api: ApiCourse): FullCourse {
  const cat = api.category ?? '';
  const mods: ModuleItem[] = (api.modules ?? []).map((m, mi) => ({
    id: m.id, title: m.title, duration: m.duration, order: m.order ?? mi,
    lessons: (m.lessons ?? []).map((l, li) => ({
      id: l.id, title: l.title, duration: l.duration,
      type: (l.type as 'video' | 'reading' | 'quiz') ?? 'video',
      order: l.order ?? li,
    })),
  }));
  return {
    id: api.id, title: api.title, slug: api.slug, description: api.description, isLive: true,
    image: api.image, price: api.price ?? 0, originalPrice: api.originalPrice, currency: api.currency,
    duration: api.duration ?? '', videos: api.videos, questions: api.questions,
    category: cat, level: api.level ?? '', format: api.format,
    instructor: api.instructor ?? null,
    outcomes: api.outcomes ?? [],
    requirements: api.requirements ?? [],
    modules: mods,
    rating: api.rating ?? 0, reviews: api.reviews ?? 0, students: api.students ?? 0,
    certificate: api.certificate ?? false, lastUpdated: api.lastUpdated ?? '',
    highlights: api.highlights ?? [],
    accentColor: accentFor(cat),
  };
}

/* ── sub-components ─────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div style={{ fontFamily: 'var(--ace-font)' }} className="min-h-screen pt-20 sm:pt-24">
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <div className="flex-1">
            <div style={{ background: 'var(--muted)', borderRadius: 8 }} className="h-8 w-3/4 mb-4 animate-pulse" />
            <div style={{ background: 'var(--muted)', borderRadius: 8 }} className="h-4 w-full mb-2 animate-pulse" />
            <div style={{ background: 'var(--muted)', borderRadius: 8 }} className="h-4 w-5/6 animate-pulse" />
          </div>
          <div style={{ background: 'var(--muted)', borderRadius: 12 }} className="w-80 h-64 animate-pulse shrink-0" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ background: 'var(--muted)', borderRadius: 8 }} className="h-64 animate-pulse" />
      </div>
    </div>
  );
}

function SlowBanner() {
  return (
    <div style={{ background: 'rgba(var(--ace-brand-rgb, 0,199,163),0.12)', border: '1px solid var(--ace-brand)', borderRadius: 10, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}
      className="flex items-center gap-3 px-4 py-3 mb-6 text-sm">
      <Wifi size={16} className="animate-pulse shrink-0" />
      <span>Connecting to server — this may take a moment on first load…</span>
    </div>
  );
}

function LessonIcon({ type }: { type: 'video' | 'reading' | 'quiz' }) {
  if (type === 'video') return <Play size={13} style={{ color: 'var(--ace-brand)' }} />;
  if (type === 'reading') return <FileText size={13} style={{ color: 'var(--text-muted)' }} />;
  return <HelpCircle size={13} style={{ color: '#a78bfa' }} />;
}

function CurriculumAccordion({ modules, completedLessons, accentColor }: {
  modules: ModuleItem[]; completedLessons: string[]; accentColor: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set([modules[0]?.id]));
  const toggle = (id: string) =>
    setOpen(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {modules.map((mod, i) => {
        const isOpen = open.has(mod.id);
        const done = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
        return (
          <div key={mod.id} style={{ borderBottom: i < modules.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => toggle(mod.id)}
              style={{ width: '100%', background: isOpen ? 'rgba(255,255,255,0.04)' : 'var(--surface)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: 'none', fontFamily: 'var(--ace-font)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'left' }}>{mod.title}</span>
                {completedLessons.length > 0 && done === mod.lessons.length && (
                  <CheckCircle2 size={14} style={{ color: accentColor }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, shrink: 0 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {mod.lessons.length} lessons {mod.duration ? `· ${mod.duration}` : ''}
                  {completedLessons.length > 0 ? ` · ${done}/${mod.lessons.length}` : ''}
                </span>
                {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden' }}>
                  {mod.lessons.map((lesson, li) => {
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <div key={lesson.id} style={{
                        padding: '10px 18px 10px 32px', display: 'flex', alignItems: 'center', gap: 10,
                        background: li % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderTop: '1px solid var(--border)',
                      }}>
                        <LessonIcon type={lesson.type} />
                        <span style={{ flex: 1, color: isDone ? accentColor : 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--ace-font)' }}>
                          {lesson.title}
                        </span>
                        {isDone && <CheckCircle2 size={13} style={{ color: accentColor }} />}
                        {lesson.duration && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lesson.duration}</span>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function EnrollCard({ course, onAddToCart, adding, inCart }: {
  course: FullCourse; onAddToCart: () => void; adding: boolean; inCart: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
      overflow: 'hidden', position: 'sticky', top: 24,
    }}>
      {course.image && (
        <img src={course.image} alt={course.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
      )}
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--ace-font)' }}>
            {formatPrice(course.price, course.currency)}
          </span>
          {course.originalPrice && (
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontFamily: 'var(--ace-font)' }}>
              {formatPrice(course.originalPrice, course.currency)}
            </span>
          )}
        </div>
        {course.originalPrice && (
          <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: 14, fontFamily: 'var(--ace-font)' }}>
            Save {Math.round((1 - course.price / course.originalPrice) * 100)}%
          </div>
        )}

        <button
          onClick={inCart ? () => navigate('/cart') : onAddToCart}
          disabled={adding}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: inCart ? 'var(--muted)' : course.accentColor,
            color: inCart ? 'var(--text-primary)' : '#fff',
            fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--ace-font)',
            opacity: adding ? 0.7 : 1, transition: 'opacity 0.2s, transform 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10,
          }}>
          <ShoppingCart size={16} />
          {adding ? 'Adding…' : inCart ? 'View Cart' : 'Enroll Now'}
        </button>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 18, fontFamily: 'var(--ace-font)' }}>
          30-day money-back guarantee
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            [<Clock key="c" size={14} />, course.duration],
            [<Video key="v" size={14} />, course.videos ?? 'On-demand video'],
            [<HelpCircle key="h" size={14} />, course.questions ?? 'Practice questions'],
            [<Globe key="g" size={14} />, 'Full lifetime access'],
            [<Award key="a" size={14} />, 'Certificate of completion'],
          ].map(([icon, label], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
              <span style={{ color: course.accentColor }}>{icon}</span> {label as string}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstructorCard({ instructor, accentColor }: { instructor: FullCourse['instructor']; accentColor: string }) {
  /* No instructor assigned to this course — omit the block entirely rather
     than showing a placeholder person. */
  if (!instructor) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
      <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Your Instructor</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BookOpen size={28} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', marginBottom: 2 }}>{instructor.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)', marginBottom: 10 }}>{instructor.title}</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            {[
              [<Star key="s" size={13} />, `${instructor.rating} rating`],
              [<Users key="u" size={13} />, `${instructor.students.toLocaleString()} students`],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)' }}>
                <span style={{ color: accentColor }}>{icon}</span> {text as string}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)', lineHeight: 1.6 }}>{instructor.bio}</p>
        </div>
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { items, addToCart } = useCart();
  const navigate = useNavigate();

  const [course, setCourse] = useState<FullCourse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [slowConn, setSlowConn] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuth = !!getStoredToken();
  /* The cart keys on the course's own id, which for a live course is its UUID —
     not the slug in the URL — so match on both. */
  const inCart = items.some(i => {
    const cartId = (i as any).course?.id ?? (i as any).id ?? (i as any).courseId;
    return cartId === id || (course && cartId === course.id);
  });

  /* load course data — 3-source fallback */
  useEffect(() => {
    let cancelled = false;
    setPageLoading(true); setError(null);
    const slowTimer = setTimeout(() => setSlowConn(true), 2500);

    async function load() {
      try {
        const api = await apiGetCourse(id);
        if (!cancelled) { setCourse(fromApiCourse(api)); }
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        if (!cancelled) {
          setError(e?.status === 404 ? 'Course not found.' : e?.message ?? 'Could not load this course.');
        }
      } finally {
        clearTimeout(slowTimer);
        if (!cancelled) { setSlowConn(false); setPageLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, [id]);

  /* Load progress if authenticated. Keyed on the resolved course's UUID rather
     than the route param, which may be a slug or a bundled-content id — the
     endpoint only accepts the former. */
  useEffect(() => {
    if (!isAuth || !course?.isLive) return;
    apiGetCourseProgress(course.id)
      .then(p => setCompletedLessons(p.completedLessons))
      .catch(() => {});
  }, [course?.id, course?.isLive, isAuth]);

  const handleAddToCart = async () => {
    if (!course) return;
    setAdding(true);
    try {
      /* Mirrors the local cart into the signed-in user's server-side cart so
         checkout can build the order from it. Only live courses have a UUID the
         backend recognises; bundled content stays local-only. */
      if (course.isLive) apiAddToCart('course', course.id).catch(() => {});
      addToCart({
        id: course.id, title: course.title, price: course.price, currency: course.currency,
        category: course.category as any, description: course.description,
        duration: course.duration, level: course.level as any,
        image: course.image, type: 'online', shortTitle: course.title, delivery: 'Online',
      });
    } finally {
      setTimeout(() => setAdding(false), 600);
    }
  };

  if (pageLoading) return <PageSkeleton />;
  if (error || !course) {
    return (
      <div style={{ fontFamily: 'var(--ace-font)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{error ?? 'Course not found'}</p>
        <Link to="/courses" style={{ color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const lastUpdatedDate = course.lastUpdated ? new Date(course.lastUpdated) : null;
  const formattedLastUpdated = lastUpdatedDate && !isNaN(lastUpdatedDate.getTime())
    ? lastUpdatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="pt-20 sm:pt-24" style={{ fontFamily: 'var(--ace-font)', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', paddingTop: 32, paddingBottom: 32 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/courses" style={{ color: 'var(--ace-brand)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <ArrowLeft size={14} /> All courses
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: meta */}
            <div className="flex-1">
              {slowConn && <SlowBanner />}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ background: course.accentColor, color: '#fff', fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontFamily: 'var(--ace-font)' }}>
                  {course.category}
                </span>
                <span style={{ background: 'var(--muted)', color: 'var(--text-secondary)', fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, fontFamily: 'var(--ace-font)' }}>
                  {course.level}
                </span>
                {course.certificate && (
                  <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, fontFamily: 'var(--ace-font)' }}>
                    Certificate
                  </span>
                )}
              </div>

              <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 800, marginBottom: 14, lineHeight: 1.3 }}>
                {course.title}
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--ace-font)', lineHeight: 1.7, marginBottom: 18, fontSize: '0.95rem' }}>
                {descExpanded || course.description.length <= 220
                  ? course.description
                  : `${course.description.slice(0, 220)}…`}
                {course.description.length > 220 && (
                  <button onClick={() => setDescExpanded(v => !v)} style={{ background: 'none', border: 'none', color: course.accentColor, cursor: 'pointer', fontFamily: 'var(--ace-font)', fontSize: '0.9rem', marginLeft: 4, padding: 0 }}>
                    {descExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  [<Star key="s" size={15} />, `${course.rating} (${course.reviews.toLocaleString()} reviews)`],
                  [<Users key="u" size={15} />, `${course.students.toLocaleString()} students`],
                  [<Clock key="c" size={15} />, course.duration],
                  [<BookOpen key="b" size={15} />, `${totalLessons} lessons`],
                ].map(([icon, label], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
                    <span style={{ color: course.accentColor }}>{icon}</span> {label as string}
                  </div>
                ))}
              </div>

              {formattedLastUpdated && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)' }}>
                  Last updated: {formattedLastUpdated}
                </div>
              )}
            </div>

            {/* Right: enroll card (desktop inline) */}
            <div className="hidden lg:block w-80 shrink-0">
              <EnrollCard course={course} onAddToCart={handleAddToCart} adding={adding} inCart={inCart} />
            </div>
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Highlights */}
            {course.highlights.length > 0 && (
              <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 24 }}>
                <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 14 }}>Course Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {course.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                      <Package size={14} style={{ color: course.accentColor, flexShrink: 0 }} /> {h}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Outcomes */}
            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 14 }}>What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {course.outcomes.map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                    <CheckCircle2 size={14} style={{ color: course.accentColor, flexShrink: 0, marginTop: 2 }} /> {o}
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 6 }}>Course Curriculum &amp; Modules</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)', marginBottom: 16 }}>
                {course.modules.length} sections · {totalLessons} lessons
                {completedLessons.length > 0 && ` · ${completedLessons.length} completed`}
              </p>
              <CurriculumAccordion modules={course.modules} completedLessons={completedLessons} accentColor={course.accentColor} />
            </section>

            {/* Requirements */}
            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 24 }}>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 14 }}>Requirements</h2>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {course.requirements.map((r, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                    <span style={{ color: course.accentColor, flexShrink: 0 }}>•</span> {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <InstructorCard instructor={course.instructor} accentColor={course.accentColor} />
          </div>

          {/* Right sidebar (mobile/tablet enroll card) */}
          <div className="lg:hidden">
            <EnrollCard course={course} onAddToCart={handleAddToCart} adding={adding} inCart={inCart} />
          </div>
        </div>
      </div>
    </div>
  );
}
