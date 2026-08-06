/* ─────────────────────────────────────────────────────────────────────────
   Acecerty — centralised API client
   Base: https://acecerty-backend.onrender.com/api
   • Dual token: student_access_token / admin_access_token
   • 60 s timeout (Render cold-start safe)
   • upload() for multipart/form-data
   • useApi<T> hook with 2 500 ms slowConnection indicator
───────────────────────────────────────────────────────────────────────── */

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  || 'https://acecerty-backend.onrender.com/api';

/* ── token management ──────────────────────────────────────────────────── */
const STUDENT_KEY = 'student_access_token';
const ADMIN_KEY   = 'admin_access_token';
const REFRESH_KEY = 'student_refresh_token';

/* Reads student_access_token, falling back to the plain `accessToken` key that
   older sessions (and the OAuth callbacks) may have written. */
export const getStudentToken  = (): string | null => {
  try { return localStorage.getItem(STUDENT_KEY) ?? localStorage.getItem('accessToken'); } catch { return null; }
};
export const storeStudentToken = (t: string) => { try { localStorage.setItem(STUDENT_KEY, t); } catch {} };
export const clearStudentToken = () => {
  try { [STUDENT_KEY, REFRESH_KEY, 'accessToken'].forEach(k => localStorage.removeItem(k)); } catch {}
};

export const getRefreshToken   = (): string | null => { try { return localStorage.getItem(REFRESH_KEY); } catch { return null; } };
export const storeRefreshToken = (t: string) => { try { localStorage.setItem(REFRESH_KEY, t); } catch {} };

export const getAdminToken  = (): string | null => { try { return localStorage.getItem(ADMIN_KEY); } catch { return null; } };
export const storeAdminToken = (t: string) => { try { localStorage.setItem(ADMIN_KEY, t); } catch {} };
export const clearAdminToken = () => { try { localStorage.removeItem(ADMIN_KEY); } catch {} };

/* Legacy aliases kept for backward compat */
export const getStoredToken = getStudentToken;
export const storeToken     = storeStudentToken;
export const clearToken     = clearStudentToken;

function tokenFor(endpoint: string): string | null {
  return endpoint.startsWith('/admin')
    ? (getAdminToken() ?? getStudentToken())
    : getStudentToken();
}

/* ── core fetch ────────────────────────────────────────────────────────── */
export type ApiError = { message: string; status?: number; isTimeout?: boolean };

async function request<T>(endpoint: string, options: RequestInit = {}, ms = 60_000): Promise<T> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  const token = tokenFor(endpoint);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, signal: ctrl.signal, mode: 'cors' });
    clearTimeout(timer);
    if (!res.ok) {
      let msg = `API ${res.status}`;
      try { const b = await res.json(); msg = b?.message ?? msg; } catch {}
      throw { message: msg, status: res.status } as ApiError;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError')
      throw { message: 'Request timed out — server may be waking up', isTimeout: true } as ApiError;
    throw err as ApiError;
  }
}

export async function upload<T>(endpoint: string, fd: FormData): Promise<T> {
  const token = tokenFor(endpoint);
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers, body: fd });
  if (!res.ok) throw { message: `Upload ${res.status}`, status: res.status } as ApiError;
  return (await res.json()) as T;
}

/* ── shared types ──────────────────────────────────────────────────────── */
export interface ApiLesson { id: string; title: string; duration?: string; type?: 'video'|'reading'|'quiz'; order?: number }
export interface ApiModule { id: string; title: string; duration?: string; lessons: ApiLesson[]; order?: number }
export interface ApiCourse {
  id: string; title: string; description: string; image?: string; duration?: string;
  videos?: string; questions?: string; category?: string; price?: number; originalPrice?: number;
  format?: string; level?: string; slug?: string; modules?: ApiModule[];
  instructor?: { name: string; title: string; bio: string; rating: number; students: number; reviews: number };
  outcomes?: string[]; requirements?: string[]; rating?: number; reviews?: number; students?: number;
  certificate?: boolean; lastUpdated?: string; highlights?: string[];
}
export interface ApiUser { id: string; fullName: string; name?: string; email: string; role: string; createdAt?: string; avatar?: string }
export interface CourseQueryParams { format?: string; level?: string; category?: string; search?: string; page?: number; limit?: number }

/* Collection endpoints may reply as a bare array or as { <key>: [...], total }.
   unwrap() accepts either so the dashboard renders against both shapes. */
function unwrap<T>(key: string, raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const list = (raw as Record<string, unknown> | null)?.[key] ?? (raw as Record<string, unknown> | null)?.data;
  return Array.isArray(list) ? (list as T[]) : [];
}

/* ── auth ──────────────────────────────────────────────────────────────── */
/* The backend replies { user, accessToken, refreshToken, tokenType }. Older
   builds replied { token, user }. normaliseAuth() accepts either shape so
   every caller can rely on `.token`. */
