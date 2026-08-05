/* ─────────────────────────────────────────────────────────────────────────
   Acecerty — centralised API client
   Base: https://acecerty-backend.onrender.com/api
   • Dual token: student_access_token / admin_access_token
   • 60 s timeout (Render cold-start safe)
   • upload() for multipart/form-data
   • useApi<T> hook with 2 500 ms slowConnection indicator

   Routes mirror the NestJS backend's controllers under `Acecerty-backend/src`.
   Collection endpoints there reply `{ data, meta }`; money is carried in
   integer minor units (kobo). Both are normalised here so pages can work with
   plain arrays and major-unit numbers.
───────────────────────────────────────────────────────────────────────── */

/* Points at the deployed API by default. Set VITE_API_BASE in `.env.local` to
   develop against a local backend (e.g. http://localhost:3002/api). */
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://acecerty-backend.onrender.com/api';

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
      throw { message: Array.isArray(msg) ? msg.join(', ') : msg, status: res.status } as ApiError;
    }
    if (res.status === 204) return undefined as T;
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

/* ── response shape helpers ────────────────────────────────────────────── */
export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number }
export interface Paginated<T>   { data: T[]; meta: PaginationMeta }

/* Collection endpoints may reply as a bare array or as { <key>: [...], total }.
   unwrap() accepts either so the dashboard renders against both shapes. */
function unwrap<T>(key: string, raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const list = (raw as Record<string, unknown> | null)?.[key] ?? (raw as Record<string, unknown> | null)?.data;
  return Array.isArray(list) ? (list as T[]) : [];
}

/** Flattens the backend's `{ data, meta }` envelope (or a bare array) to a list. */
function page<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const d = (raw as Paginated<T> | null)?.data;
  return Array.isArray(d) ? d : [];
}

/** Total row count from a `{ data, meta }` envelope, falling back to length. */
function pageTotal(raw: unknown): number {
  if (Array.isArray(raw)) return raw.length;
  return (raw as Paginated<unknown> | null)?.meta?.total ?? page(raw).length;
}

/** Total page count from a `{ data, meta }` envelope, falling back to 1. */
function pageTotalPages(raw: unknown): number {
  if (Array.isArray(raw)) return 1;
  return (raw as Paginated<unknown> | null)?.meta?.totalPages ?? 1;
}

/** Builds a query string, dropping undefined/empty values. */
function qs(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/* Money is stored server-side as integer minor units (kobo). */
export const minorToMajor = (v: unknown): number => Math.round(Number(v ?? 0)) / 100;
export const majorToMinor = (v: unknown): number => Math.round(Number(v ?? 0) * 100);

/**
 * Formats a major-unit amount in the currency the record actually carries.
 * Prices are per-item and geo-resolved, so a hardcoded symbol would be wrong
 * for anyone the backend priced in USD/GBP/GHS/KES/ZAR. Whole amounts drop the
 * decimals (₦60,000), fractional ones keep them ($49.99).
 */
export function formatPrice(amount: unknown, currency = 'NGN'): string {
  const value = Number(amount ?? 0);
  const fraction = Number.isInteger(value) ? 0 : 2;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(value);
  } catch {
    /* narrowSymbol is unsupported on older engines, and an unknown ISO code
       throws — fall back to the plain code. */
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency, minimumFractionDigits: fraction, maximumFractionDigits: fraction,
      }).format(value);
    } catch {
      return `${currency} ${value.toLocaleString()}`;
    }
  }
}

/** Same, for an amount still in integer minor units. */
export const formatMinor = (minor: unknown, currency = 'NGN'): string =>
  formatPrice(minorToMajor(minor), currency);

/* ── shared types ──────────────────────────────────────────────────────── */
export interface ApiLesson { id: string; title: string; duration?: string; type?: 'video'|'reading'|'quiz'; order?: number }
export interface ApiModule { id: string; title: string; duration?: string; lessons: ApiLesson[]; order?: number }
export interface ApiCourse {
  id: string; title: string; shortTitle?: string; description: string; image?: string; duration?: string;
  videos?: string; questions?: string; category?: string; price?: number; originalPrice?: number;
  /* ISO 4217 code the price above is denominated in — geo-resolved per buyer,
     so never assume NGN. Defaults to the platform base currency. */
  currency: string;
  format?: string; level?: string; slug?: string; modules?: ApiModule[];
  instructor?: { name: string; title: string; bio: string; rating: number; students: number; reviews: number };
  outcomes?: string[]; requirements?: string[]; rating?: number; reviews?: number; students?: number;
  certificate?: boolean; lastUpdated?: string; highlights?: string[]; isFeatured?: boolean;
}
export interface ApiUser { id: string; fullName: string; name?: string; email: string; role: string; createdAt?: string; avatar?: string }
export interface CourseQueryParams { format?: string; level?: string; category?: string; search?: string; page?: number; limit?: number }

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

export const apiRefreshSession = async (refreshToken: string): Promise<AuthSession> =>
  normaliseAuth(await request<RawAuth>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }));
export const apiLogout = (refreshToken: string) =>
  request<{ success: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
export const apiForgotPassword = (email: string) =>
  request<{ success: boolean }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const apiResetPassword = (token: string, password: string) =>
  request<{ success: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
export const apiVerifyEmail = (token: string) =>
  request<{ success: boolean }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });

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
/* The Course entity uses `imageUrl` / `priceMinor` / `durationLabel` / `type`
   where the UI expects `image` / `price` / `duration` / `format`. */
