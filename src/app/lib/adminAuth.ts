/* ─────────────────────────────────────────────────────────────────────────
   Admin portal auth helpers

   The portal signs in as one fixed identity, so the login form only asks for
   a password. `admin_access_token` persistence lives in lib/api.ts.

   NOTE: ADMIN_PASSWORD ships inside the client bundle and is readable by
   anyone with devtools. The real protection is the backend rejecting
   non-admin tokens on /api/admin/* — this gate is a convenience, not
   security.
───────────────────────────────────────────────────────────────────────── */
import { getAdminToken } from './api';

/** The single identity the admin portal authenticates as. */
export const ADMIN_EMAIL = 'Admin@acecerty.com';

/** Accepted offline password (same string as the identifier, by design). */
export const ADMIN_PASSWORD = 'Admin@acecerty.com';

/** Stand-in token used when the backend login is unavailable. */
export const ADMIN_FALLBACK_TOKEN = 'admin_session_active_token';

/** True when the submitted password matches the hardcoded admin password. */
export const isAdminPassword = (password: string) => password === ADMIN_PASSWORD;

export const hasAdminSession = () => Boolean(getAdminToken());
