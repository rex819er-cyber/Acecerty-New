import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router';
import { LayoutDashboard, Eye, EyeOff, ShieldAlert, Wifi, ArrowLeft } from 'lucide-react';
import { apiLogin, storeAdminToken } from '../lib/api';
import { isAuthorisedAdmin, hasAdminSession } from '../lib/adminAuth';

/* ── token-driven styling: every value resolves from theme.css ─────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 'var(--ace-radius-sm)',
  background: 'var(--input-background)', border: '1px solid var(--border)',
  color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.875rem',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, color: 'var(--muted-foreground)',
  fontFamily: 'var(--ace-font)', fontSize: '0.78rem', fontWeight: 600,
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  /* Where the guard bounced the admin from, so we can send them back */
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/admin';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [slow, setSlow]         = useState(false);
  const [error, setError]       = useState('');

  /* Already holding a valid session → skip the form */
  if (hasAdminSession()) return <Navigate to={returnTo} replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    /* Step 1 — front-end gate for the authorised admin account */
    if (!isAuthorisedAdmin(email, password)) {
      setError('Unauthorized access: invalid admin email or password.');
      return;
    }

    /* Step 2 — live credential exchange against the backend */
    setLoading(true); setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 2500);
    try {
      const session = await apiLogin(email.trim(), password);
      clearTimeout(slowTimer); setSlow(false);
      if (session.user.role !== 'admin') {
        throw new Error('Access denied — this account does not have admin privileges.');
      }
      storeAdminToken(session.token);
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      clearTimeout(slowTimer); setSlow(false);
      setError((err as { message?: string })?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)', fontFamily: 'var(--ace-font)',
      }}
      className="px-4 sm:px-6 lg:px-8 py-10"
    >
      <div
        className="max-w-md w-full"
        style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--ace-radius-xl)', boxShadow: 'var(--ace-shadow-lg)',
        }}
      >
        <div className="p-7 sm:p-9">
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 'var(--ace-radius-md)', background: 'var(--ace-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <LayoutDashboard size={20} color="var(--primary-foreground)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="text-sm sm:text-base" style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800 }}>
                Acecerty Admin
              </div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                Restricted — authorised personnel only
              </div>
            </div>
          </div>

          {slow && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                padding: '10px 14px', borderRadius: 'var(--ace-radius-sm)',
                background: 'var(--ace-brand-light)', border: '1px solid var(--ace-brand)',
                color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)', fontSize: '0.82rem',
              }}
            >
              <Wifi size={14} className="animate-pulse shrink-0" />
              Connecting to live backend — the server may be waking up…
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="admin-email">Admin Email</label>
              <input
                id="admin-email" style={inputStyle} type="email" required autoFocus
                autoComplete="username" placeholder="admin@acecerty.com"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle} htmlFor="admin-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password" style={{ ...inputStyle, paddingRight: 42 }}
                  type={showPw ? 'text' : 'password'} required
                  autoComplete="current-password" placeholder="••••••••"
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14,
                  padding: '10px 12px', borderRadius: 'var(--ace-radius-sm)',
                  background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
                  color: 'var(--destructive)', fontFamily: 'var(--ace-font)', fontSize: '0.82rem',
                }}
              >
                <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', marginTop: 4, padding: '13px 0', border: 'none',
                borderRadius: 'var(--ace-radius-md)', background: 'var(--ace-brand)',
                color: 'var(--primary-foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              className="text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16, height: 16, borderRadius: 'var(--ace-radius-full)',
                      border: '2px solid var(--primary-foreground)', borderTopColor: 'transparent',
                      display: 'inline-block', animation: 'admin-spin 0.7s linear infinite',
                    }}
                  />
                  Signing in…
                </>
              ) : 'Access Dashboard'}
            </button>
          </form>

          <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>

          <div
            style={{
              marginTop: 20, padding: '12px 14px', borderRadius: 'var(--ace-radius-md)',
              background: 'var(--ace-brand-light)', border: '1px solid var(--border)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.6 }}>
              This portal is restricted to authorised Acecerty administrators. Unauthorised access attempts are logged.
            </p>
          </div>

          <Link
            to="/"
            className="text-xs"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18,
              color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', textDecoration: 'none',
            }}
          >
            <ArrowLeft size={13} /> Back to Acecerty
          </Link>
        </div>
      </div>
    </div>
  );
}
