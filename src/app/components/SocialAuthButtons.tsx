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

const LinkedInIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

interface Props {
  /** Where to land after a successful sign-in. */
  returnTo?: string;
}

/**
 * Google Identity Services + LinkedIn OAuth entry points.
 *
 * Google renders its own official button into #google-btn (GIS requires this —
 * the ID token can only be issued from a button Google itself drew). LinkedIn
 * is a plain redirect, so it's a normal token-styled button.
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
      /* POST /api/auth/google { idToken } */
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

  const notConfigured = (provider: string) =>
    toast.error(`${provider} sign-in is not configured. Add the client ID to your environment.`);

  return (
    <div className="flex flex-col gap-3">
      {/* Google — GIS renders its official button in here */}
      <div className="relative">
        <div id="google-btn" ref={googleSlot} className="flex justify-center [color-scheme:light]" />

        {(!googleConfigured || (!gsiReady && !gsiError)) && (
          <button
            type="button"
            onClick={() => googleConfigured ? undefined : notConfigured('Google')}
            disabled={googleConfigured}
            className="w-full flex items-center justify-center gap-2.5 py-3 text-sm"
            style={{
              border: '1px solid var(--border)', borderRadius: 'var(--ace-radius-lg)',
              background: 'transparent', color: 'var(--muted-foreground)',
              fontFamily: 'var(--ace-font)', fontWeight: 500,
              cursor: googleConfigured ? 'default' : 'pointer',
            }}
          >
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
        style={{
          border: '1px solid var(--border)', borderRadius: 'var(--ace-radius-lg)',
          background: 'transparent', color: 'var(--foreground)',
          fontFamily: 'var(--ace-font)', fontWeight: 500, cursor: 'pointer',
        }}
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
