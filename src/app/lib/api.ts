/* ─────────────────────────────────────────────────────────────────────────
   Acecerty API Client
   Base URL: https://acecerty-backend.onrender.com/api
   - Automatically attaches bearer token from localStorage
   - Handles Render cold-start delays gracefully (15s timeout)
   - All public API responses are typed; falls back to mock data on failure
───────────────────────────────────────────────────────────────────────── */

export const API_BASE = 'https://acecerty-backend.onrender.com/api';

const TOKEN_KEY = 'ace_token';

export function getStoredToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function storeToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}
export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

/* ── Core fetch wrapper ────────────────────────────────────────────────── */

export type ApiError = { message: string; status?: number; isTimeout?: boolean };

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const err: ApiError = { message: `API ${res.status}`, status: res.status };
      throw err;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const out: ApiError = { message: 'Request timed out — server may be waking up', isTimeout: true };
      throw out;
    }
    throw err as ApiError;
  }
}

/* ── Type definitions ──────────────────────────────────────────────────── */

export interface ApiCourse {
  id: string;
  title: string;
  description: string;
  image?: string;
  duration?: string;
  videos?: string;
  questions?: string;
  category?: string;
  price?: number;
  format?: string;
  level?: string;
}

export interface ApiModule {
  id: string;
  title: string;
  duration?: string;
  lessons: string[];
  order?: number;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/* ── Auth ──────────────────────────────────────────────────────────────── */

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiRegister(name: string, email: string, password: string): Promise<{ token: string; user: ApiUser }> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export async function apiGetMe(): Promise<ApiUser> {
  return request('/auth/me');
}

/* ── Courses ───────────────────────────────────────────────────────────── */

export interface CourseQueryParams {
  format?: string;
  level?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function apiGetCourses(params?: CourseQueryParams): Promise<ApiCourse[]> {
  const q = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
  ).toString() : '';
  return request<ApiCourse[]>(`/courses${q}`);
}

export async function apiGetCourse(id: string): Promise<ApiCourse> {
  return request<ApiCourse>(`/courses/${id}`);
}

export async function apiGetCourseModules(courseId: string): Promise<ApiModule[]> {
  return request<ApiModule[]>(`/courses/${courseId}/modules`);
}

/* ── Mentorship ────────────────────────────────────────────────────────── */

export interface ApiMentor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  avatar?: string;
  rating?: number;
  sessions?: number;
}

export async function apiGetMentors(): Promise<ApiMentor[]> {
  return request<ApiMentor[]>('/mentors');
}

export async function apiBookSession(mentorId: string, date: string, message: string): Promise<{ success: boolean }> {
  return request('/mentors/sessions', { method: 'POST', body: JSON.stringify({ mentorId, date, message }) });
}

/* ── Internship ────────────────────────────────────────────────────────── */

export interface ApiInternshipTrack {
  id: string;
  title: string;
  description: string;
  duration: string;
  spots: number;
  requirements: string[];
}

export async function apiGetInternshipTracks(): Promise<ApiInternshipTrack[]> {
  return request<ApiInternshipTrack[]>('/internships');
}

export async function apiApplyInternship(data: {
  name: string; email: string; phone: string; trackId: string; statement: string;
}): Promise<{ success: boolean; applicationId?: string }> {
  return request('/internships/apply', { method: 'POST', body: JSON.stringify(data) });
}

/* ── React hook: useApi ────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';

export type UseApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  slowConnection: boolean;
  refetch: () => void;
};

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slowConnection, setSlowConnection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSlowConnection(false);
    const slowTimer = setTimeout(() => setSlowConnection(true), 2500);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load');
    } finally {
      clearTimeout(slowTimer);
      setSlowConnection(false);
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, slowConnection, refetch: load };
}
