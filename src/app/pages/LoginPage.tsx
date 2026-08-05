import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { AcecertyLogo } from '../components/AcecertyLogo';
import { useAuth } from '../context/AuthContext';
import { SocialAuthButtons } from '../components/SocialAuthButtons';

type Tab = 'signin' | 'signup';

const BENEFITS = [
  'Track your course progress',
  'Access exam prep resources',
  'Manage bootcamp registrations',
  'Download course certificates',
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/dashboard';

  const [tab, setTab]               = useState<Tab>('signin');
  const [showPassword, setShowPw]   = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [slow, setSlow]             = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 2500);
    try {
      if (tab === 'signin') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      clearTimeout(slowTimer); setSlow(false);
      setSuccess(true);
      setTimeout(() => navigate(returnTo, { replace: true }), 1200);
    } catch (err: any) {
      clearTimeout(slowTimer); setSlow(false);
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-background" style={{ fontFamily: 'var(--ace-font)', overflowX: 'clip' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 p-10 xl:p-12"
        style={{ background: 'linear-gradient(160deg,#050D1A 0%,#0A1628 60%,#0d2347 100%)' }}>
        <Link to="/"><AcecertyLogo isDark={true} height={26} /></Link>
        <div>
          <h2 className="text-white mb-4 leading-tight text-2xl xl:text-3xl" style={{ fontWeight: 800 }}>
            Your certification journey starts here.
          </h2>
          <p className="text-white/70 mb-10 leading-relaxed text-sm sm:text-base">
            Sign in to access your personalised learning dashboard, track progress, and manage your enrolments.
          </p>
          <ul className="flex flex-col gap-4">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                <span className="text-white/80 text-sm" style={{ fontFamily: 'var(--ace-font)' }}>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand-light)' }}>
            <Shield className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
          </div>
          <div>
            <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--ace-font)' }}>Industry-recognised certification training</p>
            <p className="text-white/55 text-xs" style={{ fontFamily: 'var(--ace-font)' }}>Secure login with 256-bit encryption</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/"><AcecertyLogo height={28} /></Link>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--ace-brand-light)' }}>
                <CheckCircle className="h-10 w-10" style={{ color: 'var(--ace-brand)' }} />
              </div>
              <h2 className="mb-2 text-foreground text-lg sm:text-xl" style={{ fontWeight: 700, fontFamily: 'var(--ace-font)' }}>
                {tab === 'signin' ? 'Welcome back!' : 'Account created!'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>Redirecting to your dashboard…</p>
            </div>
          ) : (
            <div className="rounded-3xl shadow-xl p-6 sm:p-8 bg-card border border-border">
              {/* Tabs */}
              <div className="flex rounded-xl p-1 mb-8 bg-muted">
                {(['signin','signup'] as Tab[]).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{ backgroundColor: tab === t ? 'var(--card)' : 'transparent', color: tab === t ? 'var(--ace-brand)' : 'var(--muted-foreground)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.15)' : 'none', fontFamily: 'var(--ace-font)' }}>
                    {t === 'signin' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {slow && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ace-brand-light)', border: '1px solid var(--ace-brand)', borderRadius: 'var(--ace-radius-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--ace-brand)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
                  <Wifi size={13} className="animate-pulse" /> Connecting to live backend…
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb, var(--destructive) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)', borderRadius: 'var(--ace-radius-sm)', padding: '10px 14px', marginBottom: 16, color: 'var(--destructive)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {tab === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--ace-font)' }}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith"
                      className="px-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all"
                      style={{ borderColor: 'var(--border)', background: 'var(--input-background)', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }} />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--ace-font)' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@company.com"
                    className="px-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--input-background)', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--ace-font)' }}>Password</label>
                    {tab === 'signin' && (
                      <button type="button" style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--ace-brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ace-font)' }}>Forgot password?</button>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all pr-12"
                      style={{ borderColor: 'var(--border)', background: 'var(--input-background)', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }} />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {tab === 'signup' && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>
                      I agree to the <span style={{ color: 'var(--ace-brand)' }}>Terms of Service</span> and <span style={{ color: 'var(--ace-brand)' }}>Privacy Policy</span>
                    </span>
                  </label>
                )}
                <button type="submit" disabled={loading}
                  className="mt-2 w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg disabled:opacity-60"
                  style={{ backgroundColor: 'var(--ace-brand)', fontWeight: 700, fontFamily: 'var(--ace-font)' }}>
                  {loading
                    ? <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <>{tab === 'signin' ? 'Sign In' : 'Create Account'}<ArrowRight className="h-5 w-5" /></>}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500, fontFamily: 'var(--ace-font)' }}>or continue with</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <SocialAuthButtons returnTo={returnTo} />

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: 24, fontFamily: 'var(--ace-font)' }}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  style={{ fontWeight: 600, color: 'var(--ace-brand)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ace-font)' }}>
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
