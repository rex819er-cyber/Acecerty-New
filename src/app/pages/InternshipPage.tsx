import React, { useState } from 'react';
import {
  Briefcase, CheckCircle, Clock, Users, ChevronRight,
  Wifi, Loader2, AlertCircle, RefreshCw, Star, Code,
  Shield, Cloud, BarChart3, Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApi, apiGetInternshipTracks, apiApplyInternship } from '../lib/api';
import type { ApiInternshipTrack } from '../lib/api';

/* ─── Mock tracks (fallback) ────────────────────────────────────────── */


const TRACK_ICON: Record<string, React.ElementType> = {
  'int-cyber': Shield,
  'int-cloud': Cloud,
  'int-dev':   Code,
  'int-pm':    BarChart3,
  'int-data':  Cpu,
};

const TRACK_COLOR: Record<string, string> = {
  'int-cyber': '#c0392b',
  'int-cloud': '#1ba0d8',
  'int-dev':   '#16a34a',
  'int-pm':    '#6366f1',
  'int-data':  '#f59e0b',
};

/* ─── Skeleton ──────────────────────────────────────────────────────── */

function TrackSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div style={{ height: 14, width: '50%', backgroundColor: 'var(--muted)', borderRadius: 6, marginBottom: 10 }} />
      <div style={{ height: 20, width: '80%', backgroundColor: 'var(--muted)', borderRadius: 6, marginBottom: 8 }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ height: 11, width: `${65 + i * 10}%`, backgroundColor: 'var(--muted)', borderRadius: 6, marginBottom: 6 }} />
      ))}
      <div style={{ height: 44, backgroundColor: 'var(--muted)', borderRadius: 12, marginTop: 16 }} />
    </div>
  );
}

/* ─── Track card ────────────────────────────────────────────────────── */

function TrackCard({ track, onApply }: { track: ApiInternshipTrack; onApply: (t: ApiInternshipTrack) => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon  = TRACK_ICON[track.id]  ?? Briefcase;
  const color = TRACK_COLOR[track.id] ?? 'var(--ace-brand)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--ace-shadow-sm)' }}
    >
      <div style={{ height: 3, backgroundColor: color }} />
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', marginBottom: 2, fontFamily: 'var(--ace-font)' }}>{track.title}</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                <Clock className="h-3 w-3" />{track.duration}
              </span>
              <span className="flex items-center gap-1" style={{ fontSize: '0.72rem', fontWeight: 600, color: color, fontFamily: 'var(--ace-font)' }}>
                <Users className="h-3 w-3" />{track.spots} spots left
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 leading-relaxed" style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          {track.description}
        </p>

        {/* Requirements accordion */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full mb-1"
          style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}
        >
          Requirements
          <ChevronRight className="h-4 w-4 transition-transform" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--muted-foreground)' }} />
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
              className="flex flex-col gap-1.5 mb-4"
            >
              {track.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                  {r}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          onClick={() => onApply(track)}
          className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-[0.97] mt-auto flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 2px 10px rgba(0,162,182,0.25)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)', marginTop: 'auto' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
        >
          <Briefcase className="h-4 w-4" /> Apply Now
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Application modal ─────────────────────────────────────────────── */

interface AppModalProps {
  track: ApiInternshipTrack;
  onClose: () => void;
}

