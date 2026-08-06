import React, { useState, useMemo } from 'react';
import {
  BookOpen, Users, Monitor, Award, Clock, CheckCircle, Search,
  ChevronRight, Briefcase, User, Building2, Wifi, Loader2,
  AlertCircle, RefreshCw, Play, HelpCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CSV_COURSES } from '../data/csvCourses';
import { useApi, apiGetCourses } from '../lib/api';
import type { ApiCourse, ApiModule } from '../lib/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

/* ─── Types ─────────────────────────────────────────────────────────── */

type Format = 'All' | 'Bootcamp' | 'Live Online' | 'Self-Paced' | 'Corporate';
type Level  = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';
type SubNav = 'overview' | 'individual' | 'business';

/* ─── Static training data ──────────────────────────────────────────── */

interface Training {
  id: string;
  title: string;
  cert: string;
  vendor: string;
  format: Exclude<Format, 'All'>;
  level: Exclude<Level, 'All'>;
  duration: string;
  price: number;
  includes: string[];
  color: string;
  popular?: boolean;
}

const TRAININGS: Training[] = [
  { id: 't1', title: 'CompTIA Security+ Bootcamp', cert: 'Security+', vendor: 'CompTIA', format: 'Bootcamp', level: 'Intermediate', duration: '5 Days', price: 60000, includes: ['Courseware', 'Exam Voucher', 'Free Retake', 'Lab Access'], color: '#c0392b', popular: true },
  { id: 't2', title: 'CISSP Intensive Bootcamp', cert: 'CISSP', vendor: 'ISC2', format: 'Bootcamp', level: 'Advanced', duration: '6 Days', price: 60000, includes: ['Official Courseware', 'Exam Voucher', 'Practice Exams', 'Mentorship'], color: '#005f6b', popular: true },
  { id: 't3', title: 'CCNA Live Online Training', cert: 'CCNA', vendor: 'Cisco', format: 'Live Online', level: 'Intermediate', duration: '5 Days', price: 60000, includes: ['Live Instructor', 'Lab Access', 'Recording Access', 'Study Guide'], color: '#1ba0d8' },
  { id: 't4', title: 'AWS Solutions Architect Live', cert: 'SAA-C03', vendor: 'AWS', format: 'Live Online', level: 'Intermediate', duration: '4 Days', price: 60000, includes: ['Live Instructor', 'AWS Labs', 'Practice Exams', 'Recording'], color: '#ff9900' },
  { id: 't5', title: 'CompTIA A+ Self-Paced', cert: 'A+', vendor: 'CompTIA', format: 'Self-Paced', level: 'Beginner', duration: '180 Days Access', price: 60000, includes: ['On-Demand Videos', 'Study Guide', 'Practice Questions', 'Exam Vouchers (x2)'], color: '#c0392b' },
  { id: 't6', title: 'Azure Administrator Self-Paced', cert: 'AZ-104', vendor: 'Microsoft', format: 'Self-Paced', level: 'Intermediate', duration: '180 Days Access', price: 60000, includes: ['On-Demand Videos', 'Azure Labs', 'Practice Exams', 'Exam Voucher'], color: '#0078d4' },
  { id: 't7', title: 'PMP Exam Prep Bootcamp', cert: 'PMP', vendor: 'PMI', format: 'Bootcamp', level: 'Advanced', duration: '4 Days', price: 60000, includes: ['35 PDUs', 'PMBOK® Guide', 'Practice Exams', 'Exam Prep Toolkit'], color: '#2c5282' },
  { id: 't8', title: 'Network+ Live Online', cert: 'Network+', vendor: 'CompTIA', format: 'Live Online', level: 'Beginner', duration: '5 Days', price: 60000, includes: ['Live Instructor', 'Study Guide', 'Practice Exams', 'Recording Access'], color: '#c0392b' },
  { id: 't9', title: 'CISM Certification Bootcamp', cert: 'CISM', vendor: 'ISACA', format: 'Bootcamp', level: 'Advanced', duration: '4 Days', price: 60000, includes: ['CISM QAE Manual', 'Practice Exams', 'Exam Voucher', 'CPE Credits'], color: '#4a4a8a' },
  /* Corporate entries */
  { id: 'tc1', title: 'Enterprise Security Team Training', cert: 'CompTIA Bundle', vendor: 'CompTIA', format: 'Corporate', level: 'Intermediate', duration: 'Custom (5–10 Days)', price: 60000, includes: ['Dedicated Instructor', 'Custom Curriculum', 'On-Site or Virtual', 'Team Progress Dashboard'], color: '#00A2B6', popular: true },
  { id: 'tc2', title: 'Corporate Cloud Transformation', cert: 'AWS + Azure', vendor: 'Multi-Vendor', format: 'Corporate', level: 'Advanced', duration: 'Custom Programme', price: 60000, includes: ['Architecture Review', 'Hands-On Labs', 'Migration Strategy', 'Post-Training Support'], color: '#6366f1' },
  { id: 'tc3', title: 'DoD 8570/8140 Compliance Package', cert: 'DoD Approved', vendor: 'Acecerty', format: 'Corporate', level: 'Advanced', duration: 'Flexible', price: 60000, includes: ['IAT/IAM Level Coverage', 'Govt Billing', 'GSA Pricing', 'Compliance Reporting'], color: '#1a5276' },
];

