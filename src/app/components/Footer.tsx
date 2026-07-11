import React, { useState } from 'react';
import { Facebook, Instagram, Send, CheckCircle } from 'lucide-react';
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

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.24 8.24 0 0 0 4.83 1.56V6.79a4.85 4.85 0 0 1-1.06-.1z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIALS = [
  { icon: Instagram,  label: 'Instagram', href: 'https://www.instagram.com/acecerty' },
  { icon: TikTokIcon, label: 'TikTok',    href: 'https://www.tiktok.com/@acecerty' },
  { icon: XIcon,      label: 'X',         href: 'https://x.com/Acecerty_' },
  { icon: Facebook,   label: 'Facebook',  href: 'https://www.facebook.com/share/19PuoYipaD/' },
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
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg flex items-center justify-center border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            null
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
