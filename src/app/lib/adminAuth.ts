/* ─────────────────────────────────────────────────────────────────────────
   Admin portal auth helpers
   • admin_access_token persistence lives in lib/api.ts
───────────────────────────────────────────────────────────────────────── */
import { getAdminToken } from './api';

export const hasAdminSession = () => Boolean(getAdminToken());
