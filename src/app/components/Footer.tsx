import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Send, CheckCircle } from 'lucide-react';
import { AcecertyLogo } from './AcecertyLogo';
import { useTheme } from '../context/ThemeContext';

const LINKS = {
  Individuals: [
    'Course Catalog',
    'Popular Courses',
    'Cybersecurity Certs',
    'Cloud Certs',
    'Network Certs',
    'Project Management',
    'Current Offers',
    'Financing Options',
  ],
  Organizations: [
    'Corporate Solutions',
    'Team Training',
    'Training Vouchers',
    'Military Solutions',
    'Government Solutions',
    'GSA Schedule',
    'DoD 8570/8140',
    'Request Quote',
  ],
  Resources: [
    'Articles & Guides',
    'Webinars',
    'Cyber Glossary',
    'Study Flashcards',
    'Practice Tests',
    'Make Payment',
  ],
  Company: [
    'About Us',
    'Leadership',
    'Contact & Locations',
    'Careers',
    'Help Center',
    'GI Bill® Approved',
  ],
};

const SOCIALS = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #050505 0%, #050508 100%)',
        fontFamily: 'var(--ace-font)',
      }}
    >
      {/* Newsletter strip */}
      <div
        className="border-b border-white/10"
        style={{ background: 'rgba(0,162,182,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3
                className="text-white mb-1"
                style={{ fontSize: '1.3rem', fontWeight: 700 }}
              >
                Sign up for Email Updates.
              </h3>
              <p className="text-white/50 text-sm">
                New courses, certification guides, and career tips — delivered to your inbox.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckCircle className="h-5 w-5" /> You're subscribed!
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 w-full md:w-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#00A2B6' } as React.CSSProperties}
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#00A2B6' }}
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <AcecertyLogo isDark={true} height={26} />
            </div>
            <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-xs">
              Accelerated IT certification training designed to unlock new skills and
              fast-track your career. Trusted by 250,000+ professionals worldwide.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="h-9 w-9 rounded-lg flex items-center justify-center border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4
                className="text-white mb-4"
                style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      className="text-sm text-white/40 hover:text-white/80 transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-white/30 text-xs">
              ©1999–2026 Acecerty. All Rights Reserved. Acecerty is a registered trademark.
              GI Bill®.
            </p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Service', 'Terms & Conditions'].map((item) => (
                <button
                  key={item}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