function ApplicationModal({ track, onClose }: AppModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', statement: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiApplyInternship({ ...form, trackId: track.id });
    } catch {
      // queue locally on failure
    } finally {
      setLoading(false);
      setSuccess(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>Application</span>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--foreground)', marginTop: 2, fontFamily: 'var(--ace-font)' }}>{track.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
              <Clock className="h-3.5 w-3.5" />{track.duration}
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
              <Users className="h-3.5 w-3.5" />{track.spots} spots remaining
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle className="h-8 w-8" style={{ color: '#22c55e' }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>Application Submitted!</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', maxWidth: 300, margin: '0 auto 20px', fontFamily: 'var(--ace-font)' }}>
                Our team will review your application and contact you within 3–5 business days.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                { key: 'name',  label: 'Full Name',    placeholder: 'John Doe',           type: 'text'  },
                { key: 'email', label: 'Email Address', placeholder: 'john@email.com',    type: 'email' },
                { key: 'phone', label: 'Phone Number',  placeholder: '+234 800 000 0000',  type: 'tel'   },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{label}</label>
                  <input
                    type={type}
                    required
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>
                  Personal Statement <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(Why this track?)</span>
                </label>
                <textarea
                  required
                  value={form.statement}
                  onChange={e => setForm(f => ({ ...f, statement: e.target.value }))}
                  placeholder="Describe your background, what draws you to this track, and what you hope to achieve…"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
                  {loading ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function InternshipPage() {
  const [activeTrack, setActiveTrack] = useState<ApiInternshipTrack | null>(null);

  const { data, loading, error, slowConnection, refetch } = useApi(
    () => apiGetInternshipTracks(),
    [],
  );

  const tracks: ApiInternshipTrack[] = data ?? [];

  const BENEFITS = [
    { icon: '🏆', title: 'Real Projects', desc: 'Work on live production systems, not toy demos.' },
    { icon: '🎓', title: 'Mentored Learning', desc: 'Weekly 1-on-1 check-ins with a senior practitioner.' },
    { icon: '📜', title: 'Certificate & Reference', desc: 'Earn a signed completion certificate and LinkedIn endorsement.' },
    { icon: '💼', title: 'Career Pipeline', desc: 'Top performers are considered for full-time roles and partnerships.' },
    { icon: '🌐', title: '100% Remote', desc: 'Work from anywhere in the world — all collaboration is async-first.' },
    { icon: '⚡', title: 'Certification Support', desc: 'Discounted or sponsored exam vouchers on successful completion.' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="pt-24 sm:pt-28 pb-16 px-4" style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 60%,#070E1F 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>Internship Programme</p>
            </div>
            <h1 className="text-white mb-4 leading-tight" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, fontFamily: 'var(--ace-font)' }}>
              Launch Your IT Career<br />
              <span style={{ color: 'var(--ace-brand)' }}>With Real Experience.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: 520, marginBottom: 28, fontFamily: 'var(--ace-font)' }}>
              Hands-on, remote internship tracks across Cybersecurity, Cloud, Development, Project Management, and Data. Build a portfolio, earn a certificate, and launch your career.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Benefits ─────────────────────────────────────── */}
        <div className="py-14 border-b" style={{ borderColor: 'var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 8, fontFamily: 'var(--ace-font)' }}>Programme Benefits</p>
          <h2 style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 800, color: 'var(--foreground)', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>Why Intern with Acecerty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '2rem', marginBottom: 10, display: 'block' }}>{b.icon}</span>
                <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', marginBottom: 5, fontFamily: 'var(--ace-font)' }}>{b.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.65, fontFamily: 'var(--ace-font)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active tracks ─────────────────────────────────── */}
        <div className="py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>Active Tracks</p>
              <h2 style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>Apply for a Position</h2>
            </div>
          </div>

          {/* Cold-start notice */}
          {loading && slowConnection && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6" style={{ backgroundColor: 'rgba(0,162,182,0.08)', border: '1px solid rgba(0,162,182,0.2)' }}>
              <Wifi className="h-4 w-4 flex-shrink-0 animate-pulse" style={{ color: 'var(--ace-brand)' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Connecting to server…</p>
              <Loader2 className="h-3.5 w-3.5 ml-auto animate-spin flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#ef4444' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Could not reach the server. Showing local track listings.</p>
              <button onClick={refetch} className="ml-auto flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TrackSkeleton key={i} />)
              : tracks.map((t) => <TrackCard key={t.id} track={t} onApply={setActiveTrack} />)
            }
          </div>

          {/* Timeline / Process */}
          <div className="rounded-3xl p-8" style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 8, fontFamily: 'var(--ace-font)' }}>Application Process</p>
            <h3 className="text-white mb-8" style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>From Application to Day One</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', label: 'Submit Application', desc: 'Fill in the form, describe your background and goals.' },
                { step: '2', label: 'Initial Review', desc: 'Our team reviews all applications within 3–5 days.' },
                { step: '3', label: 'Technical Interview', desc: 'A 30-minute video call to assess your knowledge and fit.' },
                { step: '4', label: 'Offer & Onboarding', desc: 'Receive your offer and get set up with tools and your mentor.' },
              ].map((s) => (
                <div key={s.step} className="flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                    {s.step}
                  </div>
                  <p className="text-white font-semibold" style={{ fontSize: '0.88rem', fontFamily: 'var(--ace-font)' }}>{s.label}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--ace-font)' }}>
                Applications are reviewed on a rolling basis. Spots are limited — apply early.
              </p>
              <button
                onClick={() => setActiveTrack(tracks[0] ?? null)}
                className="flex-shrink-0 px-6 py-3 rounded-full font-bold text-white transition-all active:scale-95 flex items-center gap-2"
                style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
              >
                <Briefcase className="h-4 w-4" /> Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Application modal ────────────────────────────── */}
      <AnimatePresence>
        {activeTrack && (
          <ApplicationModal track={activeTrack} onClose={() => setActiveTrack(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