function normaliseCourse(raw: Record<string, any>): ApiCourse {
  return {
    id:            String(raw.id ?? ''),
    slug:          raw.slug,
    title:         raw.title ?? raw.shortTitle ?? 'Untitled course',
    /* `shortTitle` is the cert code the marketing cards label themselves with
       (CISSP, Security+, AWS SAA …). */
    shortTitle:    raw.shortTitle ?? undefined,
    description:   raw.description ?? raw.tagline ?? '',
    image:         raw.image ?? raw.imageUrl ?? undefined,
    duration:      raw.duration ?? raw.durationLabel ?? undefined,
    videos:        raw.videosCount != null ? String(raw.videosCount) : raw.videos,
    questions:     raw.questionsCount != null ? String(raw.questionsCount) : raw.questions,
    category:      raw.category,
    price:         raw.priceMinor != null ? minorToMajor(raw.priceMinor) : raw.price,
    originalPrice: raw.originalPriceMinor != null ? minorToMajor(raw.originalPriceMinor) : raw.originalPrice,
    currency:      raw.currency ?? 'NGN',
    format:        raw.format ?? raw.type,
    level:         raw.level,
    modules:       raw.modules,
    instructor:    raw.instructor
      ? {
          name:     raw.instructor.name ?? '',
          title:    raw.instructor.credentials ?? raw.instructor.title ?? '',
          bio:      raw.instructor.bio ?? '',
          rating:   Number(raw.instructor.rating ?? 0),
          students: Number(raw.instructor.students ?? 0),
          reviews:  Number(raw.instructor.reviews ?? 0),
        }
      : undefined,
    outcomes:     raw.outcomes ?? [],
    requirements: raw.requirements ?? [],
    rating:       Number(raw.ratingAvg ?? raw.rating ?? 0),
    reviews:      Number(raw.ratingCount ?? raw.reviews ?? 0),
    students:     Number(raw.studentsCount ?? raw.students ?? 0),
    certificate:  raw.hasCertificate ?? raw.certificate,
    lastUpdated:  raw.updatedAt ?? raw.lastUpdated,
    highlights:   Array.isArray(raw.highlights)
      ? raw.highlights.map((h: any) => (typeof h === 'string' ? h : `${h?.label ?? ''} ${h?.value ?? ''}`.trim()))
      : [],
    isFeatured:   raw.isFeatured ?? false,
  };
}

/* `format` maps onto the backend's CourseType (`bootcamp` | `online`). */
function toCourseType(format?: string): string | undefined {
  if (!format) return undefined;
  const f = format.toLowerCase();
  if (f.includes('bootcamp') || f.includes('person')) return 'bootcamp';
  if (f.includes('self') || f.includes('online') || f.includes('paced')) return 'online';
  return format;
}

export const apiGetCourses = async (params?: CourseQueryParams): Promise<ApiCourse[]> => {
  const raw = await request<unknown>(`/courses${qs({
    type: toCourseType(params?.format),
    level: params?.level,
    category: params?.category,
    search: params?.search,
    page: params?.page,
    limit: params?.limit,
  })}`);
  return page<Record<string, any>>(raw).map(normaliseCourse);
};

/* Public detail lookup resolves by slug; the API also accepts a bare id. */
export const apiGetCourse = async (slugOrId: string): Promise<ApiCourse> =>
  normaliseCourse(await request<Record<string, any>>(`/courses/${encodeURIComponent(slugOrId)}`));

/* Modules ship inside the course payload — no separate endpoint exists. */
export const apiGetCourseModules = async (slugOrId: string): Promise<ApiModule[]> =>
  (await apiGetCourse(slugOrId)).modules ?? [];

/* ── instructors ───────────────────────────────────────────────────────── */
export interface ApiInstructor {
  id: string; name: string; credentials?: string; bio?: string;
  avatarUrl?: string; certs?: string[]; experienceLabel?: string;
}

export const apiGetInstructors = async (params?: { search?: string; page?: number; limit?: number }) =>
  page<ApiInstructor>(await request<unknown>(`/instructors${qs(params as Record<string, unknown>)}`));
export const apiGetInstructor = (id: string) => request<ApiInstructor>(`/instructors/${id}`);

/* ── exam products (practice exams) ────────────────────────────────────── */
export interface ExamProduct {
  id: string; slug: string; certName: string; certCode: string; domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string | null;
  questionsCount: number; examsCount: number; perExamDurationMinutes: number;
  passMark: number; priceMinor: number; originalPriceMinor: number | null;
  currency: string; accessDurationDays: number; hasFreeDemo: boolean;
  ratingAvg: number; ratingCount: number; updatedLabel?: string | null;
  isPublished?: boolean;
}
export interface ExamForm { id: string; title: string; orderIndex: number; durationMinutes: number; passMark: number; isFreeDemo: boolean; isPublished: boolean }
export interface ExamTopic { id: string; name: string; position: number }
export interface ExamProductDetail extends ExamProduct {
  exams: ExamForm[]; topics: ExamTopic[]; freeDemoExamId: string | null;
}

export interface ExamProductQuery { domain?: string; difficulty?: string; search?: string; page?: number; limit?: number }

export const apiGetExamProducts = async (params?: ExamProductQuery) =>
  page<ExamProduct>(await request<unknown>(`/exam-products${qs(params as Record<string, unknown>)}`));

