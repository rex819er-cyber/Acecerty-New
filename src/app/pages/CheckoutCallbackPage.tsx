import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AcecertyLogo } from '../components/AcecertyLogo';
import { useCart } from '../context/CartContext';
import {
  NotAuthenticatedError, isPaymentSuccessful, verifyPayment,
} from '../lib/payments';
import type { VerifyResponse } from '../lib/payments';

type Phase = 'verifying' | 'success' | 'pending' | 'error';

/**
 * /checkout/callback — where the gateway drops the buyer after payment.
 *
 * Paystack returns ?reference=…, Flutterwave ?transaction_id=… (plus tx_ref),
 * so all of those are accepted. The reference is verified server-side via
 * GET /api/orders/verify?reference=… with the Bearer token before anything is
 * treated as paid — the query string alone is not trustworthy.
 */
export default function CheckoutCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [phase, setPhase]     = useState<Phase>('verifying');
  const [message, setMessage] = useState('Confirming your payment with the gateway…');
  const [result, setResult]   = useState<VerifyResponse | null>(null);

  /* Verification is a one-shot side effect; StrictMode double-invokes effects. */
  const started = useRef(false);

  const reference =
    params.get('reference') ??
    params.get('transaction_id') ??
    params.get('tx_ref') ??
    params.get('trxref');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const gatewayStatus = (params.get('status') ?? '').toLowerCase();

    if (gatewayStatus === 'cancelled' || gatewayStatus === 'canceled') {
      setPhase('error');
      setMessage('Payment was cancelled. Your cart is still saved.');
      return;
    }

    if (!reference) {
      setPhase('error');
      setMessage('No transaction reference was returned by the payment gateway.');
      toast.error('Missing transaction reference');
      return;
    }

    (async () => {
      try {
        const res = await verifyPayment(reference);
        setResult(res);

        if (isPaymentSuccessful(res)) {
          clearCart();
          setPhase('success');
          setMessage('Payment confirmed — your enrolment is active.');
          toast.success('Payment successful');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
        } else {
          setPhase('pending');
          setMessage(res.message ?? 'The gateway has not settled this payment yet. It may take a moment to clear.');
        }
      } catch (err: unknown) {
        if (err instanceof NotAuthenticatedError) {
          toast.error('Please sign in to confirm your enrolment');
          navigate('/login', { replace: true, state: { returnTo: `/checkout/callback?reference=${reference}` } });
          return;
        }
        const e = err as { message?: string };
        setPhase('error');
        setMessage(e?.message ?? 'We could not verify this payment.');
        toast.error(e?.message ?? 'Payment verification failed');
      }
    })();
  }, [reference, params, navigate, clearCart]);

  const isError = phase === 'error';
  const accent  = phase === 'success' ? 'var(--ace-brand)'
                : isError             ? 'var(--destructive)'
                : 'var(--ace-brand)';

  const heading = phase === 'success' ? 'Enrolment Confirmed!'
                : phase === 'pending' ? 'Payment Pending'
                : isError             ? 'Payment Not Confirmed'
                : 'Verifying Payment';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10"
      style={{ background: 'var(--background)', fontFamily: 'var(--ace-font)' }}
    >
      <div
        className="max-w-md w-full p-8 text-center"
        style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--ace-radius-xl)', boxShadow: 'var(--ace-shadow-lg)',
        }}
      >
        <div className="flex justify-center mb-7">
          <Link to="/"><AcecertyLogo height={26} /></Link>
        </div>

        <div
          style={{
            width: 64, height: 64, borderRadius: 'var(--ace-radius-full)',
            background: isError
              ? 'color-mix(in srgb, var(--destructive) 10%, transparent)'
              : 'var(--ace-brand-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          {phase === 'verifying' && <Loader2 className="h-7 w-7 animate-spin" style={{ color: accent }} />}
          {phase === 'success'   && <CheckCircle2 className="h-8 w-8" style={{ color: accent }} />}
          {phase === 'pending'   && <Loader2 className="h-7 w-7 animate-spin" style={{ color: accent }} />}
          {isError               && <AlertCircle className="h-8 w-8" style={{ color: accent }} />}
        </div>

        <h1
          className="text-base sm:text-lg"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800, marginBottom: 8 }}
        >
          {heading}
        </h1>

        <p
          className="text-xs sm:text-sm"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.6 }}
        >
          {message}
        </p>

        {reference && (
          <div
            className="text-xs mt-5 px-3 py-2"
            style={{
              background: 'var(--muted)', borderRadius: 'var(--ace-radius-sm)',
              color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)',
              wordBreak: 'break-all',
            }}
          >
            Reference: <span style={{ color: 'var(--foreground)' }}>{reference}</span>
          </div>
        )}

        {phase === 'success' && result?.order && (
          <div
            className="text-xs mt-3"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}
          >
            Order {result.order.id} · ₦{Number(result.order.total ?? 0).toLocaleString()}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-7">
          {phase === 'success' ? (
            <Link
              to="/dashboard"
              className="text-sm"
              style={{
                padding: '13px 0', borderRadius: 'var(--ace-radius-md)',
                background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
                fontFamily: 'var(--ace-font)', fontWeight: 700,
                textAlign: 'center', textDecoration: 'none',
              }}
            >
              Go to My Dashboard
            </Link>
          ) : phase !== 'verifying' ? (
            <>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm"
                style={{
                  padding: '13px 0', borderRadius: 'var(--ace-radius-md)', border: 'none',
                  background: 'var(--ace-brand)', color: 'var(--primary-foreground)',
                  fontFamily: 'var(--ace-font)', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Check Again
              </button>
              <Link
                to="/checkout"
                className="text-sm"
                style={{
                  padding: '11px 0', borderRadius: 'var(--ace-radius-md)',
                  background: 'var(--muted)', color: 'var(--foreground)',
                  fontFamily: 'var(--ace-font)', fontWeight: 600,
                  textAlign: 'center', textDecoration: 'none',
                }}
              >
                Back to Checkout
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
