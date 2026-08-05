import React, { useState } from 'react';
import { Link } from 'react-router';
import { ClipboardCheck, Clock, FileText, BarChart2, ShoppingCart, Star, Search, Play, Wifi, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useApi, apiGetExamProducts, apiAddToCart, minorToMajor, formatPrice } from '../lib/api';
import type { ExamProduct } from '../lib/api';

type Domain = string;

interface PracticeExam {
  id: string;
  slug?: string;
  domain: Domain;
  cert: string;
  certCode: string;
  questions: number;
  exams: number;
  duration: number;
  price: number;
  originalPrice: number;
  currency: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviews: number;
  color: string;
  updated: string;
}

/* Colour is presentational only — the ExamProduct entity carries no palette,
   so each domain gets a stable hue derived from its name. */
const DOMAIN_COLORS = ['#005f6b', '#c0392b', '#ff9900', '#0078d4', '#1ba0d8', '#2c5282', '#db2777', '#4a4a8a'];
const domainColor = (domain: string) => {
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  return DOMAIN_COLORS[h % DOMAIN_COLORS.length];
};

/* GET /api/exam-products returns the ExamProduct entity with money in minor
   units and cert fields under certName / certCode. */
function fromApi(p: ExamProduct): PracticeExam {
  const price = minorToMajor(p.priceMinor);
  return {
    id: p.id,
    slug: p.slug,
    domain: p.domain,
    cert: p.certName,
    certCode: p.certCode,
    questions: p.questionsCount,
    exams: p.examsCount,
    duration: p.perExamDurationMinutes,
    price,
    originalPrice: p.originalPriceMinor != null ? minorToMajor(p.originalPriceMinor) : price,
    currency: p.currency,
    difficulty: p.difficulty ?? 'Intermediate',
    rating: Number(p.ratingAvg ?? 0),
    reviews: Number(p.ratingCount ?? 0),
    color: domainColor(p.domain),
    updated: p.updatedLabel ?? '',
  };
}


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
    currency: exam.currency,
    duration: '90-day access',
    delivery: 'Online, self-paced',
    level: exam.difficulty as any,
    type: 'online' as any,
    gradient: '',
    image: undefined,
    videos: undefined,
    /* Tells the checkout which backend catalog this id belongs to. */
    itemType: 'exam_product' as const,
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
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
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
          {exam.updated && <span className="text-[10px] text-muted-foreground">Updated {exam.updated}</span>}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-ace-brand" style={{ fontSize: '1.2rem' }}>{formatPrice(exam.price, exam.currency)}</span>
            {exam.originalPrice > exam.price && (
              <span className="text-xs line-through text-muted-foreground">{formatPrice(exam.originalPrice, exam.currency)}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">90-day access</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              addToCart(courseForCart);
              /* Keeps the signed-in user's server-side cart in step; a no-op
                 (rejected and swallowed) for signed-out visitors. */
              apiAddToCart('exam_product', exam.id).catch(() => {});
            }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:opacity-90"
            style={{ backgroundColor: 'var(--ace-brand)' }}
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
          <Link
            to={`/practice-exams/${encodeURIComponent(exam.slug ?? exam.certCode)}`}
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

  /* GET /api/exam-products — filtering stays client-side so the domain tabs and
     search box respond instantly once the catalog is in hand. */
  const { data, loading, error, slowConnection } = useApi(
    () => apiGetExamProducts({ limit: 100 }),
    [],
  );

  const exams: PracticeExam[] = (data ?? []).map(fromApi);

  const DOMAINS: Domain[] = ['All', ...Array.from(new Set(exams.map((e) => e.domain))).sort()];

  const filtered = exams.filter((e) => {
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
        {slowConnection && loading && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'var(--ace-brand-light)', color: 'var(--ace-brand)' }}>
            <Wifi className="h-4 w-4 animate-pulse shrink-0" /> Loading the exam catalog…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'var(--muted)', color: 'var(--destructive)' }}>
            <AlertCircle className="h-4 w-4 shrink-0" /> Could not load the exam catalog: {error}
          </div>
        )}

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-80 animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ClipboardCheck className="h-12 w-12 text-border mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              {exams.length === 0 ? 'No practice exams have been published yet' : 'No practice exams match your search'}
            </p>
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