/* Accepts a slug OR a cert code (e.g. `SY0-701`) — the backend falls back to a
   case-insensitive cert-code lookup so cards can link straight from a code. */
export const apiGetExamProduct = (slugOrCode: string) =>
  request<ExamProductDetail>(`/exam-products/${encodeURIComponent(slugOrCode)}`);

/* ── exam vouchers ─────────────────────────────────────────────────────── */
export interface ExamVoucher {
  id: string; slug: string; vendor: string; examName: string; examCode: string;
  priceMinor: number; originalPriceMinor: number | null; currency: string;
  badge?: string | null; popular: boolean; color?: string | null; isPublished?: boolean;
}

export const apiGetExamVouchers = async (params?: { vendor?: string; search?: string; page?: number; limit?: number }) =>
  page<ExamVoucher>(await request<unknown>(`/exam-vouchers${qs(params as Record<string, unknown>)}`));
export const apiGetExamVoucher = (slug: string) =>
  request<ExamVoucher>(`/exam-vouchers/${encodeURIComponent(slug)}`);

/* ── exam engine (server-authoritative attempts) ───────────────────────── */
export type AttemptStatus = 'in_progress' | 'submitted' | 'expired' | 'abandoned';

export interface AttemptOption   { id: string; text: string }
export interface AttemptQuestion {
  questionId: string; orderIndex: number; topic: string | null; text: string;
  type?: string; selectedOptionId: string | null; flagged: boolean; options: AttemptOption[];
}
export interface AttemptHeader {
  id: string; examId: string; examProductId: string; status: AttemptStatus;
  startedAt: string; expiresAt: string; serverTime: string;
  totalQuestions: number; durationMinutes: number | null; passMark: number;
}
export interface AttemptInProgress { attempt: AttemptHeader; questions: AttemptQuestion[] }

export interface AttemptResults {
  attemptId: string; examId: string; examProductId: string; status: AttemptStatus;
  totalQuestions: number; correctCount: number; incorrectCount: number;
  percentage: number; passMark: number; passed: boolean;
  timeSpentSeconds: number; submittedAt: string;
  domainBreakdown: { topic: string; correct: number; total: number; percentage: number }[];
}

export interface AttemptReviewItem {
  questionId: string; orderIndex: number; topic: string | null; text: string;
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean }[];
  selectedOptionId: string | null; correctOptionId: string | null;
  isCorrect: boolean; flagged: boolean;
}

export interface AttemptSummary {
  id: string; examId: string; examProductId: string; status: AttemptStatus;
  totalQuestions: number; correctCount: number; percentage: number; passed: boolean;
  startedAt: string; submittedAt: string | null;
}

/** An in-progress attempt payload never carries `isCorrect`; a terminal one does. */
export const isAttemptInProgress = (r: AttemptInProgress | AttemptResults): r is AttemptInProgress =>
  (r as AttemptInProgress).questions !== undefined;

export const apiStartAttempt = (examId: string) =>
  request<AttemptInProgress>(`/exams/${examId}/attempts`, { method: 'POST' });
export const apiGetAttempt = (attemptId: string) =>
  request<AttemptInProgress | AttemptResults>(`/attempts/${attemptId}`);
export const apiAnswerItem = (attemptId: string, questionId: string, body: { selectedOptionId?: string | null; flagged?: boolean }) =>
  request<{ questionId: string; selectedOptionId: string | null; flagged: boolean }>(
    `/attempts/${attemptId}/items/${questionId}`, { method: 'PATCH', body: JSON.stringify(body) });
export const apiSubmitAttempt = (attemptId: string) =>
  request<AttemptResults>(`/attempts/${attemptId}/submit`, { method: 'POST' });
export const apiGetAttemptResults = (attemptId: string) =>
  request<AttemptResults>(`/attempts/${attemptId}/results`);
export const apiGetAttemptReview = (attemptId: string) =>
  request<AttemptReviewItem[]>(`/attempts/${attemptId}/review`);
export const apiGetMyAttempts = async (page_ = 1) =>
  page<AttemptSummary>(await request<unknown>(`/me/attempts${qs({ page: page_ })}`));

/* Legacy alias — ExamProduct list used to be exposed under this name. */
export const apiStartExamAttempt = apiStartAttempt;

/* ── leads (contact / newsletter / instructor applications) ────────────── */
export interface InstructorApplication {
  name: string; email: string; phone?: string; company?: string;
  certifications?: string; courseTitle?: string; courseFormat?: string;
  experience?: string; message?: string;
}

export const apiSubmitInstructorApplication = (data: InstructorApplication) =>
  request<{ success: boolean; id?: string }>('/leads/instructor-application', { method: 'POST', body: JSON.stringify(data) });

export const apiSubscribeNewsletter = (email: string, extra?: { name?: string; source?: string }) =>
  request<{ success: boolean; id?: string }>('/leads/newsletter', { method: 'POST', body: JSON.stringify({ email, ...extra }) });

export const apiSubmitContact = (data: { name: string; email: string; phone?: string; message: string }) =>
  request<{ success: boolean; id?: string }>('/leads/contact', { method: 'POST', body: JSON.stringify(data) });

