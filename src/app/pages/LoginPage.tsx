import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { AcecertyLogo } from '../components/AcecertyLogo';

type Tab = 'signin' | 'signup';

const BENEFITS = [
  'Track your course progress',
  'Access exam prep resources',
  'Manage bootcamp registrations',
  'Download course certificates',
];

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen flex bg-background" style={{ fontFamily: 'var(--ace-font)' }}
    >
      {/* Left panel – brand (always dark) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: 'linear-gradient(160deg, #050D1A 0%, #0A1628 60%, #0d2347 100%)' }}
      >
        {/* Logo — always white on dark panel */}
        <Link to="/">
          <AcecertyLogo isDark={true} height={26} />
        </Link>

        {/* Mid copy */}
        <div>
          <h2
            className="text-white mb-4 leading-tight"
            style={{ fontSize: '2rem', fontWeight: 800 }}
          >
            Your certification journey starts here.
          </h2>
          <p className="text-white/55 mb-10 leading-relaxed">
            Sign in to access your personalized learning dashboard, track progress, and manage your enrollments.
          </p>

          <ul className="flex flex-col gap-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#00A2B6' }} />
                <span className="text-white/75 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom trust */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(249,115,22,0.2)' }}
          >
            <Shield className="h-5 w-5" style={{ color: '#00A2B6' }} />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Trusted by 250k+ students</p>
            <p className="text-white/40 text-xs">Secure login with 256-bit encryption</p>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div
        className="flex-1 flex items-center justify-center p-6 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/">
              <AcecertyLogo height={28} />
            </Link>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: 'rgba(0,162,182,0.12)' }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: '#00A2B6' }} />
              </div>
              <h2 className="mb-2 text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {tab === 'signin' ? 'Welcome back!' : 'Account created!'}
              </h2>
              <p className="text-sm text-muted-foreground">Redirecting you now…</p>
            </div>
          ) : (
            <div
              className="rounded-3xl shadow-xl p-8 bg-card border border-border"
            >
              {/* Tabs */}
              <div
                className="flex rounded-xl p-1 mb-8 bg-muted"
              >
                {(['signin', 'signup'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: tab === t ? 'var(--card)' : 'transparent',
                      color: tab === t ? 'var(--ace-brand)' : 'var(--muted-foreground)',
                      boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {tab === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Jane Smith"
                      className="px-4 py-3.5 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': '#00A2B6' } as React.CSSProperties}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jane@company.com"
                    className="px-4 py-3.5 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Password
                    </label>
                    {tab === 'signin' && (
                      <button type="button" className="text-xs font-medium" style={{ color: '#00A2B6' }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'signup' && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      I agree to the{' '}
                      <span style={{ color: '#00A2B6' }}>Terms of Service</span> and{' '}
                      <span style={{ color: '#00A2B6' }}>Privacy Policy</span>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg disabled:opacity-60"
                  style={{ backgroundColor: '#00A2B6' }}
                >
                  {loading ? (
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      {tab === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Google',
                    icon: (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'LinkedIn',
                    icon: (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                ].map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex items-center justify-center gap-2.5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                  className="font-semibold"
                  style={{ color: '#00A2B6' }}
                >
                  {tab === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
