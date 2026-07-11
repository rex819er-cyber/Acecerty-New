import React, { useState } from 'react';
import { Link } from 'react-router';
import { ClipboardCheck, Clock, FileText, BarChart2, ShoppingCart, Star, Search, Play } from 'lucide-react';
import { useCart } from '../context/CartContext';

type Domain = 'All' | 'Cybersecurity' | 'Cloud' | 'Networking' | 'Management' | 'Privacy';

interface PracticeExam {
  id: string;
  domain: Domain;
  cert: string;
  certCode: string;
  questions: number;
  exams: number;
  duration: number;
  price: number;
  originalPrice: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviews: number;
  color: string;
  updated: string;
}

const PRACTICE_EXAMS: PracticeExam[] = [
  { id: 'pe1', domain: 'Cybersecurity', cert: 'CISSP', certCode: 'CISSP', questions: 250, exams: 4, duration: 180, price: 49, originalPrice: 79, difficulty: 'Advanced', rating: 4.9, reviews: 1240, color: '#005f6b', updated: 'May 2026' },
  { id: 'pe2', domain: 'Cybersecurity', cert: 'Security+', certCode: 'SY0-701', questions: 180, exams: 3, duration: 90, price: 29, originalPrice: 49, difficulty: 'Intermediate', rating: 4.8, reviews: 2890, color: '#c0392b', updated: 'Jun 2026' },
  { id: 'pe3', domain: 'Cybersecurity', cert: 'CEH', certCode: 'CEH v13', questions: 125, exams: 2, duration: 120, price: 39, originalPrice: 59, difficulty: 'Advanced', rating: 4.7, reviews: 540, color: '#8b0000', updated: 'Apr 2026' },
  { id: 'pe4', domain: 'Cybersecurity', cert: 'CySA+', certCode: 'CS0-003', questions: 120, exams: 2, duration: 90, price: 29, originalPrice: 49, difficulty: 'Intermediate', rating: 4.6, reviews: 320, color: '#b91c1c', updated: 'May 2026' },
  { id: 'pe5', domain: 'Cloud', cert: 'AWS Solutions Architect', certCode: 'SAA-C03', questions: 130, exams: 2, duration: 90, price: 34, originalPrice: 54, difficulty: 'Intermediate', rating: 4.8, reviews: 1870, color: '#ff9900', updated: 'Jun 2026' },
  { id: 'pe6', domain: 'Cloud', cert: 'Azure Administrator', certCode: 'AZ-104', questions: 120, exams: 2, duration: 90, price: 29, originalPrice: 49, difficulty: 'Intermediate', rating: 4.7, reviews: 980, color: '#0078d4', updated: 'May 2026' },
  { id: 'pe7', domain: 'Cloud', cert: 'CCSP', certCode: 'CCSP', questions: 150, exams: 3, duration: 120, price: 39, originalPrice: 59, difficulty: 'Advanced', rating: 4.7, reviews: 410, color: '#0369a1', updated: 'Mar 2026' },
  { id: 'pe8', domain: 'Networking', cert: 'CCNA', certCode: '200-301', questions: 120, exams: 2, duration: 120, price: 29, originalPrice: 49, difficulty: 'Intermediate', rating: 4.8, reviews: 1560, color: '#1ba0d8', updated: 'May 2026' },
  { id: 'pe9', domain: 'Networking', cert: 'Network+', certCode: 'N10-009', questions: 100, exams: 2, duration: 90, price: 24, originalPrice: 39, difficulty: 'Beginner', rating: 4.7, reviews: 870, color: '#2563eb', updated: 'Jun 2026' },
  { id: 'pe10', domain: 'Management', cert: 'PMP', certCode: 'PMP', questions: 180, exams: 3, duration: 230, price: 44, originalPrice: 69, difficulty: 'Advanced', rating: 4.8, reviews: 2140, color: '#2c5282', updated: 'Apr 2026' },
  { id: 'pe11', domain: 'Management', cert: 'CISM', certCode: 'CISM', questions: 150, exams: 2, duration: 120, price: 39, originalPrice: 59, difficulty: 'Advanced', rating: 4.7, reviews: 580, color: '#4a4a8a', updated: 'Mar 2026' },
  { id: 'pe12', domain: 'Privacy', cert: 'CDPSE', certCode: 'CDPSE', questions: 100, exams: 2, duration: 90, price: 29, originalPrice: 49, difficulty: 'Intermediate', rating: 4.6, reviews: 190, color: '#db2777', updated: 'Feb 2026' },
];

const DOMAINS: Domain[] = ['All', 'Cybersecurity', 'Cloud', 'Networking', 'Management', 'Privacy'];