const FORMATS: Format[] = ['All', 'Bootcamp', 'Live Online', 'Self-Paced', 'Corporate'];
const LEVELS: Level[]   = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const FORMAT_ICON: Record<string, React.ElementType> = {
  Bootcamp:    Users,
  'Live Online': Monitor,
  'Self-Paced':  BookOpen,
  Corporate:     Building2,
};

const FORMAT_COLOR: Record<string, string> = {
  Bootcamp:     '#c0392b',
  'Live Online': '#1ba0d8',
  'Self-Paced':  '#16a34a',
  Corporate:     '#00A2B6',
};

/* ─── Skeleton loader ───────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div style={{ height: 4, backgroundColor: 'var(--muted)' }} />
      <div className="p-5 flex flex-col gap-3">
        <div style={{ height: 12, width: '40%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
        <div style={{ height: 16, width: '80%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
        <div style={{ height: 12, width: '60%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
        <div style={{ height: 12, width: '70%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
        <div style={{ height: 44, backgroundColor: 'var(--muted)', borderRadius: 12, marginTop: 8 }} />
      </div>
    </div>
  );
}

/* ─── Cold-start notice ─────────────────────────────────────────────── */

function ConnectionNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6"
      style={{ backgroundColor: 'rgba(0,162,182,0.08)', border: '1px solid rgba(0,162,182,0.2)' }}
    >
      <Wifi className="h-4 w-4 flex-shrink-0 animate-pulse" style={{ color: 'var(--ace-brand)' }} />
      <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
        Connecting to server… This can take up to 30 seconds on first load.
      </p>
      <Loader2 className="h-3.5 w-3.5 ml-auto animate-spin flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
    </motion.div>
  );
}

/* ─── Training card ─────────────────────────────────────────────────── */