/* ── student / learning ────────────────────────────────────────────────── */
export interface StudentProgress { courseId: string; completedLessons: string[]; percentComplete: number }
export interface Certificate     { id: string; courseTitle: string; issuedAt: string; url?: string }
export interface Entitlement     { id?: string; itemType?: string; itemId?: string; courseId: string; grantedAt: string; expiresAt?: string; status?: string }
export interface StudentDashboard {
  enrolledCourses: number; completedCourses: number; certificates: number;
  recentActivity: { courseId: string; title: string; progress: number }[];
}

/* GET /me/entitlements — the student's access grants. The backend has no
   `/me/courses`; enrolments are derived from active entitlements, which may
   arrive bare or wrapped as { data: [...] }, with the course nested under
   `course`. normaliseEnrolment() flattens all of those into one shape. */
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
    id:               String(course.id ?? raw.courseId ?? raw.itemId ?? raw.id ?? ''),
    title:            course.title ?? raw.title ?? raw.titleSnapshot ?? 'Untitled course',
    progress:         Math.max(0, Math.min(100, Math.round(progress))),
    completedLessons: completed,
    totalLessons:     total,
    status:           raw.status ?? course.status,
    image:            course.image ?? course.imageUrl ?? raw.image,
    nextLesson:       raw.nextLesson ?? raw.nextLessonTitle,
    certificateUrl:   raw.certificateUrl ?? raw.certificate?.url,
    completedAt:      raw.completedAt,
    enrolledAt:       raw.enrolledAt ?? raw.grantedAt ?? raw.createdAt,
  };
}

/* GET /me/dashboard already joins each active course entitlement to its course
   record and its lesson progress (`activeCourses`), so it is the cheapest
   source of truth. Raw entitlements are the fallback when it comes back empty
   or unavailable. */
export const apiGetMyCourses = async (): Promise<EnrolledCourse[]> => {
  const dash = await request<Record<string, any>>('/me/dashboard').catch(() => null);
  const fromDash = dash
    ? unwrap<RawEnrolment>('activeCourses', dash.activeCourses ?? dash.courses ?? dash.enrolments)
    : [];
  if (fromDash.length > 0) return fromDash.map(normaliseEnrolment);
  const raw = await request<unknown>('/me/entitlements');
  return page<RawEnrolment>(raw).map(normaliseEnrolment);
};

export const apiGetStudentDashboard = () => request<StudentDashboard>('/me/dashboard');
export const apiGetCourseProgress   = (courseId: string) => request<StudentProgress>(`/me/courses/${courseId}/progress`);
export const apiGetCertificates     = async () => page<Certificate>(await request<unknown>('/me/certificates'));
export const apiGetEntitlements     = async () => page<Entitlement>(await request<unknown>('/me/entitlements'));

export const apiUpdateLessonProgress = (
  lessonId: string,
  body: { status?: 'not_started' | 'in_progress' | 'completed'; watchedSeconds?: number },
) => request<unknown>(`/me/lessons/${lessonId}/progress`, { method: 'PATCH', body: JSON.stringify(body) });

/* ── cart ──────────────────────────────────────────────────────────────── */
/* The backend cart is keyed on (itemType, itemId) — courses, exam products and
   exam vouchers all share it. Quantity is always 1 for digital goods. */
export type ItemType = 'course' | 'exam_product' | 'exam_voucher';

export interface CartLine {
  id: string; itemType: ItemType; itemId: string; quantity: number;
  title: string; unitPriceMinor: number; currency: string; lineTotalMinor: number;
}
export interface Cart {
  cartId: string; currency: string | null; items: CartLine[]; subtotalMinor: number | null;
}

export const apiGetCart      = () => request<Cart>('/cart');
export const apiAddToCart    = (itemType: ItemType, itemId: string) =>
  request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ itemType, itemId }) });
export const apiSetCart      = (items: { itemType: ItemType; itemId: string }[]) =>
  request<Cart>('/cart', { method: 'PUT', body: JSON.stringify({ items }) });
export const apiRemoveCartItem = (cartItemId: string) =>
  request<Cart>(`/cart/items/${cartItemId}`, { method: 'DELETE' });
export const apiClearCart    = () => request<Cart>('/cart', { method: 'DELETE' });

/* Legacy alias */
export const apiUpdateCart = apiSetCart;

/* ── orders & payments ─────────────────────────────────────────────────── */
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type PaymentProviderName = 'paystack' | 'flutterwave';

export interface OrderItem {
  id: string; itemType: ItemType; itemId: string; titleSnapshot: string;
  unitPriceMinor: number; currency: string; quantity: number; lineTotalMinor: number;
}
export interface Order {
  id: string; userId: string; status: OrderStatus; currency: string;
  subtotalMinor: number; discountMinor: number; totalMinor: number;
  items: OrderItem[]; createdAt: string;
}
export interface PaymentInit {
  orderId: string; provider: PaymentProviderName; reference: string; checkoutUrl: string;
}

/** Omit `items` to build the order from the signed-in user's server-side cart. */
export const apiCreateOrder = (items?: { itemType: ItemType; itemId: string }[]) =>
  request<Order>('/orders', { method: 'POST', body: JSON.stringify(items?.length ? { items } : {}) });
export const apiGetOrder = (orderId: string) => request<Order>(`/orders/${orderId}`);
export const apiPayOrder = (orderId: string, provider: PaymentProviderName) =>
  request<PaymentInit>(`/orders/${orderId}/pay`, { method: 'POST', body: JSON.stringify({ provider }) });