export interface AuthSession { token: string; refreshToken?: string; user: ApiUser }
type RawAuth = { user: ApiUser; accessToken?: string; refreshToken?: string; token?: string };

function normaliseAuth(raw: RawAuth): AuthSession {
  const token = raw.accessToken ?? raw.token;
  if (!token) throw { message: 'Login succeeded but no access token was returned' } as ApiError;
  return { token, refreshToken: raw.refreshToken, user: raw.user };
}

export const apiLogin = async (email: string, password: string): Promise<AuthSession> =>
  normaliseAuth(await request<RawAuth>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
export const apiRegister = async (fullName: string, email: string, password: string): Promise<AuthSession> =>
  normaliseAuth(await request<RawAuth>('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) }));
export const apiGetMe = () => request<ApiUser>('/me');

/* ── social auth ───────────────────────────────────────────────────────────
   POST /auth/google   { idToken }
   POST /auth/linkedin { code, redirectUri }
   Both reply with the same { user, accessToken, refreshToken } envelope. */
export const apiGoogleAuth = async (idToken: string): Promise<AuthSession> =>
  normaliseAuth(await request<RawAuth>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) }));

export const apiLinkedInAuth = async (code: string, redirectUri: string): Promise<AuthSession> =>
  normaliseAuth(await request<RawAuth>('/auth/linkedin', { method: 'POST', body: JSON.stringify({ code, redirectUri }) }));

/* Persists a social sign-in. Writes both `student_access_token` and the plain
   `accessToken` key so either lookup order resolves the session. */
export function persistSession(session: AuthSession) {
  storeStudentToken(session.token);
  try { localStorage.setItem('accessToken', session.token); } catch {}
  if (session.refreshToken) storeRefreshToken(session.refreshToken);
}

/* The spec calls out distinct copy for the two failure modes the backend
   returns when a social provider isn't wired up or the token is rejected. */
export function socialAuthMessage(err: unknown): string {
  const e = err as ApiError | undefined;
  if (e?.status === 400) return 'Social sign-in not configured server-side.';
  if (e?.status === 401) return 'Invalid/expired token or unverified email.';
  return e?.message ?? 'Social sign-in failed. Please try again.';
}

/* ── courses ───────────────────────────────────────────────────────────── */
export const apiGetCourses = (params?: CourseQueryParams) => {
  const q = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined).map(([k,v]) => [k, String(v)]))) : '';
  return request<ApiCourse[]>(`/courses${q}`);
};
export const apiGetCourse        = (id: string) => request<ApiCourse>(`/courses/${id}`);
export const apiGetCourseModules = (id: string) => request<ApiModule[]>(`/courses/${id}/modules`);

/* ── student ───────────────────────────────────────────────────────────── */
export interface StudentProgress { courseId: string; completedLessons: string[]; percentComplete: number }
export interface Certificate     { id: string; courseTitle: string; issuedAt: string; url?: string }
export interface Entitlement     { courseId: string; grantedAt: string; expiresAt?: string }
export interface StudentDashboard {
  enrolledCourses: number; completedCourses: number; certificates: number;
  recentActivity: { courseId: string; title: string; progress: number }[];
}

/* GET /me/courses — the student's enrolments. The backend may reply as a bare
   array, or wrapped as { courses: [...] } / { data: [...] }, and progress may
   arrive as `progress`, `percentComplete`, or a completed/total lesson pair.
   normaliseEnrolment() flattens all of those into one predictable shape. */
export interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;          /* 0–100 */
  completedLessons: number;
  totalLessons: number;
  status?: string;
  image?: string;
  nextLesson?: string;
  certificateUrl?: string;
  completedAt?: string;
  enrolledAt?: string;
}

type RawEnrolment = Record<string, any>;

function normaliseEnrolment(raw: RawEnrolment): EnrolledCourse {
  /* Enrolment records often nest the course itself under `course` */
  const course = raw.course ?? raw;
  const completed = Number(raw.completedLessons ?? raw.lessonsCompleted ?? 0);
  const total     = Number(raw.totalLessons ?? raw.lessonCount ?? course.totalLessons ?? 0);

  let progress = Number(raw.progress ?? raw.percentComplete ?? raw.progressPercent ?? NaN);
  if (!Number.isFinite(progress)) progress = total > 0 ? (completed / total) * 100 : 0;

  return {
    id:               String(course.id ?? raw.courseId ?? raw.id ?? ''),
    title:            course.title ?? raw.title ?? 'Untitled course',
    progress:         Math.max(0, Math.min(100, Math.round(progress))),
    completedLessons: completed,
    totalLessons:     total,
    status:           raw.status ?? course.status,
    image:            course.image ?? raw.image,
    nextLesson:       raw.nextLesson ?? raw.nextLessonTitle,
    certificateUrl:   raw.certificateUrl ?? raw.certificate?.url,
    completedAt:      raw.completedAt,
    enrolledAt:       raw.enrolledAt ?? raw.createdAt,
  };
}

