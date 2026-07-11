import React, { useState } from 'react';
import { BookOpen, Users, Monitor, Award, Clock, CheckCircle, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

type Format = 'All' | 'Bootcamp' | 'Live Online' | 'Self-Paced';
type Level = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface Training {
  id: string;
  title: string;
  cert: string;
  vendor: string;
  format: Exclude<Format, 'All'>;
  level: Exclude<Level, 'All'>;
  duration: string;
  price: number;
  originalPrice: number;
  includes: string[];
  color: string;
  popular?: boolean;
}

const TRAININGS: Training[] = [
  {
    id: 't1', title: 'CompTIA Security+ Bootcamp', cert: 'Security+', vendor: 'CompTIA',
    format: 'Bootcamp', level: 'Intermediate', duration: '5 Days', price: 2195, originalPrice: 2695,
    includes: ['Courseware', 'Exam Voucher', 'Free Retake', 'Lab Access'],
    color: '#c0392b', popular: true,
  },
  {
    id: 't2', title: 'CISSP Intensive Bootcamp', cert: 'CISSP', vendor: 'ISC2',
    format: 'Bootcamp', level: 'Advanced', duration: '6 Days', price: 2895, originalPrice: 3395,
    includes: ['Official Courseware', 'Exam Voucher', 'Practice Exams', 'Mentorship'],
    color: '#005f6b', popular: true,
  },
  {
    id: 't3', title: 'CCNA Live Online Training', cert: 'CCNA', vendor: 'Cisco',
    format: 'Live Online', level: 'Intermediate', duration: '5 Days', price: 1895, originalPrice: 2295,
    includes: ['Live Instructor', 'Lab Access', 'Recording Access', 'Study Guide'],
    color: '#1ba0d8',
  },
  {
    id: 't4', title: 'AWS Solutions Architect Live', cert: 'SAA-C03', vendor: 'AWS',
    format: 'Live Online', level: 'Intermediate', duration: '4 Days', price: 1695, originalPrice: 1995,
    includes: ['Live Instructor', 'AWS Labs', 'Practice Exams', 'Recording'],
    color: '#ff9900',
  },
  {
    id: 't5', title: 'CompTIA A+ Self-Paced', cert: 'A+', vendor: 'CompTIA',
    format: 'Self-Paced', level: 'Beginner', duration: '180 Days Access', price: 499, originalPrice: 799,
    includes: ['On-Demand Videos', 'Study Guide', 'Practice Questions', 'Exam Vouchers (x2)'],
    color: '#c0392b',
  },
  {
    id: 't6', title: 'Azure Administrator Self-Paced', cert: 'AZ-104', vendor: 'Microsoft',
    format: 'Self-Paced', level: 'Intermediate', duration: '180 Days Access', price: 599, originalPrice: 899,
    includes: ['On-Demand Videos', 'Azure Labs', 'Practice Exams', 'Exam Voucher'],
    color: '#0078d4',
  },
  {
    id: 't7', title: 'PMP Exam Prep Bootcamp', cert: 'PMP', vendor: 'PMI',
    format: 'Bootcamp', level: 'Advanced', duration: '4 Days', price: 2495, originalPrice: 2995,
    includes: ['35 PDUs', 'PMBOK® Guide', 'Practice Exams', 'Exam Prep Toolkit'],
    color: '#2c5282',
  },
  {
    id: 't8', title: 'Network+ Live Online', cert: 'Network+', vendor: 'CompTIA',
    format: 'Live Online', level: 'Beginner', duration: '5 Days', price: 1595, originalPrice: 1895,
    includes: ['Live Instructor', 'Study Guide', 'Practice Exams', 'Recording Access'],
    color: '#c0392b',
  },
  {
    id: 't9', title: 'CISM Certification Bootcamp', cert: 'CISM', vendor: 'ISACA',
    format: 'Bootcamp', level: 'Advanced', duration: '4 Days', price: 2695, originalPrice: 3195,
    includes: ['CISM QAE Manual', 'Practice Exams', 'Exam Voucher', 'CPE Credits'],
    color: '#4a4a8a',
  },
];

const FORMATS: Format[] = ['All', 'Bootcamp', 'Live Online', 'Self-Paced'];
const LEVELS: Level[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const FORMAT_ICON: Record<string, React.ElementType> = {
  Bootcamp: Users,
  'Live Online': Monitor,
  'Self-Paced': BookOpen,
};

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#dcfce7', text: '#16a34a' },
  Intermediate: { bg: '#fef3c7', text: '#d97706' },
  Advanced:     { bg: '#fee2e2', text: '#dc2626' },
};

function TrainingCard({ training }: { training: Training }) {
  const FormatIcon = FORMAT_ICON[training.format];
  const lvl = LEVEL_STYLE[training.level];

  return (
    <article
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-card border border-border"
    >
      <div className="h-2 w-full" style={{ backgroundColor: training.color }} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${training.color}18` }}
            >
              <FormatIcon className="h-4 w-4" style={{ color: training.color }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: training.color }}>
              {training.format}
            </span>
          </div>
          {training.popular && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: '#00A2B6' }}
            >
              Popular
            </span>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: training.color }}>
          {training.vendor}
        </p>
        <h3 className="mb-3 leading-snug text-foreground" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
          {training.title}
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {training.duration}
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: lvl.bg, color: lvl.text }}
          >
            {training.level}
          </span>
        </div>

        <ul className="space-y-1.5 mb-4">
          {training.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00A2B6' }}>
              ₦60,000
            </span>
          </div>

          <button
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:opacity-90"
            style={{ backgroundColor: '#00A2B6' }}
          >
            <Award className="h-4 w-4" /> Enroll Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TrainingPage() {
  const [activeFormat, setActiveFormat] = useState<Format>('All');
  const [activeLevel, setActiveLevel] = useState<Level>('All');
  const [query, setQuery] = useState('');


  const filtered = TRAININGS.filter((t) => {
    const matchFormat = activeFormat === 'All' || t.format === activeFormat;
    const matchLevel = activeLevel === 'All' || t.level === activeLevel;
    const matchQuery = !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.cert.toLowerCase().includes(query.toLowerCase()) || t.vendor.toLowerCase().includes(query.toLowerCase());
    return matchFormat && matchLevel && matchQuery;
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }} className="pt-24 sm:pt-28 pb-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" style={{ color: '#00A2B6' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00A2B6' }}>Training</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800 }}>
            Expert-Led Certification Training
          </h1>
          <p className="text-white/60 mb-8" style={{ fontSize: '1.05rem', maxWidth: 540 }}>
            Choose from in-person bootcamps, live online classes, or self-paced courses — all designed to get you certified fast.
          </p>

          {/* Format highlights */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { Icon: Users, label: 'In-Person Bootcamps', sub: 'Immersive 3–10 day training' },
              { Icon: Monitor, label: 'Live Online', sub: 'Real-time virtual classrooms' },
              { Icon: BookOpen, label: 'Self-Paced', sub: 'Learn on your schedule' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/15">
                <Icon className="h-5 w-5 flex-shrink-0" style={{ color: '#00A2B6' }} />
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course, certification, or vendor…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 shadow-lg"
              style={{ '--tw-ring-color': '#00A2B6' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider self-center mr-1 text-muted-foreground">Format</span>
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFormat(f)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: activeFormat === f ? '#00A2B6' : 'var(--card)',
                  color: activeFormat === f ? '#fff' : 'var(--muted-foreground)',
                  border: `1px solid ${activeFormat === f ? '#00A2B6' : 'var(--border)'}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider self-center mr-1 text-muted-foreground">Level</span>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setActiveLevel(l)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: activeLevel === l ? '#00A2B6' : 'var(--card)',
                  color: activeLevel === l ? '#fff' : 'var(--muted-foreground)',
                  border: `1px solid ${activeLevel === l ? '#00A2B6' : 'var(--border)'}`,
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="ml-auto self-center text-sm text-muted-foreground">{filtered.length} courses</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-border" />
            <p className="font-medium text-muted-foreground">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => <TrainingCard key={t.id} training={t} />)}
          </div>
        )}

        {/* Corporate CTA */}
        <div
          className="mt-12 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center gap-6"
          style={{ background: 'linear-gradient(135deg,#071224,#0B1D3A)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex-1">
            <p className="text-white font-bold mb-1" style={{ fontSize: '1.1rem' }}>Training for your team?</p>
            <p className="text-white/55 text-sm">We offer volume pricing, custom schedules, and on-site delivery for enterprise teams.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/host-a-course"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              Host a Course <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/#contact"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-1"
              style={{ backgroundColor: '#00A2B6' }}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