export const apiGetMyOrders = async (page_ = 1) =>
  page<Order>(await request<unknown>(`/me/orders${qs({ page: page_ })}`));

/* ── mentorship (no backend module yet — kept for the UI's fallback path) ─ */
export interface ApiMentor { id: string; name: string; title: string; specialties: string[]; bio: string; avatar?: string; rating?: number; sessions?: number }

export const apiGetMentors  = () => request<ApiMentor[]>('/mentors');
export const apiBookSession = (mentorId: string, date: string, message: string) =>
  request<{ success: boolean }>('/mentors/sessions', { method: 'POST', body: JSON.stringify({ mentorId, date, message }) });

/* ── internship (no backend module yet — applications fall back to leads) ─ */
export interface ApiInternshipTrack { id: string; title: string; description: string; duration: string; spots: number; requirements: string[] }

export const apiGetInternshipTracks = () => request<ApiInternshipTrack[]>('/internships');
export const apiApplyInternship     = (data: { name: string; email: string; phone: string; trackId: string; statement: string }) =>
  request<{ success: boolean; applicationId?: string }>('/internships/apply', { method: 'POST', body: JSON.stringify(data) });

/* ── admin types ───────────────────────────────────────────────────────── */
export interface AdminCourse      { id: string; title: string; description: string; category?: string; level?: string; format?: string; price?: number; currency?: string; published?: boolean; image?: string; slug?: string; createdAt?: string }
export interface AdminModule      { id: string; courseId: string; title: string; order?: number; duration?: string }
export interface AdminLesson      { id: string; moduleId: string; title: string; type?: string; order?: number; duration?: string; videoUrl?: string }
export interface AdminExamProduct { id: string; title: string; questions: number; duration: number; price: number; currency?: string; published?: boolean; certCode?: string; domain?: string; slug?: string }
export interface AdminQuestion    { id: string; examId: string; text: string; options: string[]; correctIndex: number; explanation?: string }
export interface ProductPrice     { id: string; itemType: ItemType; itemId: string; currency: string; amount: number; originalAmount?: number }
export interface AdminOrder       { id: string; userId: string; total: number; currency: string; status: string; createdAt: string; items: { courseId: string; price: number }[] }
export interface AdminPayment     { id: string; orderId: string; amount: number; currency: string; method: string; status: string; createdAt: string; reference?: string }
export interface AdminLead        { id: string; name: string; email: string; phone?: string; source?: string; type?: string; status?: string; createdAt: string }
export interface AdminAuditLog    { id: string; userId: string; action: string; resource: string; createdAt: string; meta?: Record<string, unknown> }
export interface AdminUser        { id: string; fullName?: string; name?: string; email: string; role: string; status?: string; createdAt?: string }
export interface AdminAttempt     { id: string; userId: string; examId: string; status: string; percentage: number; passed: boolean; submittedAt?: string }
/* Matches GET /admin/dashboard/stats exactly. Revenue is grouped by currency
   server-side — minor units of different currencies are never summed — so the
   dashboard must render `byCurrency` as separate figures, not one flattened
   total. */
export interface AdminStats {
  users: { total: number; students: number };
  revenue: { byCurrency: Record<string, number>; totalMinor: number; currency: string };
  orders: { total: number; byStatus: Record<string, number> };
  attempts: { total: number; graded: number; passed: number; passRate: number };
  topProducts: { itemId: string; itemType: string; title: string; sales: number; revenueMinor: number }[];
  revenueOverTime: { month: string; revenueMinor: number }[];
}

/* ── admin API ─────────────────────────────────────────────────────────── */
export const adminGetStats = () => request<AdminStats>('/admin/dashboard/stats');

/* Courses ─ the admin list is paginated and uses entity field names. */
function toAdminCourse(raw: Record<string, any>): AdminCourse {
  return {
    id: String(raw.id ?? ''),
    title: raw.title ?? '',
    description: raw.description ?? '',
    category: raw.category,
    level: raw.level,
    format: raw.type ?? raw.format,
    price: raw.priceMinor != null ? minorToMajor(raw.priceMinor) : raw.price,
    currency: raw.currency ?? 'NGN',
    published: raw.isPublished ?? raw.published,
    image: raw.imageUrl ?? raw.image,
    slug: raw.slug,
    createdAt: raw.createdAt,
  };
}

/* Maps the dashboard's flat form back onto CreateCourseDto. */
function fromAdminCourse(d: Partial<AdminCourse>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (d.title !== undefined)       { body.title = d.title; body.shortTitle = d.title.slice(0, 120); }
  if (d.slug !== undefined)         body.slug = d.slug;
  else if (d.title !== undefined)   body.slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (d.description !== undefined)  body.description = d.description;
  if (d.category !== undefined)     body.category = d.category;
  if (d.level !== undefined)        body.level = d.level;
  if (d.format !== undefined)       body.type = toCourseType(d.format);
  if (d.price !== undefined)        body.priceMinor = majorToMinor(d.price);
  if (d.published !== undefined)    body.isPublished = d.published;
  if (d.image !== undefined)        body.imageUrl = d.image;
  return body;
}

export const adminGetCourses = async () =>
  page<Record<string, any>>(await request<unknown>('/admin/courses?limit=100')).map(toAdminCourse);
