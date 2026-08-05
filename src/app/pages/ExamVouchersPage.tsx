import React, { useState } from 'react';
import { Ticket, ShieldCheck, Zap, Star, ChevronDown, ChevronUp, Search, Wifi, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useApi, apiGetExamVouchers, apiAddToCart, minorToMajor, formatPrice } from '../lib/api';
import type { ExamVoucher } from '../lib/api';

type Vendor = string;

interface Voucher {
  id: string;
  vendor: Vendor;
  exam: string;
  examCode: string;
  price: number;
  originalPrice: number;
  currency: string;
  badge?: string;
  popular?: boolean;
  color: string;
}

/* GET /api/exam-vouchers returns the ExamVoucher entity: vendor / examName /
   examCode with money in minor units. Flattened onto the card's shape here. */
function fromApi(v: ExamVoucher): Voucher {
  return {
    id: v.id,
    vendor: v.vendor,
    exam: v.examName,
    examCode: v.examCode,
    price: minorToMajor(v.priceMinor),
    originalPrice: v.originalPriceMinor != null ? minorToMajor(v.originalPriceMinor) : minorToMajor(v.priceMinor),
    currency: v.currency,
    badge: v.badge ?? undefined,
    popular: v.popular,
    color: v.color || '#00A2B6',
  };
}

const VENDOR_LOGO: Record<string, string> = {
  CompTIA: 'CT',
  Microsoft: 'MS',
  Cisco: 'CSC',
  ISC2: 'ISC²',
  ISACA: 'ISA',
  AWS: 'AWS',
  PMI: 'PMI',
};

/** Two- to three-letter mark for a vendor the logo map doesn't know about. */
const vendorMark = (vendor: string) =>
  VENDOR_LOGO[vendor] ?? vendor.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const { addToCart } = useCart();

  const courseForCart = {
    id: voucher.id,
    title: `${voucher.vendor} ${voucher.exam} Exam Voucher`,
    shortTitle: voucher.examCode,
    description: `Official ${voucher.vendor} exam voucher for ${voucher.exam} (${voucher.examCode})`,
    category: voucher.vendor as any,
    price: voucher.price,
    originalPrice: voucher.originalPrice,
    currency: voucher.currency,
    duration: 'Voucher',
    delivery: 'Emailed voucher code',
    level: 'All Levels' as any,
    type: 'online' as any,
    gradient: '',
    image: undefined,
    videos: undefined,
    /* Tells the checkout which backend catalog this id belongs to. */
    itemType: 'exam_voucher' as const,
  };

  return (
    <article
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-card border border-border"
      style={{ fontFamily: 'var(--ace-font)' }}
    >
      <div className="h-2 w-full" style={{ backgroundColor: voucher.color }} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div
            className="h-10 w-14 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ backgroundColor: voucher.color }}
          >
            {vendorMark(voucher.vendor)}
          </div>

          <div className="flex flex-col items-end gap-1">
            {voucher.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#F97316' }}>
                {voucher.badge}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              Official Price
            </span>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: voucher.color }}>
          {voucher.vendor}
        </p>
        <h3 className="text-card-foreground mb-1 leading-snug" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
          {voucher.exam}
        </h3>
        <p className="text-xs mb-4 text-muted-foreground">Exam code: {voucher.examCode}</p>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ace-brand)' }}>
              {formatPrice(voucher.price, voucher.currency)}
            </span>
            {voucher.originalPrice > voucher.price && (
              <span className="text-xs line-through text-muted-foreground">
                {formatPrice(voucher.originalPrice, voucher.currency)}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              addToCart(courseForCart);
              /* Keeps the signed-in user's server-side cart in step; a no-op
                 (rejected and swallowed) for signed-out visitors. */
              apiAddToCart('exam_voucher', voucher.id).catch(() => {});
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:opacity-90"
            style={{ backgroundColor: 'var(--ace-brand)' }}
          >
            <Ticket className="h-4 w-4" /> Buy Voucher
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ExamVouchersPage() {
  const [activeVendor, setActiveVendor] = useState<Vendor>('All');
  const [query, setQuery] = useState('');

  /* GET /api/exam-vouchers — filtering stays client-side so the vendor tabs and
     search box respond instantly once the catalog is in hand. */
  const { data, loading, error, slowConnection } = useApi(
    () => apiGetExamVouchers({ limit: 100 }),
    [],
  );

  const vouchers: Voucher[] = (data ?? []).map(fromApi);

  const VENDORS: Vendor[] = ['All', ...Array.from(new Set(vouchers.map((v) => v.vendor))).sort()];

  const filtered = vouchers.filter((v) => {
    const matchVendor = activeVendor === 'All' || v.vendor === activeVendor;
    const matchQuery = !query || v.exam.toLowerCase().includes(query.toLowerCase()) || v.examCode.toLowerCase().includes(query.toLowerCase()) || v.vendor.toLowerCase().includes(query.toLowerCase());
    return matchVendor && matchQuery;
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }} className="pt-24 sm:pt-28 pb-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ace-brand)' }}>Exam Vouchers</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800 }}>
            Discounted Exam Vouchers
          </h1>
          <p className="text-white/60 mb-8" style={{ fontSize: '1.05rem', maxWidth: 520 }}>
            Buy official exam vouchers at exclusive Acecerty prices.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { icon: ShieldCheck, text: 'Official Vouchers' },
              { icon: Zap, text: 'Instant Delivery' },
              { icon: Star, text: 'Best Price Guarantee' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15">
                <Icon className="h-4 w-4" style={{ color: 'var(--ace-brand)' }} />
                <span className="text-white/80 text-sm font-medium">{text}</span>
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
              placeholder="Search vouchers by exam or vendor…"
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
            <Wifi className="h-4 w-4 animate-pulse shrink-0" /> Loading the voucher catalog…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'var(--muted)', color: 'var(--destructive)' }}>
            <AlertCircle className="h-4 w-4 shrink-0" /> Could not load the voucher catalog: {error}
          </div>
        )}

        {/* Vendor filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {VENDORS.map((v) => (
            <button
              key={v}
              onClick={() => setActiveVendor(v)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeVendor === v ? 'var(--ace-brand)' : 'var(--card)',
                color: activeVendor === v ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${activeVendor === v ? 'var(--ace-brand)' : 'var(--border)'}`,
              }}
            >
              {v}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-muted-foreground">{filtered.length} vouchers</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-border" />
            <p className="font-medium text-muted-foreground">
              {vouchers.length === 0 ? 'No vouchers have been published yet' : 'No vouchers match your search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((v) => <VoucherCard key={v.id} voucher={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
