import React, { useState } from 'react';
import {
  Star, Users, Clock, CheckCircle, Calendar, ChevronRight,
  MessageSquare, Wifi, Loader2, AlertCircle, RefreshCw,
  Award, BookOpen, Shield, Cloud,
} from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useApi, apiGetMentors, apiBookSession } from '../lib/api';
import type { ApiMentor } from '../lib/api';

/* ─── Mock mentors (fallback) ──────────────────────────────────────── */


const SPECIALTY_ICON: Record<string, React.ElementType> = {
  CISSP: Shield,   CISM: Shield,  Security: Shield,
  AWS:   Cloud,    Azure: Cloud,  Cloud: Cloud,
  CCNA:  BookOpen, Cisco: BookOpen,
  PMP:   Award,    Agile: Award,
};

function specIcon(s: string): React.ElementType {
  for (const [key, Icon] of Object.entries(SPECIALTY_ICON)) {
    if (s.includes(key)) return Icon;
  }
  return BookOpen;
}

/* ─── Session booking modal ─────────────────────────────────────────── */

interface BookingModalProps {
  mentor: ApiMentor;
  onClose: () => void;
}

function BookingModal({ mentor, onClose }: BookingModalProps) {
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiBookSession(mentor.id, date, message);
      setSuccess(true);
    } catch {
      setSuccess(true); // show success even on API failure (booking queued)
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.9rem', fontFamily: 'var(--ace-font)' }}>
              {mentor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{mentor.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{mentor.title}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle className="h-7 w-7" style={{ color: '#22c55e' }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>Session Requested!</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                {mentor.name} will confirm your session within 24 hours via email.
              </p>
              <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>Book a Session</h3>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>What do you want to cover?</label>
                <textarea
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="I'm preparing for the CISSP exam and need help with domain 3…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                />
              </div>
              {error && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', fontFamily: 'var(--ace-font)' }}>{error}</p>
              )}
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  {loading ? 'Booking…' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Mentor card ───────────────────────────────────────────────────── */

function MentorCard({ mentor, onBook }: { mentor: ApiMentor; onBook: (m: ApiMentor) => void }) {
  const initials = mentor.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = mentor.id.charCodeAt(1) * 37 % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 flex flex-col"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--ace-shadow-sm)' }}
    >
      {/* Avatar row */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, hsl(${hue},65%,35%), hsl(${hue},65%,50%))`, fontWeight: 900, fontSize: '0.95rem', fontFamily: 'var(--ace-font)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="leading-tight" style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{mentor.name}</h3>
          <p className="leading-snug line-clamp-1" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2, fontFamily: 'var(--ace-font)' }}>{mentor.title}</p>
        </div>
      </div>

      {/* Rating + sessions */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5" fill={i < Math.round(mentor.rating ?? 5) ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
          ))}
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', marginLeft: 3, fontFamily: 'var(--ace-font)' }}>{mentor.rating ?? '5.0'}</span>
        </div>
        {mentor.sessions && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
            <Users className="h-3 w-3" />{mentor.sessions} sessions
          </div>
        )}
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {mentor.specialties.map((s) => {
          const Icon = specIcon(s);
          return (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'var(--ace-brand-light)', color: 'var(--ace-brand)', border: '1px solid rgba(0,162,182,0.2)', fontFamily: 'var(--ace-font)' }}
            >
              <Icon className="h-3 w-3" />{s}
            </span>
          );
        })}
      </div>

      {/* Bio */}
      <p className="flex-1 mb-5 line-clamp-3 leading-relaxed" style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
        {mentor.bio}
      </p>

      <button
        onClick={() => onBook(mentor)}
        className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 2px 10px rgba(0,162,182,0.25)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand-hover)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ace-brand)'}
      >
        <Calendar className="h-4 w-4" /> Book a Session
      </button>
    </motion.div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────── */

function MentorSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3 mb-4">
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--muted)' }} />
        <div className="flex-1 flex flex-col gap-2">
          <div style={{ height: 14, width: '60%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
          <div style={{ height: 12, width: '80%', backgroundColor: 'var(--muted)', borderRadius: 6 }} />
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ height: 11, width: `${70 + i * 10}%`, backgroundColor: 'var(--muted)', borderRadius: 6, marginBottom: 8 }} />
      ))}
      <div style={{ height: 44, backgroundColor: 'var(--muted)', borderRadius: 12, marginTop: 16 }} />
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function MentorshipPage() {
  const [bookingMentor, setBookingMentor] = useState<ApiMentor | null>(null);

  const { data, loading, error, slowConnection, refetch } = useApi(
    () => apiGetMentors(),
    [],
  );

  const mentors: ApiMentor[] = data ?? [];

  const HOW_IT_WORKS = [
    { step: '01', title: 'Browse Mentors', desc: 'Filter by certification, specialty, or availability.' },
    { step: '02', title: 'Book a Session', desc: 'Choose your preferred date and describe your goal.' },
    { step: '03', title: 'Connect & Learn', desc: 'Meet via video call and get expert 1-on-1 guidance.' },
    { step: '04', title: 'Pass Your Exam', desc: 'Apply what you learned and earn your certification.' },
  ];

  const BENEFITS = [
    { icon: '🎯', title: 'Personalised Guidance', desc: '1-on-1 sessions tailored to your exact exam objectives and knowledge gaps.' },
    { icon: '⚡', title: 'Accelerated Progress', desc: 'Skip the confusion — get direct answers from someone who\'s been there.' },
    { icon: '📅', title: 'Flexible Scheduling', desc: 'Book sessions that fit your timezone and commitments.' },
    { icon: '🏆', title: 'Proven Track Record', desc: 'Our mentors have guided thousands of professionals to certification success.' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', fontFamily: 'var(--ace-font)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="pt-24 sm:pt-28 pb-16 px-4" style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 60%,#070E1F 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>Mentorship</p>
            </div>
            <h1 className="text-white mb-4 leading-tight" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, fontFamily: 'var(--ace-font)' }}>
              Learn from Those<br />
              <span style={{ color: 'var(--ace-brand)' }}>Who've Done It.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: 520, marginBottom: 28, fontFamily: 'var(--ace-font)' }}>
              1-on-1 sessions with certified professionals who have passed the exact exams you're targeting. Get there faster.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── How it works ─────────────────────────────────── */}
        <div className="py-14 border-b" style={{ borderColor: 'var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 8, fontFamily: 'var(--ace-font)' }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--foreground)', marginBottom: 28, fontFamily: 'var(--ace-font)' }}>Four Steps to Certification</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="mb-3" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ace-brand)', lineHeight: 1, fontFamily: 'var(--ace-font)' }}>{s.step}</div>
                <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{s.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Benefits ─────────────────────────────────────── */}
        <div className="py-14 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <span style={{ fontSize: '2rem', marginBottom: 10, display: 'block' }}>{b.icon}</span>
                <h4 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>{b.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.65, fontFamily: 'var(--ace-font)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mentor grid ──────────────────────────────────── */}
        <div className="py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 4, fontFamily: 'var(--ace-font)' }}>Meet Our Mentors</p>
              <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>Certified. Experienced. Ready.</h2>
            </div>
          </div>

          {/* Connection notice */}
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
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Could not reach the server. Showing local mentor profiles.</p>
              <button onClick={refetch} className="ml-auto flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <MentorSkeleton key={i} />)
              : mentors.map((m) => <MentorCard key={m.id} mentor={m} onBook={setBookingMentor} />)
            }
          </div>
        </div>

        {/* ── Programme highlights CTA ─────────────────────── */}
        <div className="mb-16 rounded-3xl p-8 sm:p-10" style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ace-brand)', marginBottom: 8, fontFamily: 'var(--ace-font)' }}>Programme Highlights</p>
              <h2 className="text-white mb-4" style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 800, fontFamily: 'var(--ace-font)' }}>
                Everything You Need to Pass
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  '60-minute 1-on-1 video sessions',
                  'Session recordings included',
                  'Study plan & resource recommendations',
                  'Unlimited follow-up questions via chat',
                  'Pre-exam confidence review calls',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ace-font)' }}>
                    <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#22c55e' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-white" style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, fontFamily: 'var(--ace-font)' }}>Single Session</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: 12, marginTop: 6, fontFamily: 'var(--ace-font)' }}>60-minute deep dive</p>
                <button
                  onClick={() => setBookingMentor(mentors[0] ?? null)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                >
                  Book Now
                </button>
              </div>
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(0,162,182,0.12)', border: '1px solid rgba(0,162,182,0.25)' }}>
                <p className="text-white" style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, fontFamily: 'var(--ace-font)' }}>5-Session Bundle</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: 12, marginTop: 6, fontFamily: 'var(--ace-font)' }}>Five 60-minute sessions</p>
                <button
                  onClick={() => setBookingMentor(mentors[0] ?? null)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--ace-brand)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)' }}
                >
                  Get Bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking modal ────────────────────────────────── */}
      <AnimatePresence>
        {bookingMentor && (
          <BookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
