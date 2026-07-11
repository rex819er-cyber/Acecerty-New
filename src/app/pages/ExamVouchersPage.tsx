import React, { useState } from 'react';
import { Ticket, ShieldCheck, Zap, Star, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

type Vendor = 'All' | 'CompTIA' | 'Microsoft' | 'Cisco' | 'ISC2' | 'ISACA' | 'AWS' | 'PMI';

interface Voucher {
  id: string;
  vendor: Vendor;
  exam: string;
  examCode: string;
  price: number;
  originalPrice: number;
  badge?: string;
  popular?: boolean;
  color: string;
}

const VOUCHERS: Voucher[] = [
  { id: 'v1', vendor: 'CompTIA', exam: 'Security+', examCode: 'SY0-701', price: 370, originalPrice: 404, popular: true, badge: 'Best Seller', color: '#c0392b' },
  { id: 'v2', vendor: 'CompTIA', exam: 'Network+', examCode: 'N10-009', price: 329, originalPrice: 369, color: '#c0392b' },
  { id: 'v3', vendor: 'CompTIA', exam: 'A+', examCode: 'Core 1 + Core 2', price: 460, originalPrice: 508, color: '#c0392b' },
  { id: 'v4', vendor: 'CompTIA', exam: 'CySA+', examCode: 'CS0-003', price: 370, originalPrice: 404, color: '#c0392b' },
  { id: 'v5', vendor: 'Microsoft', exam: 'Azure Administrator', examCode: 'AZ-104', price: 165, originalPrice: 185, popular: true, color: '#0078d4' },
  { id: 'v6', vendor: 'Microsoft', exam: 'Azure Fundamentals', examCode: 'AZ-900', price: 165, originalPrice: 185, color: '#0078d4' },
  { id: 'v7', vendor: 'Microsoft', exam: 'Security, Compliance & Identity', examCode: 'SC-900', price: 165, originalPrice: 185, color: '#0078d4' },
  { id: 'v8', vendor: 'Cisco', exam: 'CCNA', examCode: '200-301', price: 330, originalPrice: 395, popular: true, badge: 'Hot', color: '#1ba0d8' },
  { id: 'v9', vendor: 'Cisco', exam: 'CCNP Enterprise', examCode: '350-401', price: 400, originalPrice: 450, color: '#1ba0d8' },
  { id: 'v10', vendor: 'ISC2', exam: 'CISSP', examCode: 'CISSP', price: 699, originalPrice: 749, popular: true, badge: 'Gold Standard', color: '#005f6b' },
  { id: 'v11', vendor: 'ISC2', exam: 'CCSP', examCode: 'CCSP', price: 599, originalPrice: 649, color: '#005f6b' },
  { id: 'v12', vendor: 'ISACA', exam: 'CISM', examCode: 'CISM', price: 575, originalPrice: 625, color: '#4a4a8a' },
  { id: 'v13', vendor: 'ISACA', exam: 'CISA', examCode: 'CISA', price: 575, originalPrice: 625, color: '#4a4a8a' },
  { id: 'v14', vendor: 'AWS', exam: 'Solutions Architect Associate', examCode: 'SAA-C03', price: 150, originalPrice: 175, popular: true, color: '#ff9900' },
  { id: 'v15', vendor: 'AWS', exam: 'Cloud Practitioner', examCode: 'CLF-C02', price: 100, originalPrice: 125, color: '#ff9900' },
  { id: 'v16', vendor: 'PMI', exam: 'PMP', examCode: 'PMP', price: 555, originalPrice: 605, badge: 'PMI Member Rate', color: '#2c5282' },
];

const VENDORS: Vendor[] = ['All', 'CompTIA', 'Microsoft', 'Cisco', 'ISC2', 'ISACA', 'AWS', 'PMI'];

const VENDOR_LOGO: Record<string, string> = {
  CompTIA: 'CT',
  Microsoft: 'MS',
  Cisco: 'CSC',
  ISC2: 'ISC²',
  ISACA: 'ISA',
  AWS: 'AWS',
  PMI: 'PMI',
};

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const { addToCart } = useCart();

  const courseForCart = {
    id: voucher.id,
    title: `${voucher.vendor} ${voucher.exam} Exam Voucher`,
    shortTitle: voucher.examCode,
    description: `Official ${voucher.vendor} exam voucher for ${voucher.exam} (${voucher.examCode})`,
    category: voucher.vendor as any,
    price: 60000,
    originalPrice: 60000,
    duration: 'Voucher',
    level: 'All Levels' as any,
    type: 'online' as any,
    gradient: '',
    image: undefined,
    videos: undefined,
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
            {VENDOR_LOGO[voucher.vendor]}
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
              ₦60,000
            </span>
          </div>

          <button
            onClick={() => addToCart(courseForCart)}
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

  const filtered = VOUCHERS.filter((v) => {
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
            Buy official exam vouchers at exclusive Acecerty prices — save up to 20% on top certifications.
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

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-border" />
            <p className="font-medium text-muted-foreground">No vouchers found</p>
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