export const adminCreateCourse = async (d: Partial<AdminCourse>) =>
  toAdminCourse(await request<Record<string, any>>('/admin/courses', { method: 'POST', body: JSON.stringify(fromAdminCourse(d)) }));
export const adminUpdateCourse = async (id: string, d: Partial<AdminCourse>) =>
  toAdminCourse(await request<Record<string, any>>(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(fromAdminCourse(d)) }));
export const adminDeleteCourse  = (id: string) => request<void>(`/admin/courses/${id}`, { method: 'DELETE' });
export const adminPublishCourse = async (id: string, published: boolean) =>
  toAdminCourse(await request<Record<string, any>>(`/admin/courses/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished: published }) }));
export const adminUploadImage   = async (file: File) => { const fd = new FormData(); fd.append('file', file); return upload<{ url: string }>('/admin/uploads', fd); };

/* Regional prices ─ GET requires the item it belongs to; PUT is an upsert
   keyed on (itemType, itemId, currency) rather than an id. */
function toProductPrice(raw: Record<string, any>): ProductPrice {
  return {
    id: String(raw.id ?? ''),
    itemType: raw.itemType,
    itemId: raw.itemId,
    currency: raw.currency,
    amount: minorToMajor(raw.priceMinor),
    originalAmount: raw.originalPriceMinor != null ? minorToMajor(raw.originalPriceMinor) : undefined,
  };
}

export const adminGetPrices = async (itemType: ItemType, itemId: string) =>
  page<Record<string, any>>(await request<unknown>(`/admin/product-prices${qs({ itemType, itemId })}`)).map(toProductPrice);

export const adminUpsertPrice = async (d: { itemType: ItemType; itemId: string; currency: string; amount: number; originalAmount?: number }) =>
  toProductPrice(await request<Record<string, any>>('/admin/product-prices', {
    method: 'PUT',
    body: JSON.stringify({
      itemType: d.itemType, itemId: d.itemId, currency: d.currency,
      priceMinor: majorToMinor(d.amount),
      ...(d.originalAmount !== undefined ? { originalPriceMinor: majorToMinor(d.originalAmount) } : {}),
    }),
  }));

export const adminDeletePrice = (id: string) => request<void>(`/admin/product-prices/${id}`, { method: 'DELETE' });

/* Kept for callers that pass a whole row / a bare new amount. */
export const adminAddPrice    = (d: Omit<ProductPrice, 'id'>) => adminUpsertPrice(d);
export const adminUpdatePrice = (p: ProductPrice, amount: number) => adminUpsertPrice({ ...p, amount });

/* Modules & lessons ─ the backend runs `forbidNonWhitelisted`, so anything not
   on CreateModuleDto/CreateLessonDto is a 400 rather than an ignored field.
   The dashboard's `order`/`duration` map onto `position`/`durationLabel`.

   NOTE: CreateLessonDto accepts only { title, position }. The CourseLesson
   entity has contentType/videoUrl/durationSeconds/isPreview/body, but no DTO
   exposes them, so a lesson's video cannot be set through the API yet — those
   fields are dropped here rather than sent and rejected. */
function toModuleDto(d: Partial<AdminModule>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (d.title !== undefined)    body.title = d.title;
  if (d.duration !== undefined) body.durationLabel = d.duration;
  if (d.order !== undefined)    body.position = d.order;
  return body;
}

function toLessonDto(d: Partial<AdminLesson>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (d.title !== undefined) body.title = d.title;
  if (d.order !== undefined) body.position = d.order;
  return body;
}

function fromModule(raw: Record<string, any>): AdminModule {
  return {
    id: String(raw.id ?? ''),
    courseId: raw.courseId ?? '',
    title: raw.title ?? '',
    order: raw.position ?? raw.order,
    duration: raw.durationLabel ?? raw.duration,
  };
}

function fromLesson(raw: Record<string, any>): AdminLesson {
  return {
    id: String(raw.id ?? ''),
    moduleId: raw.moduleId ?? '',
    title: raw.title ?? '',
    type: raw.contentType ?? raw.type,
    order: raw.position ?? raw.order,
    duration: raw.durationSeconds != null ? `${raw.durationSeconds}s` : raw.duration,
    videoUrl: raw.videoUrl ?? undefined,
  };
}

/* GET /admin/courses/:id returns the course with its modules and their lessons
   nested — the only way to read an existing outline back. */
export interface AdminModuleWithLessons extends AdminModule { lessons: AdminLesson[] }

export const adminGetCourseOutline = async (courseId: string): Promise<AdminModuleWithLessons[]> => {
  const raw = await request<Record<string, any>>(`/admin/courses/${courseId}`);
  const modules: any[] = raw.modules ?? [];
  return modules
    .map((m) => ({
      ...fromModule({ ...m, courseId }),
      lessons: (m.lessons ?? []).map((l: any) => fromLesson({ ...l, moduleId: m.id })),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const adminAddModule = async (courseId: string, d: Partial<AdminModule>) =>
  fromModule(await request<Record<string, any>>(`/admin/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(toModuleDto(d)) }));
export const adminUpdateModule = async (id: string, d: Partial<AdminModule>) =>
  fromModule(await request<Record<string, any>>(`/admin/modules/${id}`, { method: 'PATCH', body: JSON.stringify(toModuleDto(d)) }));
export const adminDeleteModule = (id: string) => request<void>(`/admin/modules/${id}`, { method: 'DELETE' });