function TrainingCard({ training }: { training: Training }) {
  const Icon = FORMAT_ICON[training.format] ?? BookOpen;
  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--ace-shadow-sm)' }}
    >
      <div style={{ height: 3, backgroundColor: training.color }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: training.color + '18' }}>
              <Icon className="h-4 w-4" style={{ color: training.color }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: training.color, fontFamily: 'var(--ace-font)' }}>{training.format}</span>
          </div>
          {training.popular && (
            <span className="px-2.5 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              Popular
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: training.color, marginBottom: 4, fontFamily: 'var(--ace-font)' }}>
          {training.vendor}
        </p>
        <h3 className="mb-3 leading-snug" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
          {training.title}
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
            <Clock className="h-3.5 w-3.5" />{training.duration}
          </div>
          <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
            {training.level}
          </span>
        </div>
        <ul className="flex flex-col gap-1.5 mb-4 flex-1">
          {training.includes.map((item) => (
            <li key={item} className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦60,000</span>
          </div>
          <Link
            to="/checkout"
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 2px 10px rgba(0,162,182,0.25)', display: 'flex', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
          >
            <Award className="h-4 w-4" /> Enroll Now
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Self-Paced course card from API ───────────────────────────────── */

function SelfPacedCard({ course }: { course: ApiCourse }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--ace-shadow-sm)', textDecoration: 'none' }}
    >
      {course.image ? (
        <div style={{ height: 148, overflow: 'hidden', flexShrink: 0 }}>
          <ImageWithFallback
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="flex items-end p-4 flex-shrink-0" style={{ height: 148, background: 'linear-gradient(135deg,#050D1A,#0A1628)' }}>
          <span className="text-white/80 leading-tight" style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
            {course.title.split(' ').slice(0, 4).join(' ')}
          </span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {course.category && (
          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ace-brand)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>
            {course.category}
          </span>
        )}
        <h3 className="mb-2 leading-snug line-clamp-2" style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
          {course.title}
        </h3>
        <p className="flex-1 mb-3 line-clamp-2 leading-relaxed" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          {course.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {course.duration && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ fontSize: '0.67rem', fontWeight: 600, backgroundColor: 'rgba(0,162,182,0.1)', color: 'var(--ace-brand)', border: '1px solid rgba(0,162,182,0.2)', fontFamily: 'var(--ace-font)' }}>
              <Clock className="h-3 w-3" />{course.duration}
            </span>
          )}
          {course.videos && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ fontSize: '0.67rem', fontWeight: 600, backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)', fontFamily: 'var(--ace-font)' }}>
              <Play className="h-3 w-3" />{course.videos}
            </span>
          )}
          {course.questions && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ fontSize: '0.67rem', fontWeight: 600, backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', fontFamily: 'var(--ace-font)' }}>
              <HelpCircle className="h-3 w-3" />{course.questions}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>₦60,000</span>
          <span className="flex items-center gap-1" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
            View <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Self-Paced section (API-driven) ──────────────────────────────── */

const SELF_PACED_FALLBACK: ApiCourse[] = CSV_COURSES.slice(0, 8).map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  image: c.image,
  duration: c.duration,
  videos: c.videos,
  questions: c.questions,
  category: c.category,
  price: c.price,
  format: 'Self-Paced',
  level: 'Intermediate',
}));

