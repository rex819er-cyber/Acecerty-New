import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiGoogleAuth, socialAuthMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  GOOGLE_CLIENT_ID, LINKEDIN_CLIENT_ID, isPlaceholder,
  loadGoogleIdentityServices, startLinkedInOAuth,
} from '../lib/socialAuth';
import type { GoogleCredentialResponse } from '../lib/socialAuth';

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* Shared button style — both social buttons look identical */
const socialBtnStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--ace-radius-lg)',
  background: 'transparent',
  color: 'var(--foreground)',
  fontFamily: 'var(--ace-font)',
  fontWeight: 500,
  cursor: 'pointer',
};

interface Props {
  /** Where to land after a successful sign-in. */
  returnTo?: string;
}

/**
 * Google Identity Services + LinkedIn OAuth entry points.
 *
 * Google renders its own official button into #google-btn (GIS requires this —
 * the ID token can only be issued from a button Google itself drew). When GIS
 * is not configured or still loading, a styled fallback button is shown that
 * visually matches the LinkedIn button. LinkedIn is a plain redirect.
 */
export function SocialAuthButtons({ returnTo = '/dashboard' }: Props) {
  const navigate = useNavigate();
  const { applySession } = useAuth();

  const googleSlot = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady]   = useState(false);
  const [gsiError, setGsiError]   = useState('');
  const [exchanging, setExchange] = useState(false);

  const googleConfigured   = !isPlaceholder(GOOGLE_CLIENT_ID);
  const linkedInConfigured = !isPlaceholder(LINKEDIN_CLIENT_ID);

  /* Keep the latest handler in a ref: GIS holds onto the callback it was
     initialised with, so it must not close over stale state. */
  const handleCredential = useRef<(res: GoogleCredentialResponse) => void>(() => {});
  handleCredential.current = async (res: GoogleCredentialResponse) => {
    if (!res?.credential) { toast.error('Google did not return a credential.'); return; }
    setExchange(true);
    try {
      const session = await apiGoogleAuth(res.credential);
      applySession(session);
      toast.success('Signed in with Google');
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(socialAuthMessage(err));
    } finally {
      setExchange(false);
    }
  };

  useEffect(() => {
    if (!googleConfigured) return;
    let cancelled = false;

    loadGoogleIdentityServices()
      .then(id => {
        if (cancelled || !googleSlot.current) return;
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: res => handleCredential.current(res),
          cancel_on_tap_outside: true,
        });
        googleSlot.current.innerHTML = '';
        id.renderButton(googleSlot.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.max(240, Math.round(googleSlot.current.offsetWidth || 320)),
        });
        setGsiReady(true);
      })
      .catch(() => { if (!cancelled) setGsiError('Google sign-in is unavailable right now.'); });

    return () => { cancelled = true; };
  }, [googleConfigured]);

  /* Only show the "not configured" toast when the client ID is truly empty */
  const notConfigured = (provider: string) =>
    toast.error(`${provider} sign-in is not configured. Add the client ID to your environment.`);

  return (
    <div className="flex flex-col gap-3">
      {/* Google — GIS renders its official button in here when configured */}
      <div className="relative">
        <div id="google-btn" ref={googleSlot} className="flex justify-center" />

        {/* Fallback button: shown when GIS is not configured or not yet ready */}
        {(!googleConfigured || (!gsiReady && !gsiError)) && (
          <button
            type="button"
            onClick={() => !googleConfigured ? notConfigured('Google') : undefined}
            disabled={googleConfigured && !gsiReady}
            className="w-full flex items-center justify-center gap-2.5 py-3 text-sm transition-colors"
            style={{
              ...socialBtnStyle,
              cursor: googleConfigured ? 'default' : 'pointer',
              opacity: googleConfigured && !gsiReady ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            {googleConfigured ? 'Loading Google sign-in…' : 'Continue with Google'}
          </button>
        )}
      </div>

      {gsiError && (
        <div
          className="text-xs flex items-center gap-2 px-3 py-2"
          style={{
            borderRadius: 'var(--ace-radius-sm)',
            background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
            color: 'var(--destructive)', fontFamily: 'var(--ace-font)',
          }}
        >
          <AlertCircle size={13} className="shrink-0" /> {gsiError}
        </div>
      )}

      {/* LinkedIn — full-page redirect to the authorization endpoint */}
      <button
        type="button"
        onClick={() => linkedInConfigured ? startLinkedInOAuth(returnTo) : notConfigured('LinkedIn')}
        className="w-full flex items-center justify-center gap-2.5 py-3 text-sm transition-colors"
        style={socialBtnStyle}
      >
        <LinkedInIcon /> Continue with LinkedIn
      </button>

      {exchanging && (
        <div
          className="text-xs text-center"
          style={{ color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)' }}
        >
          Verifying your Google account…
        </div>
      )}
    </div>
  );
}
