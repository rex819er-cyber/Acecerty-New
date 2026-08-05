/* ─────────────────────────────────────────────────────────────────────────
   Acecerty — social sign-in plumbing (Google Identity Services + LinkedIn)

   Client IDs come from Vite env vars so they can be swapped per deployment
   without touching code. Replace the placeholders below (or set
   VITE_GOOGLE_CLIENT_ID / VITE_LINKEDIN_CLIENT_ID in your Vercel project)
   with the real credentials from the Google Cloud console and the LinkedIn
   developer portal.
───────────────────────────────────────────────────────────────────────── */

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'YOUR_GOOGLE_CLIENT_ID_HERE';

export const LINKEDIN_CLIENT_ID =
  import.meta.env.VITE_LINKEDIN_CLIENT_ID ?? 'YOUR_LINKEDIN_CLIENT_ID_HERE';

export const isPlaceholder = (id: string) => id.startsWith('YOUR_');

/* ── Google Identity Services ─────────────────────────────────────────── */

export interface GoogleCredentialResponse { credential: string; select_by?: string }

/* Minimal shape of the bits of the GIS global we actually touch. */
interface GsiIdApi {
  initialize(config: {
    client_id: string;
    callback: (res: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  prompt(): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GsiIdApi } };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise: Promise<GsiIdApi> | null = null;

/**
 * Injects https://accounts.google.com/gsi/client once and resolves with
 * `google.accounts.id`. Dynamic injection is used instead of a tag in
 * index.html because this project's entrypoint HTML is generated at runtime.
 */
export function loadGoogleIdentityServices(): Promise<GsiIdApi> {
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<GsiIdApi>((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(window.google.accounts.id); return; }

    const done = () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error('Google Identity Services loaded but unavailable'));
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', () => {
      gsiPromise = null;   /* allow a retry on the next attempt */
      reject(new Error('Failed to load Google Identity Services'));
    }, { once: true });
    document.head.appendChild(script);
  });

  return gsiPromise;
}

/* ── LinkedIn OAuth 2.0 (authorization-code flow) ─────────────────────── */

export const LINKEDIN_STATE_KEY = 'linkedin_oauth_state';
export const LINKEDIN_RETURN_KEY = 'linkedin_oauth_return_to';

export const linkedInRedirectUri = () => `${window.location.origin}/auth/linkedin/callback`;

/** Generates a CSRF state token, with a fallback for older browsers. */
function createState(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Stores a fresh CSRF state in sessionStorage and sends the browser to
 * LinkedIn's authorization endpoint. `returnTo` is remembered so the callback
 * can land the user where they originally were headed.
 */
export function startLinkedInOAuth(returnTo = '/dashboard') {
  const state = createState();
  try {
    sessionStorage.setItem(LINKEDIN_STATE_KEY, state);
    sessionStorage.setItem(LINKEDIN_RETURN_KEY, returnTo);
  } catch {}

  const url =
    'https://www.linkedin.com/oauth/v2/authorization' +
    '?response_type=code' +
    `&client_id=${encodeURIComponent(LINKEDIN_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(linkedInRedirectUri())}` +
    '&scope=openid%20profile%20email' +
    `&state=${encodeURIComponent(state)}`;

  window.location.assign(url);
}

/** Reads and clears the stored state — one-shot, so a replayed code fails. */
export function consumeLinkedInState(): string | null {
  try {
    const state = sessionStorage.getItem(LINKEDIN_STATE_KEY);
    sessionStorage.removeItem(LINKEDIN_STATE_KEY);
    return state;
  } catch { return null; }
}

export function consumeLinkedInReturnTo(): string {
  try {
    const to = sessionStorage.getItem(LINKEDIN_RETURN_KEY);
    sessionStorage.removeItem(LINKEDIN_RETURN_KEY);
    return to || '/dashboard';
  } catch { return '/dashboard'; }
}