export const adminAddLesson = async (moduleId: string, d: Partial<AdminLesson>) =>
  fromLesson(await request<Record<string, any>>(`/admin/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(toLessonDto(d)) }));
export const adminUpdateLesson = async (id: string, d: Partial<AdminLesson>) =>
  fromLesson(await request<Record<string, any>>(`/admin/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(toLessonDto(d)) }));
export const adminDeleteLesson = (id: string) => request<void>(`/admin/lessons/${id}`, { method: 'DELETE' });

/* Exam products ─ the dashboard's flat {title, questions, duration, price}
   shape is mapped on and off the ExamProduct entity here. */
function toAdminExamProduct(raw: Record<string, any>): AdminExamProduct {
  return {
    id: String(raw.id ?? ''),
    title: raw.certName ?? raw.title ?? '',
    questions: Number(raw.questionsCount ?? raw.questions ?? 0),
    duration: Number(raw.perExamDurationMinutes ?? raw.duration ?? 0),
    price: raw.priceMinor != null ? minorToMajor(raw.priceMinor) : Number(raw.price ?? 0),
    currency: raw.currency ?? 'NGN',
    published: raw.isPublished ?? raw.published,
    certCode: raw.certCode,
    domain: raw.domain,
    slug: raw.slug,
  };
}

export const adminGetExams = async () =>
  page<Record<string, any>>(await request<unknown>('/admin/exam-products?limit=100')).map(toAdminExamProduct);

/* The detail payload carries the product's exam forms and topics — needed
   because questions and attempts hang off a *form*, not off the product. */
export const adminGetExamProduct = (id: string) =>
  request<ExamProductDetail & { exams: ExamForm[]; topics: ExamTopic[] }>(`/admin/exam-products/${id}`);

export const adminCreateExam = async (d: Partial<AdminExamProduct>) => {
  const title = d.title ?? 'Untitled exam';
  const body = {
    slug: d.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    certName: title,
    certCode: d.certCode ?? title,
    domain: d.domain ?? 'General',
    questionsCount: d.questions ?? 0,
    perExamDurationMinutes: d.duration || 90,
    priceMinor: majorToMinor(d.price ?? 0),
  };
  return toAdminExamProduct(await request<Record<string, any>>('/admin/exam-products', { method: 'POST', body: JSON.stringify(body) }));
};

export const adminUpdateExam = async (id: string, d: Partial<AdminExamProduct>) => {
  const body: Record<string, unknown> = {};
  if (d.title !== undefined)     body.certName = d.title;
  if (d.certCode !== undefined)  body.certCode = d.certCode;
  if (d.domain !== undefined)    body.domain = d.domain;
  if (d.questions !== undefined) body.questionsCount = d.questions;
  if (d.duration !== undefined)  body.perExamDurationMinutes = d.duration;
  if (d.price !== undefined)     body.priceMinor = majorToMinor(d.price);
  return toAdminExamProduct(await request<Record<string, any>>(`/admin/exam-products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }));
};

export const adminDeleteExam  = (id: string) => request<void>(`/admin/exam-products/${id}`, { method: 'DELETE' });
export const adminPublishExam = async (id: string, published: boolean) =>
  toAdminExamProduct(await request<Record<string, any>>(`/admin/exam-products/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished: published }) }));

/* Exam forms live under a product and are what attempts are started against. */
export const adminAddExamForm     = (productId: string, d: { title: string; durationMinutes?: number; passMark?: number; isFreeDemo?: boolean; isPublished?: boolean }) =>
  request<ExamForm>(`/admin/exam-products/${productId}/exams`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateExamForm  = (examId: string, d: Partial<ExamForm>) =>
  request<ExamForm>(`/admin/exams/${examId}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminPublishExamForm = (examId: string, isPublished: boolean) =>
  request<ExamForm>(`/admin/exams/${examId}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) });
export const adminDeleteExamForm  = (examId: string) => request<void>(`/admin/exams/${examId}`, { method: 'DELETE' });

export const adminAddTopic    = (productId: string, d: { name: string; position?: number }) =>
  request<ExamTopic>(`/admin/exam-products/${productId}/topics`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateTopic = (topicId: string, d: { name?: string; position?: number }) =>
  request<ExamTopic>(`/admin/topics/${topicId}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminDeleteTopic = (topicId: string) => request<void>(`/admin/topics/${topicId}`, { method: 'DELETE' });

/* Questions ─ `examId` here is an exam *form* id, not an exam product id. */
function toAdminQuestion(raw: Record<string, any>): AdminQuestion {
  const options: any[] = raw.options ?? [];
  return {
    id: String(raw.id ?? ''),
    examId: raw.examId,
    text: raw.text ?? '',
    options: options.map((o) => (typeof o === 'string' ? o : o?.text ?? '')),
    correctIndex: Math.max(0, options.findIndex((o) => o?.isCorrect)),
    explanation: raw.explanation ?? undefined,
  };
}

export const adminGetQuestions = async (examId: string) =>
  page<Record<string, any>>(await request<unknown>(`/admin/exams/${examId}/questions`)).map(toAdminQuestion);

export const adminCreateQuestion = async (d: Partial<AdminQuestion>) => {
  const body = {
    examId: d.examId,
    text: d.text,
    explanation: d.explanation,
    options: (d.options ?? []).map((text, i) => ({ text, isCorrect: i === (d.correctIndex ?? 0), orderIndex: i })),
  };
  return toAdminQuestion(await request<Record<string, any>>('/admin/questions', { method: 'POST', body: JSON.stringify(body) }));
};

export const adminUpdateQuestion = async (id: string, d: Partial<AdminQuestion>) => {
  const body: Record<string, unknown> = {};
  if (d.text !== undefined)        body.text = d.text;
  if (d.explanation !== undefined) body.explanation = d.explanation;
  if (d.options !== undefined)
    body.options = d.options.map((text, i) => ({ text, isCorrect: i === (d.correctIndex ?? 0), orderIndex: i }));
  return toAdminQuestion(await request<Record<string, any>>(`/admin/questions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }));
};

