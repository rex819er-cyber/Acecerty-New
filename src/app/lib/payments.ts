/* ─────────────────────────────────────────────────────────────────────────
   Acecerty — payment service client

   POST /api/orders/checkout        → { authorizationUrl, reference, … }
   GET  /api/orders/verify?reference → { status, order, … }

   Every call carries `Authorization: Bearer <jwt>`. The token is read in the
   order the backend spec prescribes: `accessToken` first, then
   `student_access_token`.
───────────────────────────────────────────────────────────────────────── */

import { API_BASE } from './api';
import type { ApiError } from './api';

export type PaymentProvider = 'paystack' | 'flutterwave' | 'stripe';
export type PaymentMethod   = 'apple_pay' | 'google_pay' | 'card' | 'gateway';

/** Reads the active student JWT, or null when the visitor is signed out. */
export function getActiveToken(): string | null {
  try {
    return localStorage.getItem('accessToken') || localStorage.getItem('student_access_token');
  } catch { return null; }
}

/** Thrown when a payment call is attempted without a session. */
export class NotAuthenticatedError extends Error {
  constructor() { super('Please sign in to complete enrolment'); this.name = 'NotAuthenticatedError'; }
}

/* Authorised fetch — refuses to leave the browser without a Bearer token so a
   signed-out user can never trigger an anonymous order. */
async function authorisedRequest<T>(path: string, init: RequestInit = {}, ms = 60_000): Promise<T> {
  const token = getActiveToken();
  if (!token) throw new NotAuthenticatedError();

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      mode: 'cors',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers as Record<string, string> ?? {}),
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      let msg = `API ${res.status}`;
      try { const b = await res.json(); msg = b?.message ?? b?.error ?? msg; } catch {}
      throw { message: msg, status: res.status } as ApiError;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === 'AbortError')
      throw { message: 'Request timed out — the server may be waking up', isTimeout: true } as ApiError;
    throw err;
  }
}

/* ── checkout ─────────────────────────────────────────────────────────── */

export interface CheckoutRequest {
  courseId: string;
  paymentProvider: PaymentProvider;
  paymentMethod: PaymentMethod;
  /** Extra courses when the cart holds more than one; ignored by backends that don't read it. */
  courseIds?: string[];
  email?: string;
  amount?: number;
}

/* Gateways disagree on what they call the hosted-checkout URL, so accept the
   whole family and normalise downstream. */
export interface CheckoutResponse {
  authorizationUrl?: string;
  authorization_url?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  link?: string;
  reference?: string;
  accessCode?: string;
  orderId?: string;
  data?: Record<string, any>;
}

/** Pulls the hosted-gateway URL out of whichever key the backend used. */
export function extractAuthorizationUrl(res: CheckoutResponse): string | null {
  const d = res.data ?? {};
  return (
    res.authorizationUrl ?? res.authorization_url ?? res.paymentUrl ?? res.checkoutUrl ?? res.link ??
    d.authorizationUrl ?? d.authorization_url ?? d.paymentUrl ?? d.checkoutUrl ?? d.link ??
    null
  );
}

export function extractReference(res: CheckoutResponse): string | null {
  return res.reference ?? res.data?.reference ?? res.data?.tx_ref ?? null;
}

export const startCheckout = (payload: CheckoutRequest) =>
  authorisedRequest<CheckoutResponse>('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/* ── verification ─────────────────────────────────────────────────────── */

export interface VerifyResponse {
  status?: string;
  success?: boolean;
  paid?: boolean;
  reference?: string;
  amount?: number;
  currency?: string;
  order?: { id: string; total: number; status: string; items?: { courseId: string; price: number }[] };
  message?: string;
  data?: Record<string, any>;
}

export const verifyPayment = (reference: string) =>
  authorisedRequest<VerifyResponse>(`/orders/verify?reference=${encodeURIComponent(reference)}`);

/** True when the verification response indicates a settled payment. */
export function isPaymentSuccessful(res: VerifyResponse): boolean {
  const status = String(res.status ?? res.order?.status ?? res.data?.status ?? '').toLowerCase();
  if (res.success === true || res.paid === true) return true;
  return ['success', 'successful', 'paid', 'completed', 'complete'].includes(status);
}

/* ── UI selection → gateway wire values ───────────────────────────────── */

/** The payment options the checkout UI offers. */
export type UiPayOption = 'paystack' | 'flutterwave' | 'card' | 'apple_pay' | 'google_pay';

export function resolveGateway(option: UiPayOption): { paymentProvider: PaymentProvider; paymentMethod: PaymentMethod } {
  switch (option) {
    case 'paystack':    return { paymentProvider: 'paystack',    paymentMethod: 'gateway'    };
    case 'flutterwave': return { paymentProvider: 'flutterwave', paymentMethod: 'gateway'    };
    case 'card':        return { paymentProvider: 'paystack',    paymentMethod: 'card'       };
    case 'apple_pay':   return { paymentProvider: 'stripe',      paymentMethod: 'apple_pay'  };
    case 'google_pay':  return { paymentProvider: 'stripe',      paymentMethod: 'google_pay' };
  }
}