const DIFFICULTY_COLOR: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#dcfce7', text: '#16a34a' },
  Intermediate: { bg: '#fef3c7', text: '#d97706' },
  Advanced:     { bg: '#fee2e2', text: '#dc2626' },
};

function ExamCard({ exam }: { exam: PracticeExam }) {
  const { addToCart } = useCart();
  const diff = DIFFICULTY_COLOR[exam.difficulty];
  const pctOff = Math.round(((exam.originalPrice - exam.price) / exam.originalPrice) * 100);

  const courseForCart = {
    id: exam.id,
    title: `${exam.cert} Practice Exam Bundle`,
    shortTitle: exam.certCode,
    description: `${exam.questions} questions across ${exam.exams} full-length practice exams for ${exam.cert}`,
    category: exam.domain as any,
    price: exam.price,
    originalPrice: exam.originalPrice,
    duration: '90-day access',
    level: exam.difficulty as any,
    type: 'online' as any,
    gradient: '',
    image: undefined,
    videos: undefined,
  };

  return (
    <article
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-card border border-border"
    >
      {/* Colour band */}
      <div
        className="h-28 flex items-end p-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${exam.color}dd, ${exam.color}99)` }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 inline-block"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {exam.domain}
          </span>
          <p className="text-white/90 text-2xl font-black leading-none">{exam.certCode}</p>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: '#F97316' }}
          >
            -{pctOff}%
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="mb-1 leading-snug text-foreground" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
          {exam.cert} Practice Exams
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3"
                fill={i < Math.floor(exam.rating) ? 'var(--ace-brand)' : 'none'}
                style={{ color: 'var(--ace-brand)' }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">{exam.rating}</span>
          <span className="text-xs text-muted-foreground">({exam.reviews.toLocaleString()})</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: FileText, value: `${exam.questions}`, label: 'Questions' },
            { icon: ClipboardCheck, value: `${exam.exams}`, label: 'Exams' },
            { icon: Clock, value: `${exam.duration}m`, label: 'Per Exam' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center rounded-xl py-2 px-1 bg-muted">
              <Icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 mt-auto">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: diff.bg, color: diff.text }}
          >
            {exam.difficulty}
          </span>
          <span className="text-[10px] text-muted-foreground">Updated {exam.updated}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="font-black text-ace-brand" style={{ fontSize: '1.2rem' }}>₦60,000</span>
          <span className="text-xs text-muted-foreground">90-day access</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(courseForCart)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:opacity-90"
            style={{ backgroundColor: 'var(--ace-brand)' }}
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
          <Link
            to={`/practice-exams/${exam.certCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] bg-muted text-foreground"
          >
            <Play className="h-4 w-4" /> Try Free
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PracticeExamsPage() {
  const [activeDomain, setActiveDomain] = useState<Domain>('All');
  const [query, setQuery] = useState('');

  const filtered = PRACTICE_EXAMS.filter((e) => {
    const matchDomain = activeDomain === 'All' || e.domain === activeDomain;
    const matchQuery = !query || e.cert.toLowerCase().includes(query.toLowerCase()) || e.certCode.toLowerCase().includes(query.toLowerCase());
    return matchDomain && matchQuery;
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }} className="pt-24 sm:pt-28 pb-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ace-brand)' }}>Practice Exams</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800 }}>
            Exam-Realistic Practice Tests
          </h1>
          <p className="text-white/60 mb-8" style={{ fontSize: '1.05rem', maxWidth: 520 }}>
            Full-length practice exams written by certified experts. Detailed explanations for every question so you understand, not just memorise.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { icon: BarChart2, value: '95%', label: 'Pass Rate' },
              { icon: FileText, value: '2,500+', label: 'Questions' },
              { icon: ClipboardCheck, value: '30+', label: 'Exams Available' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/15">
                <Icon className="h-5 w-5" style={{ color: '#F97316' }} />
                <div>
                  <p className="text-white font-bold">{value}</p>
                  <p className="text-white/50 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by certification or code…"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 shadow-lg"
              style={{ '--tw-ring-color': 'var(--ace-brand)' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Domain filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDomain(d)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeDomain === d ? 'var(--ace-brand)' : 'var(--card)',
                color: activeDomain === d ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${activeDomain === d ? 'var(--ace-brand)' : 'var(--border)'}`,
              }}
            >
              {d}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-muted-foreground">{filtered.length} exams</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <ClipboardCheck className="h-12 w-12 text-border mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No practice exams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((e) => <ExamCard key={e.id} exam={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}
