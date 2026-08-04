import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AcecertyLogo } from '../components/AcecertyLogo';
import { apiLinkedInAuth, persistSession, socialAuthMessage } from '../lib/api';
import { consumeLinkedInReturnTo, consumeLinkedInState, linkedInRedirectUri } from '../lib/socialAuth';

type Phase = 'exchanging' | 'success' | 'error';

/**
 * /auth/linkedin/callback — LinkedIn sends the browser back here with
 * ?code=…&state=…. We verify the CSRF state against sessionStorage, exchange
 * the code for a session via POST /api/auth/linkedin, then land on /dashboard.
 *
 * Lives outside the Root layout (and so outside AuthProvider) — it writes the
 * tokens directly and navigates, and AuthProvider picks the session up from
 * localStorage when it next mounts.
 */
export default function LinkedInCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('exchanging');
  const [message, setMessage] = useState('Completing your LinkedIn sign-in…');

  /* React 18 StrictMode double-invokes effects; the authorization code is
     single-use, so guard against exchanging it twice. */
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code       = params.get('code');
    const state      = params.get('state');
    const oauthError = params.get('error');
    const oauthDesc  = params.get('error_description');

    const fail = (msg: string) => { setPhase('error'); setMessage(msg); toast.error(msg); };

    /* LinkedIn itself rejected or the user cancelled */
    if (oauthError) { fail(oauthDesc || 'LinkedIn sign-in was cancelled.'); return; }
    if (!code)      { fail('LinkedIn did not return an authorization code.'); return; }

    const expected = consumeLinkedInState();
    if (!expected || !state || state !== expected) {
      fail('Sign-in verification failed (state mismatch). Please try again.');
      return;
    }

    const returnTo = consumeLinkedInReturnTo();

    (async () => {
      try {
        /* POST /api/auth/linkedin { code, redirectUri } */
        const session = await apiLinkedInAuth(code, linkedInRedirectUri());
        persistSession(session);
        setPhase('success');
        setMessage('Signed in — taking you to your dashboard…');
        toast.success('Signed in with LinkedIn');
        setTimeout(() => navigate(returnTo, { replace: true }), 900);
      } catch (err) {
        fail(socialAuthMessage(err));
      }
    })();
  }, [params, navigate]);

  const isError = phase === 'error';
  const accent  = isError ? 'var(--destructive)' : 'var(--ace-brand)';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10"
      style={{ background: 'var(--background)', fontFamily: 'var(--ace-font)' }}
    >
      <div
        className="max-w-md w-full p-8 text-center"
        style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--ace-radius-xl)', boxShadow: 'var(--ace-shadow-lg)',
        }}
      >
        <div className="flex justify-center mb-7">
          <Link to="/"><AcecertyLogo height={26} /></Link>
        </div>

        <div
          style={{
            width: 56, height: 56, borderRadius: 'var(--ace-radius-full)',
            background: isError
              ? 'color-mix(in srgb, var(--destructive) 10%, transparent)'
              : 'var(--ace-brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          {phase === 'exchanging' && <Loader2 className="h-6 w-6 animate-spin" style={{ color: accent }} />}
          {phase === 'success'    && <CheckCircle className="h-7 w-7" style={{ color: accent }} />}
          {isError                && <AlertCircle className="h-7 w-7" style={{ color: accent }} />}
        </div>

        <h1
          className="text-base sm:text-lg"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800, marginBottom: 8 }}
        >
          {isError ? 'Sign-in failed' : phase === 'success' ? 'Welcome back!' : 'Signing you in'}
        </h1>

        <p
          className="text-xs sm:text-sm"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.6 }}
        >
          {message}
        </p>

        {isError && (
          <Link
            to="/login"
            className="text-sm"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 22, padding: '12px 24px', borderRadius: 'var(--ace-radius-md)',
              background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
              fontFamily: 'var(--ace-font)', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Back to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