export const apiGetMyCourses = async (): Promise<EnrolledCourse[]> =>
  unwrap<RawEnrolment>('courses', await request<unknown>('/me/courses')).map(normaliseEnrolment);

export const apiGetStudentDashboard = () => request<StudentDashboard>('/me/dashboard');
export const apiGetCourseProgress   = (courseId: string) => request<StudentProgress>(`/me/courses/${courseId}/progress`);
export const apiGetCertificates     = () => request<Certificate[]>('/me/certificates');
export const apiGetEntitlements     = () => request<Entitlement[]>('/me/entitlements');

/* ── cart ──────────────────────────────────────────────────────────────── */
export interface CartItem { courseId: string; price: number; title?: string }
export interface Cart     { items: CartItem[]; total: number }

export const apiGetCart    = () => request<Cart>('/cart');
export const apiAddToCart  = (courseId: string, price: number) =>
  request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ courseId, price }) });
export const apiUpdateCart = (items: CartItem[]) =>
  request<Cart>('/cart', { method: 'PUT', body: JSON.stringify({ items }) });

/* ── orders & payments ─────────────────────────────────────────────────── */
export interface Order         { id: string; total: number; status: string; createdAt: string; items: CartItem[] }
export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;         /* Paystack checkout_url */
  authorizationUrl?: string;   /* Paystack authorization_url alt key */
  link?: string;               /* Flutterwave payment link */
  reference?: string;
  accessCode?: string;
}

export const apiCreateOrder = () => request<Order>('/orders', { method: 'POST' });
export const apiGetOrder    = (orderId: string) => request<Order>(`/orders/${orderId}`);
export const apiPayOrder    = (orderId: string, method: string) =>
  request<PaymentResult>(`/orders/${orderId}/pay`, { method: 'POST', body: JSON.stringify({ method }) });

/* ── exams ─────────────────────────────────────────────────────────────── */
export interface ExamProduct { id: string; title: string; questions: number; duration: number; price: number; category?: string }
export interface ExamAttempt { id: string; examId: string; questions: { id: string; text: string; options: string[] }[] }

export const apiGetExamProducts  = () => request<ExamProduct[]>('/exam-products');
export const apiStartExamAttempt = (examId: string) => request<ExamAttempt>(`/exams/${examId}/attempts`, { method: 'POST' });

/* ── mentorship ────────────────────────────────────────────────────────── */
export interface ApiMentor { id: string; name: string; title: string; specialties: string[]; bio: string; avatar?: string; rating?: number; sessions?: number }

export const apiGetMentors  = () => request<ApiMentor[]>('/mentors');
export const apiBookSession = (mentorId: string, date: string, message: string) =>
  request<{ success: boolean }>('/mentors/sessions', { method: 'POST', body: JSON.stringify({ mentorId, date, message }) });

/* ── internship ────────────────────────────────────────────────────────── */
export interface ApiInternshipTrack { id: string; title: string; description: string; duration: string; spots: number; requirements: string[] }

export const apiGetInternshipTracks = () => request<ApiInternshipTrack[]>('/internships');
export const apiApplyInternship     = (data: { name: string; email: string; phone: string; trackId: string; statement: string }) =>
  request<{ success: boolean; applicationId?: string }>('/internships/apply', { method: 'POST', body: JSON.stringify(data) });

/* ── admin types ───────────────────────────────────────────────────────── */
export interface AdminCourse      { id: string; title: string; description: string; category?: string; level?: string; format?: string; price?: number; published?: boolean; image?: string; slug?: string; createdAt?: string }
export interface AdminModule      { id: string; courseId: string; title: string; order?: number; duration?: string }
export interface AdminLesson      { id: string; moduleId: string; title: string; type?: string; order?: number; duration?: string; videoUrl?: string }
export interface AdminExamProduct { id: string; title: string; questions: number; duration: number; price: number; published?: boolean }
export interface AdminQuestion    { id: string; examId: string; text: string; options: string[]; correctIndex: number; explanation?: string }
export interface ProductPrice     { id: string; courseId: string; region: string; currency: string; amount: number }
export interface AdminOrder       { id: string; userId: string; total: number; status: string; createdAt: string; items: { courseId: string; price: number }[] }
export interface AdminPayment     { id: string; orderId: string; amount: number; method: string; status: string; createdAt: string; reference?: string }
export interface AdminLead        { id: string; name: string; email: string; phone?: string; source?: string; createdAt: string }
export interface AdminAuditLog    { id: string; userId: string; action: string; resource: string; createdAt: string; meta?: Record<string, unknown> }
export interface AdminUser        { id: string; fullName?: string; name?: string; email: string; role: string; createdAt?: string }
export interface AdminStats {
  totalRevenue: number; totalOrders: number; totalStudents: number; totalCourses: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus:  { status: string; count: number }[];
}

