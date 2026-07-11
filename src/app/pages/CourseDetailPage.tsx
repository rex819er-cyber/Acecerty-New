import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ChevronDown, ChevronUp, CheckCircle2, Users, Star, Clock,
  BookOpen, Award, Play, ShoppingCart, ArrowLeft, Globe,
  ChevronRight, HelpCircle, Video, Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COURSES } from '../data/courses';
import type { Course } from '../data/courses';
import { getCourseDetail, DEFAULT_DETAIL } from '../data/courseDetails';
import type { CurriculumModule } from '../data/courseDetails';
import { getCsvCourse } from '../data/csvCourses';
import type { CsvCourse } from '../data/csvCourses';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

/* ── Shared sub-components ─────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: 20, fontFamily: 'var(--ace-font)' }}>{title}</h2>
      {children}
    </div>
  );
}

function ModuleRow({ mod, index, defaultOpen }: { mod: CurriculumModule; index: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl mb-2" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left rounded-xl transition-colors"
        style={{ color: 'var(--foreground)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ace-brand)', minWidth: 20, fontFamily: 'var(--ace-font)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--ace-font)' }}>{mod.title}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{mod.duration}</span>
          {open ? <ChevronUp className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <ul className="px-5 pb-4 flex flex-col gap-2">
              {mod.lessons.map((lesson, i) => (
                <li key={i} className="flex items-center gap-3" style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                  <Play className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                  {lesson}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── CSV Course Detail View ────────────────────────────────────────── */

