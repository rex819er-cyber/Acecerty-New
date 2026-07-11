import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const REVIEWS = [
  { id: 0, name: 'Toby Grace', role: 'Veteran', initials: 'TG', cert: 'CISSP', text: "If it wasn't for Acecerty I would not have gotten my CISSP. I loved their program! Acecerty was exactly what I needed. It was so intimidating at first but they got me across the finish line after a 1-week boot camp with the test at the end." },
  { id: 1, name: 'Sarah Johnson', role: 'IT Manager', initials: 'SJ', cert: 'PMP & CISSP', text: "I love the Acecerty format which handles all of the logistics of the training and allowing the student to focus on the course material and certification test! Acecerty helped me to be successful, THE FIRST TIME, for both my PMP and CISSP." },
  { id: 2, name: 'Michael Chen', role: 'Security Analyst', initials: 'MC', cert: 'CCSP', text: "The instructors at Acecerty are world-class. They break down complex concepts into understandable pieces and ensure everyone is keeping up. I passed my certification on the first attempt thanks to their comprehensive approach." },
  { id: 3, name: 'Emily Rodriguez', role: 'Network Engineer', initials: 'ER', cert: 'CCNA', text: "Acecerty's guarantee gave me the confidence to tackle certifications I thought were out of reach. Their structured learning path and hands-on labs made all the difference in my career advancement." },
];

const STATS = [
  { val: '250k+', label: 'Students Trained' },
  { val: '94%', label: 'First-Attempt Pass Rate' },
  { val: '500+', label: 'Expert Instructors' },
  { val: '27 yrs', label: 'Industry Experience' },
];

const MEDIA = ['CNN', 'MSNBC', 'REUTERS', 'NY TIMES', 'FOX NEWS'];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const prev = () => setActive((a) => (a - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setActive((a) => (a + 1) % REVIEWS.length);
  const review = REVIEWS[active];


  return (
    <section className="py-20 lg:py-28 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>Student Success</p>
          <h2 className="mb-4 text-foreground" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800 }}>
            Learn from Those Who've Excelled
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground" style={{ fontSize: '1.05rem' }}>
            Join thousands of professionals who chose Acecerty for exam-day-ready certification training.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((s) => (
            null
          ))}
        </div>

        {/* Reviews carousel */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {/* Featured review */}
          <div
            className="lg:col-span-3 relative p-8 lg:p-10 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #050505 0%, #111118 100%)', border: '1px solid rgba(0,162,182,0.20)' }}
          >
            <Quote className="h-10 w-10 mb-6" style={{ color: '#00A2B6', opacity: 0.7 }} />
            <p className="text-white/85 leading-relaxed mb-8" style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>
              "{review.text}"
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: '#00A2B6' }}>
                {review.initials}
              </div>
              <div>
                <p className="text-white font-semibold">{review.name}</p>
                <p className="text-white/50 text-sm">{review.role}</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'rgba(0,162,182,0.25)', border: '1px solid rgba(0,162,182,0.4)' }}>
                  {review.cert}
                </span>
              </div>
            </div>
            <div className="absolute top-8 right-8 flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#00A2B6' }}>★</span>)}
            </div>
          </div>

          {/* Review list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Featured Reviews</span>
              <div className="flex gap-2">
                <button onClick={prev} className="h-9 w-9 rounded-full flex items-center justify-center transition-all bg-card border border-border text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="h-9 w-9 rounded-full flex items-center justify-center transition-all bg-card border border-border text-foreground">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            {REVIEWS.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setActive(i)}
                className="text-left p-5 rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: active === i ? 'var(--card)' : 'transparent',
                  border: active === i ? '2px solid #00A2B6' : '2px solid var(--border)',
                  boxShadow: active === i ? '0 4px 20px rgba(0,162,182,0.15)' : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: active === i ? '#00A2B6' : 'var(--muted)' }}>
                    <span style={{ color: active === i ? '#fff' : 'var(--muted-foreground)' }}>{r.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 text-muted-foreground">{r.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Featured In */}
        
      </div>
    </section>
  );
}
