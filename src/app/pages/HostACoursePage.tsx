import React, { useState } from 'react';
import { GraduationCap, Users, Globe, DollarSign, CheckCircle, ChevronRight, Building2, Star, BarChart2, Shield } from 'lucide-react';

const BENEFITS = [
  {
    icon: Users,
    title: 'Reach Thousands of Learners',
    desc: 'Tap into Acecerty\'s established audience of IT professionals and certification candidates across 40+ countries.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Revenue Share',
    desc: 'Earn up to 70% revenue share on every enrollment. Transparent monthly payouts with no hidden fees.',
  },
  {
    icon: Globe,
    title: 'Full Marketing Support',
    desc: 'We promote your courses through our email list, SEO, paid ads, and partner channels at no cost to you.',
  },
  {
    icon: BarChart2,
    title: 'Real-Time Analytics',
    desc: 'Track enrollments, completion rates, revenue, and student feedback through your instructor dashboard.',
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    desc: 'Our curriculum team reviews every course to ensure it meets Acecerty\'s quality standards before going live.',
  },
  {
    icon: GraduationCap,
    title: 'Instructor Certification Badge',
    desc: 'Stand out with an Acecerty Verified Instructor badge displayed on your profile and course listings.',
  },
];

const STEPS = [
  { num: '01', title: 'Submit Your Application', desc: 'Fill out the form below with your credentials, areas of expertise, and course outline.' },
  { num: '02', title: 'Review & Onboarding', desc: 'Our team reviews your application within 5 business days and schedules an onboarding call.' },
  { num: '03', title: 'Build Your Course', desc: 'Use our authoring tools and content guidelines to create a polished, exam-focused course.' },
  { num: '04', title: 'Go Live & Earn', desc: 'We publish and promote your course. You earn every time a student enrolls.' },
];

const TESTIMONIALS = [
  { name: 'Marcus T.', role: 'CISSP Instructor', quote: 'I went from teaching locally to reaching students in 12 countries within three months of partnering with Acecerty.', rating: 5 },
  { name: 'Sarah K.', role: 'AWS & Azure Trainer', quote: 'The revenue share is better than any platform I\'ve used, and the marketing support is genuinely hands-on.', rating: 5 },
  { name: 'James O.', role: 'CompTIA Expert', quote: 'Acecerty\'s quality bar pushed me to create my best content yet. My students\' pass rates have never been higher.', rating: 5 },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  certifications: string;
  courseTitle: string;
  courseFormat: string;
  experience: string;
  message: string;
}

const EMPTY: FormData = { name: '', email: '', phone: '', company: '', certifications: '', courseTitle: '', courseFormat: '', experience: '', message: '' };