function CsvCourseDetailView({ course }: { course: CsvCourse }) {
  const { addToCart, items } = useCart();

  const isInCart = items.some((i) => i.course.id === course.id);

  const handleEnroll = () => {
    if (!isInCart) {
      addToCart({
        id: course.id,
        title: course.title,
        shortTitle: course.title.split(' ').slice(0, 3).join(' '),
        category: course.category as any,
        type: 'online',
        duration: course.duration,
        delivery: 'Self-paced online',
        price: course.price,
        image: course.image,
        description: course.description,
        level: 'Intermediate',
        videos: parseInt(course.videos) || undefined,
        questions: parseInt(course.questions) || undefined,
      });
    }
  };

  const MOCK_OUTCOMES = [
    'Understand core concepts and exam objectives',
    'Apply knowledge through real-world practice scenarios',
    'Build confidence with hundreds of practice questions',
    'Earn industry-recognised certification credentials',
    'Advance your career with in-demand technical skills',
    'Access on-demand video content at your own pace',
  ];

  const MOCK_REQUIREMENTS = [
    'Basic computer literacy and internet access',
    'Enthusiasm for IT and professional development',
    'No prior experience required for beginner tracks',
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* ── Hero banner ────────────────────────────────────── */}
      <div className="pt-20 sm:pt-24 pb-10 px-4" style={{ background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 60%, #051520 100%)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>{course.category}</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Left */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full mb-4" style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'rgba(0,162,182,0.18)', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                {course.category}
              </span>
              <h1 className="text-white mb-4 leading-tight" style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)', fontWeight: 900, fontFamily: 'var(--ace-font)' }}>
                {course.title}
              </h1>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', maxWidth: 560, fontFamily: 'var(--ace-font)' }}>
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-5 mb-6">
                {[
                  { icon: Clock, label: course.duration },
                  { icon: Video, label: course.videos },
                  { icon: HelpCircle, label: course.questions !== '—' ? course.questions : 'Practice included' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                    <Icon className="h-4 w-4" style={{ color: 'var(--ace-brand)' }} />
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                  <Globe className="h-4 w-4" style={{ color: 'var(--ace-brand)' }} />
                  English
                </div>
              </div>

              {/* Star rating row */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" fill={i < 4 ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <span className="text-white font-semibold" style={{ fontSize: '0.88rem', fontFamily: 'var(--ace-font)' }}>4.6</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>(2,400+ reviews)</span>
              </div>
            </div>

            {/* Right: enroll card — desktop */}
            <div className="hidden lg:block">
              <CsvEnrollCard course={course} isInCart={isInCart} onEnroll={handleEnroll} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero image ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ marginTop: -28 }}>
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ maxHeight: 420 }}>
          <ImageWithFallback
            src={course.image}
            alt={course.title}
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div>
            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {[
                { icon: '⏱', label: 'Duration', value: course.duration },
                { icon: '🎬', label: 'Videos', value: course.videos },
                { icon: '❓', label: 'Questions', value: course.questions !== '—' ? course.questions : 'Included' },
                { icon: '🏆', label: 'Certificate', value: 'On completion' },
                { icon: '🌐', label: 'Language', value: 'English' },
                { icon: '♾️', label: 'Access', value: 'Lifetime' },
              ].map((h) => (
                <div key={h.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.4rem' }}>{h.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{h.label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{h.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What you'll learn */}
            <Section title="What You'll Learn">
              <div className="grid sm:grid-cols-2 gap-3">
                {MOCK_OUTCOMES.map((o, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{o}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Full description */}
            <Section title="About This Course">
              <p style={{ fontSize: '0.92rem', color: 'var(--muted-foreground)', lineHeight: 1.75, fontFamily: 'var(--ace-font)' }}>
                {course.description}
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted-foreground)', lineHeight: 1.75, marginTop: 14, fontFamily: 'var(--ace-font)' }}>
                This course is delivered entirely online with self-paced video content, practice tests, and downloadable resources.
                You can access all materials 24/7 on any device, and your access never expires. Upon completion,
                you'll receive a digital certificate of achievement recognised by employers worldwide.
              </p>
            </Section>

            {/* Requirements */}
            <Section title="Requirements">
              <ul className="flex flex-col gap-2">
                {MOCK_REQUIREMENTS.map((r, i) => (
                  <li key={i} className="flex items-start gap-3" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block sticky top-24">
            <CsvEnrollCard course={course} isInCart={isInCart} onEnroll={handleEnroll} />
          </div>
        </div>

        {/* Mobile enroll bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4" style={{ backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦{course.price.toLocaleString()}</p>
            </div>
            <button
              onClick={handleEnroll}
              className="flex-1 max-w-xs py-3.5 rounded-full font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: isInCart ? '#047857' : 'var(--ace-brand)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
            >
              {isInCart ? '✓ Added to Cart' : 'Enrol Now — ₦60,000'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CsvEnrollCard({ course, isInCart, onEnroll }: { course: CsvCourse; isInCart: boolean; onEnroll: () => void }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Preview image */}
      <div style={{ height: 160, overflow: 'hidden' }}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <div className="mb-4">
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦60,000</span>
        </div>
        <button
          onClick={onEnroll}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.97] mb-3"
          style={{ backgroundColor: isInCart ? '#047857' : 'var(--ace-brand)', boxShadow: isInCart ? 'none' : '0 4px 20px rgba(0,162,182,0.35)', fontSize: '0.95rem', fontFamily: 'var(--ace-font)' }}
        >
          {isInCart ? '✓ Added to Cart' : 'Enrol Now'}
        </button>
        <Link
          to="/checkout"
          className="block w-full py-3.5 rounded-2xl font-semibold text-center transition-all active:scale-[0.97]"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
          onClick={() => { if (!isInCart) onEnroll(); }}
        >
          Buy Now
        </Link>
        <div className="mt-5 flex flex-col gap-2.5">
          {[
            { icon: Clock, label: course.duration + ' of content' },
            { icon: Video, label: course.videos },
            { icon: HelpCircle, label: course.questions !== '—' ? course.questions : 'Practice questions' },
            { icon: Award, label: 'Completion certificate' },
            { icon: ShoppingCart, label: '30-day satisfaction guarantee' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3" style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Existing (bootcamp/online) Course Detail View ─────────────────── */

function BootcampEnrollCard({
  course, detail, isInCart, onEnroll, totalLessons,
}: {
  course: Course; detail: any; isInCart: boolean; onEnroll: () => void; totalLessons: number;
}) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="h-40 relative flex items-center justify-center" style={{ background: course.gradient ?? 'linear-gradient(135deg,#0B1D3A,#1a3a6e)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="text-center relative z-10">
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>{course.shortTitle}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>{course.duration} Bootcamp</div>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦60,000</span>
          {course.originalPrice && (
            <span className="ml-2 line-through" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>₦{course.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <button
          onClick={onEnroll}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.97] mb-3"
          style={{ backgroundColor: isInCart ? '#047857' : 'var(--ace-brand)', boxShadow: isInCart ? 'none' : '0 4px 20px rgba(0,162,182,0.35)', fontSize: '0.95rem', fontFamily: 'var(--ace-font)' }}
        >
          {isInCart ? '✓ Added to Cart' : 'Enrol Now'}
        </button>
        <Link
          to="/checkout"
          className="block w-full py-3.5 rounded-2xl font-semibold text-center transition-all active:scale-[0.97]"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
          onClick={() => { if (!isInCart) onEnroll(); }}
        >
          Buy Now
        </Link>
        <div className="mt-5 flex flex-col gap-2.5">
          {[
            { icon: Clock, label: `${course.duration} instructor-led training` },
            { icon: BookOpen, label: `${totalLessons} lessons across ${detail.curriculum.length} modules` },
            { icon: Award, label: 'Completion certificate' },
            { icon: Users, label: `${detail.students.toLocaleString()} enrolled` },
            { icon: ShoppingCart, label: '30-day satisfaction guarantee' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3" style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
              {label}
            </div>
          ))}
        </div>
        {course.nextDate && (
          <div className="mt-5 rounded-2xl px-4 py-3 text-center" style={{ backgroundColor: 'var(--ace-brand-light)' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Next cohort starts</p>
            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ace-brand)', marginTop: 2, fontFamily: 'var(--ace-font)' }}>{course.nextDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BootcampCourseDetailView({ course }: { course: Course }) {
  const { addToCart, items } = useCart();
  const rawDetail = getCourseDetail(course.id);
  const detail = rawDetail ?? { ...DEFAULT_DETAIL, id: course.id };
  const isInCart = items.some((i) => i.course.id === course.id);
  const handleEnroll = () => { if (!isInCart) addToCart(course); };
  const stars = Math.round(detail.rating);
  const totalLessons = detail.curriculum.reduce((sum: number, m: CurriculumModule) => sum + m.lessons.length, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>
      {/* Hero */}
      <div className="pt-20 sm:pt-24 pb-10 px-4" style={{ background: course.gradient ?? 'linear-gradient(135deg,#0B1D3A,#1a3a6e)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)' }}>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>{course.shortTitle}</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div>
              <span className="inline-block px-3 py-1 rounded-full mb-4" style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: 'rgba(0,162,182,0.2)', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                {course.category}
              </span>
              <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontWeight: 900, fontFamily: 'var(--ace-font)' }}>
                {course.title}
              </h1>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: 560, fontFamily: 'var(--ace-font)' }}>
                {detail.tagline}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4" fill={i < stars ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
                    ))}
                  </div>
                  <span className="text-white font-semibold" style={{ fontSize: '0.88rem', fontFamily: 'var(--ace-font)' }}>{detail.rating}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>({detail.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                  <Users className="h-4 w-4" /> {detail.students.toLocaleString()} students
                </div>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                  <Globe className="h-4 w-4" /> {detail.language}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.9rem' }}>
                  {detail.instructor.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold" style={{ fontSize: '0.88rem', fontFamily: 'var(--ace-font)' }}>{detail.instructor.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)' }}>{detail.instructor.credentials}</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <BootcampEnrollCard course={course} detail={detail} isInCart={isInCart} onEnroll={handleEnroll} totalLessons={totalLessons} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {detail.highlights.map((h: any) => (
                <div key={h.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.4rem' }}>{h.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{h.label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{h.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Section title="What You'll Learn">
              <div className="grid sm:grid-cols-2 gap-3">
                {detail.outcomes.map((o: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{o}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Section title={`Curriculum · ${detail.curriculum.length} modules · ${totalLessons} lessons`}>
              {detail.curriculum.map((mod: CurriculumModule, i: number) => (
                <ModuleRow key={i} mod={mod} index={i} defaultOpen={i === 0} />
              ))}
            </Section>
            <Section title="Requirements">
              <ul className="flex flex-col gap-2">
                {detail.requirements.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-3" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Who Is This For?">
              <ul className="flex flex-col gap-2">
                {detail.audience.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-3" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)' }} />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Your Instructor">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                  {detail.instructor.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)', marginBottom: 2, fontFamily: 'var(--ace-font)' }}>{detail.instructor.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ace-brand)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{detail.instructor.credentials}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: 12, fontFamily: 'var(--ace-font)' }}>{detail.instructor.experience} experience</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {detail.instructor.certs.map((c: string) => (
                      <span key={c} className="px-2.5 py-1 rounded-full" style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'var(--ace-brand-light)', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{detail.instructor.bio}</p>
                </div>
              </div>
            </Section>
          </div>
          <div className="hidden lg:block sticky top-24">
            <BootcampEnrollCard course={course} detail={detail} isInCart={isInCart} onEnroll={handleEnroll} totalLessons={totalLessons} />
          </div>
        </div>
        {/* Mobile bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4" style={{ backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦60,000</p>
              {course.originalPrice && (
                <p className="line-through" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>₦{course.originalPrice.toLocaleString()}</p>
              )}
            </div>
            <button
              onClick={handleEnroll}
              className="flex-1 max-w-xs py-3.5 rounded-full font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: isInCart ? '#047857' : 'var(--ace-brand)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
            >
              {isInCart ? '✓ Added to Cart' : 'Enrol Now — ₦60,000'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Router entry ──────────────────────────────────────────────────── */

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: 'var(--background)' }}>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>Course not found</p>
        <Link to="/courses" className="px-6 py-3 rounded-full font-bold text-white" style={{ backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
          Browse Courses
        </Link>
      </div>
    );
  }

  // Try CSV courses first (they include online courses from the product catalog)
  const csvCourse = getCsvCourse(id);
  if (csvCourse) {
    return <CsvCourseDetailView course={csvCourse} />;
  }

  // Fall back to existing bootcamp/online courses
  const course = COURSES.find((c) => c.id === id);
  if (course) {
    return <BootcampCourseDetailView course={course} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: 'var(--background)' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>Course not found</p>
      <Link to="/courses" className="px-6 py-3 rounded-full font-bold text-white" style={{ backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
        Browse Courses
      </Link>
    </div>
  );
}