export const adminDeleteQuestion = (id: string) => request<void>(`/admin/questions/${id}`, { method: 'DELETE' });

export const adminImportQuestions = (examId: string, csv: string) =>
  request<{ imported: number }>(`/admin/exams/${examId}/questions/import`, {
    method: 'POST', body: JSON.stringify({ format: 'csv', content: csv }),
  });

/* Exam vouchers */
export const adminGetVouchers = async () =>
  page<ExamVoucher>(await request<unknown>('/admin/exam-vouchers?limit=100'));
export const adminGetVoucher  = (id: string) => request<ExamVoucher>(`/admin/exam-vouchers/${id}`);
export const adminCreateVoucher = (d: Partial<ExamVoucher>) =>
  request<ExamVoucher>('/admin/exam-vouchers', { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateVoucher = (id: string, d: Partial<ExamVoucher>) =>
  request<ExamVoucher>(`/admin/exam-vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminPublishVoucher = (id: string, isPublished: boolean) =>
  request<ExamVoucher>(`/admin/exam-vouchers/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) });
export const adminDeleteVoucher = (id: string) => request<void>(`/admin/exam-vouchers/${id}`, { method: 'DELETE' });

/* Instructors */
export const adminCreateInstructor = (d: Partial<ApiInstructor>) =>
  request<ApiInstructor>('/admin/instructors', { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateInstructor = (id: string, d: Partial<ApiInstructor>) =>
  request<ApiInstructor>(`/admin/instructors/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const adminDeleteInstructor = (id: string) => request<void>(`/admin/instructors/${id}`, { method: 'DELETE' });

/* Users */
export const adminGetUsers = async (page_ = 1) => {
  const raw = await request<unknown>(`/admin/users${qs({ page: page_ })}`);
  return { users: page<AdminUser>(raw), total: pageTotal(raw), totalPages: pageTotalPages(raw) };
};
export const adminUpdateUser = (id: string, d: { fullName?: string; role?: string; status?: string }) =>
  request<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(d) });

/* Operational tables — all `{ data, meta }`; the `{ key, total }` wrappers are
   kept so existing dashboard callers don't have to change. */
function toAdminOrder(raw: Record<string, any>): AdminOrder {
  return {
    id: String(raw.id ?? ''),
    userId: raw.userId ?? '',
    total: minorToMajor(raw.totalMinor ?? raw.total),
    currency: raw.currency ?? 'NGN',
    status: raw.status ?? '',
    createdAt: raw.createdAt ?? '',
    items: (raw.items ?? []).map((i: any) => ({ courseId: i.itemId, price: minorToMajor(i.lineTotalMinor) })),
  };
}

function toAdminPayment(raw: Record<string, any>): AdminPayment {
  return {
    id: String(raw.id ?? ''),
    orderId: raw.orderId ?? '',
    amount: minorToMajor(raw.amountMinor ?? raw.amount),
    currency: raw.currency ?? 'NGN',
    method: raw.provider ?? raw.method ?? '',
    status: raw.status ?? '',
    createdAt: raw.createdAt ?? '',
    reference: raw.providerReference ?? raw.reference,
  };
}

export const adminGetOrdersList = async (page_ = 1) =>
  page<Record<string, any>>(await request<unknown>(`/admin/orders${qs({ page: page_ })}`)).map(toAdminOrder);

export const adminGetOrders = async (page_ = 1) => {
  const raw = await request<unknown>(`/admin/orders${qs({ page: page_ })}`);
  return { orders: page<Record<string, any>>(raw).map(toAdminOrder), total: pageTotal(raw) };
};

export const adminGetPayments = async (page_ = 1) => {
  const raw = await request<unknown>(`/admin/payments${qs({ page: page_ })}`);
  return { payments: page<Record<string, any>>(raw).map(toAdminPayment), total: pageTotal(raw) };
};

export const adminGetAttempts = async (page_ = 1) => {
  const raw = await request<unknown>(`/admin/attempts${qs({ page: page_ })}`);
  return { attempts: page<AdminAttempt>(raw), total: pageTotal(raw) };
};

export const adminGetLeads = async (page_ = 1, filters?: { type?: string; status?: string; search?: string }) => {
  const raw = await request<unknown>(`/admin/leads${qs({ page: page_, ...filters })}`);
  return { leads: page<AdminLead>(raw), total: pageTotal(raw) };
};

export const adminUpdateLeadStatus = (id: string, status: string) =>
  request<AdminLead>(`/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const adminGetAuditLogs = async (page_ = 1) => {
  const raw = await request<unknown>(`/admin/audit-logs${qs({ page: page_ })}`);
  return { logs: page<AdminAuditLog>(raw), total: pageTotal(raw) };
};

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