export default function HostACoursePage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitted, setSubmitted] = useState(false);


  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow`;
  const inputStyle = {
    borderColor: 'var(--border)',
    '--tw-ring-color': '#00A2B6',
    backgroundColor: 'var(--card)',
    color: 'var(--foreground)',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }} className="pt-24 sm:pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5" style={{ color: '#00A2B6' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00A2B6' }}>Host a Course</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800 }}>
            Teach on Acecerty.<br />Reach the World.
          </h1>
          <p className="text-white/60 mb-8" style={{ fontSize: '1.05rem', maxWidth: 560 }}>
            Partner with Acecerty to deliver your certification courses to thousands of IT professionals. We handle the marketing, payments, and platform — you focus on teaching.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { value: '50,000+', label: 'Active Students' },
              { value: '40+', label: 'Countries Reached' },
              { value: 'Up to 70%', label: 'Revenue Share' },
              { value: '100+', label: 'Partner Instructors' },
            ].map(({ value, label }) => (
              <div key={label} className="px-5 py-3 rounded-xl bg-white/10 border border-white/15">
                <p className="text-white font-black" style={{ fontSize: '1.2rem' }}>{value}</p>
                <p className="text-white/50 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#00A2B6' }}>Why Partner With Us</p>
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }} className="text-foreground">Everything you need to succeed as an instructor</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-card border border-border"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(0,162,182,0.12)' }}
              >
                <Icon className="h-5 w-5" style={{ color: '#00A2B6' }} />
              </div>
              <h3 className="mb-2 text-foreground" style={{ fontSize: '0.95rem', fontWeight: 700 }}>{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#00A2B6' }}>How It Works</p>
            <h2 className="text-gray-900" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }}>Four steps to your first enrollment</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 text-white font-black"
                  style={{ backgroundColor: '#00A2B6', fontSize: '1rem' }}
                >
                  {step.num}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-14 right-0 h-0.5" style={{ backgroundColor: '#e5e7eb' }} />
                )}
                <h3 className="text-gray-900 mb-2" style={{ fontSize: '0.95rem', fontWeight: 700 }}>{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#00A2B6' }}>Instructor Stories</p>
            <h2 className="text-gray-900" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }}>What our instructors say</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote, rating }) => (
              <div
                key={name}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4" fill="#00A2B6" style={{ color: '#00A2B6' }} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div>
                  <p className="text-gray-900 text-sm font-bold">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden shadow-xl"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="px-8 py-6" style={{ background: 'linear-gradient(135deg,#071224,#0B1D3A)' }}>
              <div className="flex items-center gap-3 mb-1">
                <Building2 className="h-5 w-5" style={{ color: '#00A2B6' }} />
                <h2 className="text-white font-bold" style={{ fontSize: '1.15rem' }}>Instructor Application</h2>
              </div>
              <p className="text-white/50 text-sm">Our team will review your application within 5 business days.</p>
            </div>

            <div className="bg-card px-8 py-8">
              {submitted ? (
                <div className="text-center py-10">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#dcfce7' }}
                  >
                    <CheckCircle className="h-8 w-8" style={{ color: '#16a34a' }} />
                  </div>
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Application Received!</h3>
                  <p className="text-gray-500 text-sm">We'll be in touch within 5 business days to discuss next steps.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
                      <input required className={inputCls} style={inputStyle} placeholder="Jane Smith" value={form.name} onChange={set('name')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email *</label>
                      <input required type="email" className={inputCls} style={inputStyle} placeholder="jane@example.com" value={form.email} onChange={set('email')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
                      <input className={inputCls} style={inputStyle} placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Company / Organization</label>
                      <input className={inputCls} style={inputStyle} placeholder="Acme Corp" value={form.company} onChange={set('company')} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Your Certifications *</label>
                    <input required className={inputCls} style={inputStyle} placeholder="e.g. CISSP, CISM, Security+, AWS SAA" value={form.certifications} onChange={set('certifications')} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Proposed Course Title *</label>
                    <input required className={inputCls} style={inputStyle} placeholder="e.g. CompTIA Security+ Bootcamp" value={form.courseTitle} onChange={set('courseTitle')} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Preferred Format *</label>
                      <select required className={inputCls} style={inputStyle} value={form.courseFormat} onChange={set('courseFormat')}>
                        <option value="">Select format…</option>
                        <option>In-Person Bootcamp</option>
                        <option>Live Online</option>
                        <option>Self-Paced / On-Demand</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Years of Teaching Experience *</label>
                      <select required className={inputCls} style={inputStyle} value={form.experience} onChange={set('experience')}>
                        <option value="">Select range…</option>
                        <option>Less than 1 year</option>
                        <option>1–3 years</option>
                        <option>3–5 years</option>
                        <option>5–10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Additional Information</label>
                    <textarea
                      rows={4}
                      className={inputCls}
                      style={{ ...inputStyle, resize: 'none' }}
                      placeholder="Tell us about your teaching background, student outcomes, or any other relevant details…"
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: '#00A2B6' }}
                  >
                    Submit Application <ChevronRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    By submitting, you agree to our{' '}
                    <span className="underline cursor-pointer">Instructor Terms</span> and{' '}
                    <span className="underline cursor-pointer">Privacy Policy</span>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
