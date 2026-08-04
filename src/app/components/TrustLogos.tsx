import React from 'react';
import { motion } from 'motion/react';

interface CertBadge {
  name: string;
  full: string;
  accent: string;
  bg: string;
}

const CERT_LOGOS: CertBadge[] = [
  { name: 'CompTIA', full: 'CompTIA', accent: '#E31837', bg: 'rgba(227,24,55,0.10)' },
  { name: 'Cisco', full: 'Cisco', accent: '#1BA0D7', bg: 'rgba(27,160,215,0.10)' },
  { name: 'AWS', full: 'Amazon Web Services', accent: '#FF9900', bg: 'rgba(255,153,0,0.10)' },
  { name: 'Microsoft', full: 'Microsoft', accent: '#00A4EF', bg: 'rgba(0,164,239,0.10)' },
  { name: 'PMI', full: 'Project Management Institute', accent: '#003087', bg: 'rgba(0,48,135,0.10)' },
  { name: '(ISC)²', full: 'ISC Squared', accent: '#6B21A8', bg: 'rgba(107,33,168,0.10)' },
  { name: 'EC-Council', full: 'EC-Council', accent: '#00A651', bg: 'rgba(0,166,81,0.10)' },
  { name: 'ISACA', full: 'ISACA', accent: '#D4A017', bg: 'rgba(212,160,23,0.10)' },
  { name: 'Google', full: 'Google Cloud', accent: '#4285F4', bg: 'rgba(66,133,244,0.10)' },
  { name: 'Linux', full: 'Linux Foundation', accent: '#FCC624', bg: 'rgba(252,198,36,0.10)' },
  { name: 'VMware', full: 'VMware', accent: '#607079', bg: 'rgba(96,112,121,0.10)' },
];

function CertBadge({ badge }: { badge: CertBadge }) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
      style={{ backgroundColor: badge.bg, border: `1px solid ${badge.accent}28` }}
    >
      {/* Colour dot / monogram */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: badge.accent }}
      >
        <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--ace-font)' }}>
          {badge.name.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase()}
        </span>
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)', whiteSpace: 'nowrap' }}>
        {badge.name}
      </span>
    </div>
  );
}

export function TrustLogos() {
  const doubled = [...CERT_LOGOS, ...CERT_LOGOS];

  return (
    <section
      className="py-12 overflow-hidden"
      style={{ backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          Official Certification Partners
        </p>
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--foreground)', marginTop: 6, fontFamily: 'var(--ace-font)' }}>
          Train for the world's most recognised IT certifications
        </p>
      </div>

      {/* Scrolling marquee track */}
      <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
        <motion.div
          className="flex gap-3"
          style={{ width: 'max-content' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {doubled.map((badge, i) => (
            <CertBadge key={`${badge.name}-${i}`} badge={badge} />
          ))}
        </motion.div>
      </div>

      {/* Static grid fallback for reduced-motion / no-JS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
      </div>
    </section>
  );
}
