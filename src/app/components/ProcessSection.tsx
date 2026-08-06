import React, { useState } from 'react';
import { BookOpen, Target, Award, ArrowRight } from 'lucide-react';

const TABS = [
  {
    id: 'learn', label: 'Learn', icon: BookOpen,
    heading: 'Learn faster with expert-led bootcamps',
    body: 'Master comprehensive IT certification content through accelerated bootcamps — modify your learning path with expert guidance, and gain hands-on experience to power your career advancement.',
    stat: '500+', statLabel: 'Expert instructors',
  },
  {
    id: 'practice', label: 'Practice', icon: Target,
    heading: 'Practice until you\'re exam-day ready',
    body: 'Practice with thousands of exam questions and real-world scenarios to build confidence and identify knowledge gaps before test day.',
    stat: '10,000+', statLabel: 'Practice questions',
  },
  {
    id: 'certify', label: 'Certify', icon: Award,
    heading: 'Certify on your first attempt — guaranteed',
    body: 'Certify on your first attempt with our exam guarantee — and continually advance your career with ongoing support and resources based on industry best practices.',
    stat: '94%', statLabel: 'First-attempt pass rate',
  },
];

const STEPS = [
  { num: '01', label: 'Register', desc: 'Choose your certification and schedule your bootcamp in minutes.' },
  { num: '02', label: 'Train', desc: 'Learn from world-class instructors in intensive, accelerated sessions.' },
  { num: '03', label: 'Pass', desc: 'Take your exam with confidence backed by our retake guarantee.' },
];

export function ProcessSection() {
  const [active, setActive] = useState('learn');
  const tab = TABS.find((t) => t.id === active)!;
  const Icon = tab.icon;


  return (
    <section
      className="py-20 lg:py-28 bg-background" style={{ fontFamily: 'var(--ace-font)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>
            How It Works
          </p>
          <h2
            className="mb-4 text-foreground"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800 }}
          >
            Go from learning today to leading tomorrow.
          </h2>
          <p className="max-w-xl mx-auto" style={{ fontSize: '1.05rem', color: 'var(--muted-foreground)' }}>
            Our proven three-step process has helped 250,000+ professionals earn their certifications and advance their careers.
          </p>
        </div>

        {/* 3-step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative p-8 rounded-2xl"
              style={{
                backgroundColor: i === 1 ? '#00A2B6' : 'var(--card)',
                border: i === 1 ? 'none' : '1px solid var(--border)',
              }}
            >
              <div
                className="text-5xl font-black mb-4 leading-none"
                style={{ color: i === 1 ? 'rgba(255,255,255,0.25)' : 'var(--border)' }}
              >
                {step.num}
              </div>
              <h3 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 700, color: i === 1 ? '#fff' : 'var(--foreground)' }}>
                {step.label}
              </h3>
              <p className="leading-relaxed" style={{ fontSize: '0.9rem', color: i === 1 ? 'rgba(255,255,255,0.75)' : 'var(--muted-foreground)' }}>
                {step.desc}
              </p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: '#00A2B6' }}>
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tab panel */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-border">
          {/* Tabs */}
          <div className="flex bg-muted border-b border-border">
            {TABS.map((t) => {
              const TIcon = t.icon;
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-5 px-4 text-sm font-semibold transition-all border-b-2"
                  style={{
                    borderBottomColor: isActive ? '#00A2B6' : 'transparent',
                    color: isActive ? '#00A2B6' : 'var(--muted-foreground)',
                    backgroundColor: isActive ? 'var(--card)' : 'transparent',
                  }}
                >
                  <TIcon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-10 lg:p-14 bg-card">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(0,162,182,0.12)' }}
              >
                <Icon className="h-7 w-7" style={{ color: '#00A2B6' }} />
              </div>
              <h3 className="mb-4 leading-snug" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>
                {tab.heading}
              </h3>
              <p className="leading-relaxed mb-8" style={{ fontSize: '1rem', color: 'var(--muted-foreground)' }}>
                {tab.body}
              </p>
              <button
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#00A2B6' }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div
              className="flex items-center justify-center p-10 lg:p-14"
              style={{ background: 'linear-gradient(135deg, #050505 0%, #111118 100%)' }}
            >
              <div className="text-center">
                <div className="font-black text-white mb-2" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 1 }}>
                  {tab.stat}
                </div>
                <p className="text-white/60 font-medium" style={{ fontSize: '1rem' }}>{tab.statLabel}</p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0,162,182,0.15)', border: '1px solid rgba(0,162,182,0.3)' }}>
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#00A2B6' }} />
                  <span className="text-white/80 text-sm font-medium">Acecerty Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
