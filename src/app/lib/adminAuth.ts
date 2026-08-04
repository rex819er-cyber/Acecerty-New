/* ─────────────────────────────────────────────────────────────────────────
   Admin portal auth helpers
   • Front-end credential gate for the authorised admin account
   • admin_access_token persistence lives in lib/api.ts
───────────────────────────────────────────────────────────────────────── */
import { getAdminToken } from './api';

export const ADMIN_EMAIL    = 'admin@acecerty.com';
export const ADMIN_PASSWORD = 'Acecerty.admin.access';

export const isAuthorisedAdmin = (email: string, password: string) =>
  email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

export const hasAdminSession = () => Boolean(getAdminToken());