/* ── admin API ─────────────────────────────────────────────────────────── */
export const adminGetStats      = () => request<AdminStats>('/admin/dashboard/stats');
export const adminGetCourses    = () => request<AdminCourse[]>('/admin/courses');
export const adminCreateCourse  = (d: Partial<AdminCourse>) => request<AdminCourse>('/admin/courses', { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateCourse  = (id: string, d: Partial<AdminCourse>) => request<AdminCourse>(`/admin/courses/${id}`, { method: 'PUT',    body: JSON.stringify(d) });
export const adminDeleteCourse  = (id: string) => request<void>(`/admin/courses/${id}`, { method: 'DELETE' });
export const adminPublishCourse = (id: string, published: boolean) => request<AdminCourse>(`/admin/courses/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) });
export const adminUploadImage   = async (file: File) => { const fd = new FormData(); fd.append('file', file); return upload<{ url: string }>('/admin/uploads', fd); };

export const adminGetPrices    = () => request<ProductPrice[]>('/admin/product-prices');
export const adminUpdatePrice  = (id: string, amount: number) => request<ProductPrice>(`/admin/product-prices/${id}`, { method: 'PUT', body: JSON.stringify({ amount }) });
export const adminDeletePrice  = (id: string) => request<void>(`/admin/product-prices/${id}`, { method: 'DELETE' });
export const adminAddPrice     = (d: Omit<ProductPrice, 'id'>) => request<ProductPrice>('/admin/product-prices', { method: 'POST', body: JSON.stringify(d) });

export const adminAddModule    = (courseId: string, d: Partial<AdminModule>) => request<AdminModule>(`/admin/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateModule = (id: string, d: Partial<AdminModule>) => request<AdminModule>(`/admin/modules/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminDeleteModule = (id: string) => request<void>(`/admin/modules/${id}`, { method: 'DELETE' });
export const adminAddLesson    = (moduleId: string, d: Partial<AdminLesson>) => request<AdminLesson>(`/admin/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateLesson = (id: string, d: Partial<AdminLesson>) => request<AdminLesson>(`/admin/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(d) });

export const adminGetExams        = () => request<AdminExamProduct[]>('/admin/exams');
export const adminCreateExam      = (d: Partial<AdminExamProduct>) => request<AdminExamProduct>('/admin/exams', { method: 'POST', body: JSON.stringify(d) });
export const adminPublishExam     = (id: string, published: boolean) => request<AdminExamProduct>(`/admin/exams/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) });
export const adminGetQuestions    = (examId: string) => request<AdminQuestion[]>(`/admin/exams/${examId}/questions`);
export const adminCreateQuestion  = (d: Partial<AdminQuestion>) => request<AdminQuestion>('/admin/questions', { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateQuestion  = (id: string, d: Partial<AdminQuestion>) => request<AdminQuestion>(`/admin/questions/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminImportQuestions = (examId: string, csv: string) => request<{ imported: number }>(`/admin/exams/${examId}/questions/import`, { method: 'POST', body: JSON.stringify({ csv }) });

export const adminGetUsers  = async (page = 1) =>
  unwrap<AdminUser>('users', await request<unknown>(`/admin/users?page=${page}`));
export const adminGetOrdersList = async (page = 1) =>
  unwrap<AdminOrder>('orders', await request<unknown>(`/admin/orders?page=${page}`));

export const adminGetOrders    = (page = 1) => request<{ orders: AdminOrder[]; total: number }>(`/admin/orders?page=${page}`);
export const adminGetPayments  = (page = 1) => request<{ payments: AdminPayment[]; total: number }>(`/admin/payments?page=${page}`);
export const adminGetLeads     = (page = 1) => request<{ leads: AdminLead[]; total: number }>(`/admin/leads?page=${page}`);
export const adminGetAuditLogs = (page = 1) => request<{ logs: AdminAuditLog[]; total: number }>(`/admin/audit-logs?page=${page}`);

/* ── useApi hook ───────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from 'react';

export type UseApiState<T> = { data: T | null; loading: boolean; error: string | null; slowConnection: boolean; refetch: () => void };

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData]               = useState<T | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [slowConnection, setSlow]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setSlow(false);
    const slow = setTimeout(() => setSlow(true), 2500);
    try   { setData(await fetcher()); }
    catch (e: any) { setError(e?.message ?? 'Failed to load'); }
    finally { clearTimeout(slow); setSlow(false); setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, slowConnection, refetch: load };
}
