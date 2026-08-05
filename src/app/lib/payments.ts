/* ─────────────────────────────────────────────────────────────────────────
   Acecerty — payment service client

   The backend has no single "checkout" call. Paying is two steps:

     POST /api/orders            { items? }   → Order (prices snapshotted)
     POST /api/orders/:id/pay    { provider } → { orderId, reference, checkoutUrl }

   Settlement is then confirmed by the provider's signed webhook
   (POST /api/webhooks/paystack | /flutterwave), which grants entitlements.
   There is no client-callable verify endpoint, so the return page polls
   GET /api/orders/:id until the order flips to `paid`.

   Every call carries `Authorization: Bearer <jwt>`. The token is read in the
   order the backend spec prescribes: `accessToken` first, then
   `student_access_token`.
───────────────────────────────────────────────────────────────────────── */

import { API_BASE, minorToMajor } from './api';
import type { ApiError, ItemType, Order, PaymentInit } from './api';

/** The providers the backend can actually initialise a charge with. */
export type PaymentProvider = 'paystack' | 'flutterwave';

export type { ItemType, Order };

/** Where a pending order is parked between the redirect and the return trip. */
const PENDING_ORDER_KEY = 'acecerty_pending_order';

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
      throw { message: Array.isArray(msg) ? msg.join(', ') : msg, status: res.status } as ApiError;
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

export interface CheckoutLine { itemType: ItemType; itemId: string }

export interface CheckoutRequest {
  /** Omit to let the backend build the order from the user's server-side cart. */
  items?: CheckoutLine[];
  provider: PaymentProvider;
}

export interface CheckoutResult {
  orderId: string;
  reference: string;
  checkoutUrl: string;
  /** Order total in major units, for the confirmation copy. */
  total: number;
  currency: string;
}

export interface PendingOrder { orderId: string; reference: string; total: number; currency: string }

/** Remembers which order the gateway was sent to, so the return page can poll it. */
export function rememberPendingOrder(o: PendingOrder) {
  try { sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(o)); } catch {}
}
export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    return raw ? (JSON.parse(raw) as PendingOrder) : null;
  } catch { return null; }
}
export function clearPendingOrder() {
  try { sessionStorage.removeItem(PENDING_ORDER_KEY); } catch {}
}

/**
 * Creates the order, then initialises the charge. The two calls are kept
 * together because a created-but-unpaid order is useless to the buyer, and the
 * gateway URL is what the UI actually needs.
 */
export async function startCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const order = await authorisedRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(req.items?.length ? { items: req.items } : {}),
  });

  const init = await authorisedRequest<PaymentInit>(`/orders/${order.id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ provider: req.provider }),
  });

  const result: CheckoutResult = {
    orderId: order.id,
    reference: init.reference,
    checkoutUrl: init.checkoutUrl,
    total: minorToMajor(order.totalMinor),
    currency: order.currency,
  };
  rememberPendingOrder({ orderId: result.orderId, reference: result.reference, total: result.total, currency: result.currency });
  return result;
}

/* ── verification ─────────────────────────────────────────────────────── */

export interface VerifyResponse {
  status: string;
  reference?: string;
  order: { id: string; total: number; status: string; currency: string; items: { itemId: string; itemType: ItemType; title: string; price: number }[] };
}

/**
 * Reads the order back. Fulfilment is driven by the provider webhook, so a
 * freshly-returned buyer can legitimately still see `pending` for a few
 * seconds — hence the polling helper below rather than a single check.
 */
export async function verifyOrder(orderId: string): Promise<VerifyResponse> {
  const order = await authorisedRequest<Order>(`/orders/${orderId}`);
  return {
    status: order.status,
    order: {
      id: order.id,
      total: minorToMajor(order.totalMinor),
      status: order.status,
      currency: order.currency,
      items: (order.items ?? []).map((i) => ({
        itemId: i.itemId,
        itemType: i.itemType,
        title: i.titleSnapshot,
        price: minorToMajor(i.lineTotalMinor),
      })),
    },
  };
}

/** True when the order has settled. */
export function isPaymentSuccessful(res: VerifyResponse): boolean {
  return String(res.status ?? '').toLowerCase() === 'paid';
}

/** True when the order will never settle — no point polling further. */
export function isPaymentTerminalFailure(res: VerifyResponse): boolean {
  return ['failed', 'cancelled', 'refunded'].includes(String(res.status ?? '').toLowerCase());
}

/**
 * Polls the order until it settles, fails, or the attempts run out. Spacing is
 * deliberately generous: the webhook usually lands within a couple of seconds,
 * and each poll is a round-trip to a cold-startable host.
 */
export async function pollOrderUntilSettled(
  orderId: string,
  { attempts = 6, intervalMs = 2500 }: { attempts?: number; intervalMs?: number } = {},
): Promise<VerifyResponse> {
  let last = await verifyOrder(orderId);
  for (let i = 1; i < attempts; i++) {
    if (isPaymentSuccessful(last) || isPaymentTerminalFailure(last)) return last;
    await new Promise((r) => setTimeout(r, intervalMs));
    last = await verifyOrder(orderId);
  }
  return last;
}

/* ── UI selection → gateway wire values ───────────────────────────────── */

/** The payment options the checkout UI offers. */
export type UiPayOption = 'paystack' | 'flutterwave' | 'card' | 'apple_pay' | 'google_pay';

/**
 * Every option collapses onto one of the two providers the backend supports.
 * Cards and wallets are presented by Paystack's own hosted checkout, so they
 * route there rather than to a separate processor.
 */
export function resolveProvider(option: UiPayOption): PaymentProvider {
  return option === 'flutterwave' ? 'flutterwave' : 'paystack';
}

/* Legacy shape kept for callers that spread the result into a request body. */
export function resolveGateway(option: UiPayOption): { provider: PaymentProvider } {
  return { provider: resolveProvider(option) };
}
