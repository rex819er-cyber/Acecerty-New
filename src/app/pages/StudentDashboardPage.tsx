import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import {
  BookOpen, Award, Target, TrendingUp, Play, Calendar,
  ChevronRight, Wifi, AlertCircle, RefreshCw, Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiGetMe, apiGetMyCourses, getStudentToken, clearStudentToken } from '../lib/api';
import type { ApiUser, EnrolledCourse } from '../lib/api';

/* ── helpers ──────────────────────────────────────────────────────────── */

/** "Raphael Solomon" → "RS"; falls back to the email's first two letters. */
function initialsOf(user: ApiUser): string {
  const source = (user.fullName ?? user.name ?? '').trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    return (parts.length === 1
      ? parts[0].slice(0, 2)
      : parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

const greetingName = (user: ApiUser) => user.fullName ?? user.name ?? user.email;

function memberSince(createdAt?: string): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
}

const isComplete = (c: EnrolledCourse) =>
  c.progress >= 100 || ['completed', 'complete', 'passed'].includes((c.status ?? '').toLowerCase());

/* ── presentational pieces ────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; value: string | number; sub?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--ace-radius-lg)', padding: 20,
      }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 'var(--ace-radius-md)',
          background: 'var(--ace-brand-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
      </div>
      <div className="text-xl sm:text-2xl" style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800, marginBottom: 2 }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontWeight: 600 }}>
        {label}
      </div>
      {sub && (
        <div className="text-xs" style={{ color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)', marginTop: 4 }}>{sub}</div>
      )}
    </motion.div>
  );
}

function CourseProgressCard({ course }: { course: EnrolledCourse }) {
  const done = isComplete(course);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--ace-radius-lg)', overflow: 'hidden',
      }}
    >
      <div style={{ height: 3, width: '100%', background: 'var(--ace-brand)' }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div style={{ minWidth: 0 }}>
            <div className="text-sm sm:text-base" style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>
              {course.title}
            </div>
            {course.enrolledAt && (
              <div
                className="text-xs"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}
              >
                <Calendar className="h-3 w-3" />
                Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <span
            className="text-xs"
            style={{
              flexShrink: 0, padding: '3px 10px', borderRadius: 'var(--ace-radius-full)',
              background: 'var(--ace-brand-light)', color: 'var(--ace-brand)',
              fontFamily: 'var(--ace-font)', fontWeight: 700,
            }}
          >
            {course.progress}%
          </span>
        </div>

        <div style={{ marginBottom: 14 }}>
          {course.totalLessons > 0 && (
            <div
              className="text-xs"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', marginBottom: 6 }}
            >
              {course.completedLessons} of {course.totalLessons} lessons
            </div>
          )}
          <div style={{ height: 8, borderRadius: 'var(--ace-radius-full)', background: 'var(--muted)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 'var(--ace-radius-full)', background: 'var(--ace-brand)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div style={{ flex: 1, minWidth: 0 }}>
            {course.nextLesson ? (
              <>
                <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontWeight: 600 }}>
                  Up next
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
                  {course.nextLesson}
                </div>
              </>
            ) : (
              <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                {done ? 'Course complete' : 'Continue where you left off'}
              </div>
            )}
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="text-xs"
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 'var(--ace-radius-md)',
              background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
              fontFamily: 'var(--ace-font)', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Play className="h-3 w-3" /> {done ? 'Review' : 'Resume'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/** Shown when GET /me/courses comes back empty. */
function EmptyCoursesCard() {
  return (
    <div
      className="px-6 py-12"
      style={{
        background: 'var(--card)', border: '1px dashed var(--border)',
        borderRadius: 'var(--ace-radius-lg)', textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 'var(--ace-radius-full)',
          background: 'var(--ace-brand-light)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
        }}
      >
        <Sparkles className="h-7 w-7" style={{ color: 'var(--ace-brand)' }} />
      </div>
      <h3 className="text-sm sm:text-base" style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 6 }}>
        You're not enrolled in any courses yet
      </h3>
      <p
        className="text-xs sm:text-sm"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', maxWidth: 380, margin: '0 auto 22px', lineHeight: 1.6 }}
      >
        Browse the catalog to find a certification track, and your progress will show up here as you work through it.
      </p>
      <Link
        to="/courses"
        className="text-sm"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
          borderRadius: 'var(--ace-radius-md)', background: 'var(--ace-brand)',
          color: 'var(--primary-foreground)', fontFamily: 'var(--ace-font)',
          fontWeight: 700, textDecoration: 'none',
        }}
      >
        <BookOpen className="h-4 w-4" /> Browse Courses
      </Link>
    </div>
  );
}