function SelfPacedSection() {
  const { data, loading, error, slowConnection, refetch } = useApi(
    () => apiGetCourses({ format: 'self-paced' }),
    [],
  );

  const courses: ApiCourse[] = (data && data.length > 0) ? data : SELF_PACED_FALLBACK;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ace-brand)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>
            Self-Paced
          </p>
          <h2 style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>
            Learn on Your Schedule
          </h2>
        </div>
        <Link
          to="/courses"
          className="hidden sm:flex items-center gap-1"
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}
        >
          Browse all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {loading && slowConnection && <ConnectionNotice />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div>
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-6" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#ef4444' }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              Could not reach the server. Showing local course catalog.
            </p>
            <button onClick={refetch} className="ml-auto flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {courses.map((c) => <SelfPacedCard key={c.id} course={c} />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((c) => <SelfPacedCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}

/* ─── For Individuals view ──────────────────────────────────────────── */

function IndividualView() {
  const PATHS = [
    { icon: '🛡️', title: 'Cybersecurity Track', desc: 'From Security+ to CISSP — build your security career from the ground up.', link: '/courses?category=Cybersecurity' },
    { icon: '☁️', title: 'Cloud Computing Track', desc: 'AWS, Azure, GCP — become a cloud architect or engineer.', link: '/courses?category=Cloud' },
    { icon: '🌐', title: 'Networking Track', desc: 'CompTIA Network+, CCNA, and beyond — master modern networking.', link: '/courses?category=Cisco' },
    { icon: '📊', title: 'Project Management Track', desc: 'PMP, PMI-RMP, Agile Scrum — lead any project with confidence.', link: '/courses?category=Project+Management' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="rounded-3xl p-8 mb-10" style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(0,162,182,0.2)' }}>
            <User className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>For Individuals</p>
            <h2 className="text-white" style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
              Invest in Your Career
            </h2>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', maxWidth: 540, marginBottom: 24, fontFamily: 'var(--ace-font)' }}>
          Structured learning paths designed for individual learners. Choose your own pace, format, and certification target.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Self-Paced Courses', icon: BookOpen, href: '/courses' },
            { label: 'Live Bootcamps', icon: Users, href: '/courses' },
            { label: 'Practice Exams', icon: Award, href: '/practice-exams' },
            { label: 'Mentorship', icon: User, href: '/mentorship' },
          ].map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              to={href}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,162,182,0.2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* Learning paths */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, fontFamily: 'var(--ace-font)' }}>Popular Learning Paths</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {PATHS.map((p) => (
          <Link
            key={p.title}
            to={p.link}
            className="rounded-2xl p-5 flex flex-col gap-3 group transition-all duration-200 hover:-translate-y-1"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', textDecoration: 'none', boxShadow: 'var(--ace-shadow-sm)' }}
          >
            <span style={{ fontSize: '2rem' }}>{p.icon}</span>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{p.title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>{p.desc}</p>
            <span className="flex items-center gap-1 mt-auto" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              Explore <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Self-paced courses */}
      <SelfPacedSection />

      {/* Financing CTA */}
      <div className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex-1">
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>Financing Available</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Split your training into manageable monthly payments. No interest options available.</p>
        </div>
        <Link to="/checkout" className="px-5 py-2.5 rounded-full font-semibold text-white flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
          Apply for Financing
        </Link>
      </div>
    </div>
  );
}

/* ─── For Business view ─────────────────────────────────────────────── */

function BusinessView() {
  const SOLUTIONS = [
    { icon: '🏢', title: 'Team Upskilling', desc: 'Structured certification pathways for IT teams. Volume discounts for 5+ seats.', tag: 'Most Popular' },
    { icon: '📋', title: 'Custom Curriculum', desc: 'We build a bespoke training programme around your organisation\'s technology stack and goals.', tag: null },
    { icon: '🏛️', title: 'Government & DoD', desc: 'GSA Schedule pricing, DoD 8570/8140 compliance packages, and GI Bill® approved courses.', tag: 'Compliance Ready' },
    { icon: '🌍', title: 'On-Site Delivery', desc: 'Bring our certified instructors to your location — anywhere in the world.', tag: null },
  ];

  const [form, setForm] = useState({ name: '', company: '', email: '', teamSize: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="rounded-3xl p-8 mb-10" style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
            <Building2 className="h-5 w-5" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', fontFamily: 'var(--ace-font)' }}>For Business</p>
            <h2 className="text-white" style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
              Upskill Your Entire Team
            </h2>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', maxWidth: 540, marginBottom: 24, fontFamily: 'var(--ace-font)' }}>
          Volume licensing, custom programmes, on-site delivery, and dedicated account management — training scaled to your organisation.
        </p>
        <div className="flex flex-wrap gap-4">
          {[['5+', 'Seats minimum'], ['40%', 'Volume discount'], ['24/7', 'Dedicated support'], ['Custom', 'Curriculum']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-white" style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--ace-font)' }}>{val}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--ace-font)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solutions grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {SOLUTIONS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
              {s.tag && (
                <span className="px-2.5 py-0.5 rounded-full text-white" style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                  {s.tag}
                </span>
              )}
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{s.title}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.65, fontFamily: 'var(--ace-font)' }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Corporate training cards */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, fontFamily: 'var(--ace-font)' }}>Corporate Training Packages</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {TRAININGS.filter(t => t.format === 'Corporate').map((t) => (
          <TrainingCard key={t.id} training={t} />
        ))}
      </div>

      {/* Quote request form */}
      <div className="rounded-3xl p-8" style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-white mb-2" style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>Request a Corporate Quote</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>
          Tell us about your team and we'll prepare a custom training proposal within 24 hours.
        </p>
        {submitted ? (
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#22c55e' }} />
            <p style={{ fontWeight: 600, color: '#22c55e', fontFamily: 'var(--ace-font)' }}>Request received — our team will be in touch within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
              { key: 'company', label: 'Company', placeholder: 'Acme Corp', type: 'text' },
              { key: 'email', label: 'Work Email', placeholder: 'jane@company.com', type: 'email' },
              { key: 'teamSize', label: 'Team Size', placeholder: '10 employees', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>Training Requirements</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe your training goals, preferred format, and timeline…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="px-8 py-3 rounded-full font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Overview view ─────────────────────────────────────────────────── */

function OverviewView() {
  const [activeFormat, setActiveFormat] = useState<Format>('All');
  const [activeLevel, setActiveLevel] = useState<Level>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => TRAININGS.filter((t) => {
    const mF = activeFormat === 'All' || t.format === activeFormat;
    const mL = activeLevel === 'All' || t.level === activeLevel;
    const mQ = !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.cert.toLowerCase().includes(query.toLowerCase()) || t.vendor.toLowerCase().includes(query.toLowerCase());
    return mF && mL && mQ;
  }), [activeFormat, activeLevel, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search courses, certifications, vendors…"
          className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Format</span>
          {FORMATS.map((f) => {
            const Icon = FORMAT_ICON[f] ?? BookOpen;
            return (
              <button
                key={f}
                onClick={() => setActiveFormat(f)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-all"
                style={{ fontSize: '0.82rem', backgroundColor: activeFormat === f ? 'var(--ace-brand)' : 'var(--card)', color: activeFormat === f ? '#fff' : 'var(--muted-foreground)', border: `1px solid ${activeFormat === f ? 'var(--ace-brand)' : 'var(--border)'}`, fontFamily: 'var(--ace-font)' }}
              >
                {f !== 'All' && <Icon className="h-3.5 w-3.5" />}{f}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Level</span>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setActiveLevel(l)}
              className="px-4 py-2 rounded-full font-semibold transition-all"
              style={{ fontSize: '0.82rem', backgroundColor: activeLevel === l ? 'var(--ace-brand)' : 'var(--card)', color: activeLevel === l ? '#fff' : 'var(--muted-foreground)', border: `1px solid ${activeLevel === l ? 'var(--ace-brand)' : 'var(--border)'}`, fontFamily: 'var(--ace-font)' }}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="ml-auto self-center" style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          {filtered.length} courses
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--border)' }} />
          <p style={{ fontWeight: 500, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((t) => <TrainingCard key={t.id} training={t} />)}
        </div>
      )}

      {/* Self-paced from API */}
      <SelfPacedSection />
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */

const SUB_NAV: { key: SubNav; label: string; icon: React.ElementType }[] = [
  { key: 'overview',    label: 'Training Overview', icon: BookOpen   },
  { key: 'individual',  label: 'For Individuals',   icon: User       },
  { key: 'business',    label: 'For Business',       icon: Building2  },
];

export default function TrainingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as SubNav) ?? 'overview';

  const setTab = (tab: SubNav) => {
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* ── Dark hero ───────────────────────────────────── */}
      <div className="pt-24 sm:pt-28 pb-14 px-4" style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>Training</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
            Expert-Led Certification Training
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 540, marginBottom: 28, fontFamily: 'var(--ace-font)' }}>
            Choose from in-person bootcamps, live online classes, self-paced courses, or corporate programmes — all built to get you certified fast.
          </p>

          {/* Format highlights */}
          <div className="flex flex-wrap gap-3">
            {[
              { Icon: Users,     label: 'In-Person Bootcamps',  sub: 'Immersive 3–10 day training' },
              { Icon: Monitor,   label: 'Live Online',           sub: 'Real-time virtual classrooms' },
              { Icon: BookOpen,  label: 'Self-Paced',            sub: 'Learn on your schedule'      },
              { Icon: Building2, label: 'Corporate',             sub: 'Custom team programmes'      },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Icon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                <div>
                  <p className="text-white font-semibold" style={{ fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontFamily: 'var(--ace-font)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub-navigation ──────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 64, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SUB_NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-4 py-4 font-semibold whitespace-nowrap transition-all flex-shrink-0 border-b-2"
                style={{
                  fontSize: '0.85rem',
                  color: activeTab === key ? 'var(--ace-brand)' : 'var(--muted-foreground)',
                  borderBottomColor: activeTab === key ? 'var(--ace-brand)' : 'transparent',
                  fontFamily: 'var(--ace-font)',
                }}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'overview'   && <OverviewView />}
            {activeTab === 'individual' && <IndividualView />}
            {activeTab === 'business'   && <BusinessView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