function SkeletonBlock({ height }: { height: number }) {
  return (
    <div
      style={{
        height, borderRadius: 'var(--ace-radius-lg)',
        background: 'var(--muted)', animation: 'ace-pulse 1.4s ease-in-out infinite',
      }}
    />
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function StudentDashboardPage() {
  const navigate = useNavigate();

  const [user, setUser]           = useState<ApiUser | null>(null);
  const [courses, setCourses]     = useState<EnrolledCourse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [slow, setSlow]           = useState(false);
  const [error, setError]         = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  /* No token at all → straight back to the sign-in page */
  const hasToken = Boolean(getStudentToken());

  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlow(true); }, 2500);

    (async () => {
      setLoading(true); setError('');
      try {
        /* Profile is required; enrolments are best-effort so a failing
           /me/courses never blanks out the whole dashboard. */
        const profile  = await apiGetMe();
        const enrolled = await apiGetMyCourses().catch(() => [] as EnrolledCourse[]);
        if (cancelled) return;
        setUser(profile);
        setCourses(enrolled);
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as { message?: string; status?: number };
        if (e?.status === 401) {
          /* Token is stale — drop it and bounce to sign-in */
          clearStudentToken();
          navigate('/login', { replace: true, state: { returnTo: '/dashboard' } });
          return;
        }
        setError(e?.message ?? 'Could not load your dashboard.');
      } finally {
        if (!cancelled) { clearTimeout(slowTimer); setSlow(false); setLoading(false); }
      }
    })();

    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, [hasToken, navigate, reloadKey]);

  if (!hasToken) return <Navigate to="/login" replace state={{ returnTo: '/dashboard' }} />;

  /* ── derived metrics, all computed from live enrolments ─────────────── */
  const completed    = courses.filter(isComplete);
  const active       = courses.filter(c => !isComplete(c));
  const certificates = courses.filter(c => c.certificateUrl || isComplete(c)).length;
  const avgProgress  = courses.length
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  const joined = user ? memberSince(user.createdAt) : null;

  return (
    <div
      className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--background)', fontFamily: 'var(--ace-font)' }}
    >
      <style>{`@keyframes ace-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>

      <div className="max-w-7xl mx-auto">
        {slow && (
          <div
            className="text-xs sm:text-sm"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              padding: '10px 14px', borderRadius: 'var(--ace-radius-sm)',
              background: 'var(--ace-brand-light)', border: '1px solid var(--ace-brand)',
              color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)',
            }}
          >
            <Wifi size={14} className="animate-pulse shrink-0" />
            Loading your dashboard — the server may be waking up…
          </div>
        )}

        {error && (
          <div
            className="text-xs sm:text-sm"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              padding: '10px 14px', borderRadius: 'var(--ace-radius-sm)',
              background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
              color: 'var(--destructive)', fontFamily: 'var(--ace-font)',
            }}
          >
            <AlertCircle size={14} className="shrink-0" /> {error}
            <button
              onClick={() => setReloadKey(k => k + 1)}
              className="text-xs"
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--destructive)', fontFamily: 'var(--ace-font)',
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ── Profile header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {loading && !user ? (
            <div className="flex items-center gap-4" style={{ flex: 1 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 'var(--ace-radius-lg)',
                  background: 'var(--muted)', flexShrink: 0,
                  animation: 'ace-pulse 1.4s ease-in-out infinite',
                }}
              />
              <div style={{ flex: 1, maxWidth: 280 }}><SkeletonBlock height={44} /></div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4" style={{ minWidth: 0 }}>
              <div
                className="text-base sm:text-lg"
                style={{
                  width: 56, height: 56, flexShrink: 0, borderRadius: 'var(--ace-radius-lg)',
                  background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--ace-font)', fontWeight: 800,
                }}
              >
                {initialsOf(user)}
              </div>
              <div style={{ minWidth: 0 }}>
                <h1
                  className="text-lg sm:text-2xl"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800, lineHeight: 1.25 }}
                >
                  Welcome back, {greetingName(user)}!
                </h1>
                <div
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', marginTop: 2 }}
                >
                  {joined ? `Member since ${joined}` : user.email}
                </div>
              </div>
            </div>
          ) : null}

          <Link
            to="/courses"
            className="text-sm self-start sm:self-auto"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
              padding: '11px 20px', borderRadius: 'var(--ace-radius-md)',
              background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
              fontFamily: 'var(--ace-font)', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <BookOpen className="h-4 w-4" /> Browse Courses
          </Link>
        </div>

        {/* ── Live metrics ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {loading && !user ? (
            [0, 1, 2, 3].map(i => <SkeletonBlock key={i} height={132} />)
          ) : (
            <>
              <StatCard icon={BookOpen}   label="Active Courses"      value={active.length} />
              <StatCard icon={Award}      label="Certificates Earned" value={certificates} />
              <StatCard
                icon={Target} label="Avg. Progress" value={`${avgProgress}%`}
                sub={courses.length ? `Across ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}` : undefined}
              />
              <StatCard icon={TrendingUp} label="Completed"           value={completed.length} />
            </>
          )}
        </div>

        {/* ── Enrolled courses ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div style={{ minWidth: 0 }}>
            <h2
              className="text-base sm:text-lg mb-4"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800 }}
            >
              Active Courses
            </h2>

            {loading && courses.length === 0 ? (
              <div className="flex flex-col gap-4">
                {[0, 1].map(i => <SkeletonBlock key={i} height={168} />)}
              </div>
            ) : courses.length === 0 ? (
              <EmptyCoursesCard />
            ) : (
              <div className="flex flex-col gap-4">
                {(active.length > 0 ? active : courses).map(c => (
                  <CourseProgressCard key={c.id} course={c} />
                ))}
              </div>
            )}

            {completed.length > 0 && active.length > 0 && (
              <>
                <h2
                  className="text-base sm:text-lg mt-8 mb-4"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800 }}
                >
                  Completed
                </h2>
                <div className="flex flex-col gap-4">
                  {completed.map(c => <CourseProgressCard key={c.id} course={c} />)}
                </div>
              </>
            )}
          </div>

          {/* ── Practice exam CTA ─────────────────────────────────────── */}
          <div
            className="p-5"
            style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--ace-radius-lg)',
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 'var(--ace-radius-md)',
                background: 'var(--ace-brand-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}
            >
              <Target className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
            </div>
            <h3
              className="text-sm sm:text-base"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 6 }}
            >
              Ready to test yourself?
            </h3>
            <p
              className="text-xs"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.6, marginBottom: 16 }}
            >
              Practice exams simulate real exam conditions and track your improvement over time.
            </p>
            <Link
              to="/practice-exams"
              className="text-sm"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px 0', borderRadius: 'var(--ace-radius-md)',
                background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
                fontFamily: 'var(--ace-font)', fontWeight: 700, textDecoration: 'none',
              }}
            >
              Start Practice Exam <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
