import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Lock, ChevronRight, CheckCircle2, AlertCircle, CreditCard, Smartphone, X, Wifi, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder, apiPayOrder, apiGetEntitlements } from '../lib/api';

type PayMethod = 'card' | 'paystack' | 'flutterwave';

function ApplePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
      style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)', fontFamily: 'var(--ace-font)' }}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      Apple Pay
    </button>
  );
}

function GooglePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] border"
      style={{ backgroundColor: '#fff', color: '#3c4043', borderColor: '#dadce0', fontFamily: 'var(--ace-font)' }}>
      <svg viewBox="0 0 48 20" width="42" height="18">
        <text x="0"  y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#4285F4">G</text>
        <text x="10" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#EA4335">o</text>
        <text x="18" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#FBBC04">o</text>
        <text x="26" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#4285F4">g</text>
        <text x="33" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#34A853">l</text>
        <text x="38" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#EA4335">e</text>
      </svg>
      Pay
    </button>
  );
}

const PAYMENT_METHODS: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'paystack',    label: 'Paystack',            icon: <svg viewBox="0 0 80 24" width="56" height="17" fill="none"><text x="0" y="18" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="18" fill="#00C3F7">Pay</text><text x="36" y="18" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="18" fill="#011B33">stack</text></svg> },
  { id: 'flutterwave', label: 'Flutterwave',         icon: <Smartphone size={18} /> },
  { id: 'card',        label: 'Debit / Credit Card', icon: <CreditCard size={18} /> },
];

function InputField({ label, type = 'text', placeholder, value, onChange, error, half }: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; half?: boolean;
}) {
  return (
    <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${error ? 'var(--destructive)' : 'var(--border)'}`, background: 'var(--input-background)', color: 'var(--foreground)', fontSize: '0.875rem', fontFamily: 'var(--ace-font)', outline: 'none', boxSizing: 'border-box' }} />
      {error && <p style={{ fontSize: '0.72rem', marginTop: 4, color: 'var(--destructive)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ace-font)' }}><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [payMethod, setPayMethod] = useState<PayMethod>('paystack');
  const [step, setStep]           = useState<'details'|'payment'|'redirect'|'success'>('details');
  const [loading, setLoading]     = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [apiError, setApiError]   = useState('');
  const [slowConn, setSlowConn]   = useState(false);
  const [payUrl, setPayUrl]       = useState('');

  const [form, setForm]         = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const VAT_RATE = 0.075;
  const vat   = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e); return Object.keys(e).length === 0;
  }
  function validateCard() {
    const e: Record<string, string> = {};
    if (payMethod === 'card') {
      if (cardForm.number.replace(/\s/g,'').length < 16) e.cardNumber = '16-digit number required';
      if (!cardForm.name.trim()) e.cardName = 'Name required';
      if (!cardForm.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'MM/YY';
      if (cardForm.cvc.length < 3) e.cvc = '3-digit CVC';
    }
    if (!agreed) e.agreed = 'Accept terms to continue';
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }
    if (!validateCard()) return;
    setLoading(true); setApiError(''); setSlowConn(false);
    const slowTimer = setTimeout(() => setSlowConn(true), 2500);
    try {
      const order  = await apiCreateOrder();
      const result = await apiPayOrder(order.id, payMethod);
      clearTimeout(slowTimer); setSlowConn(false);

      const redirectUrl = result.paymentUrl ?? result.authorizationUrl ?? (result as any).link;
      if (redirectUrl) {
        clearCart(); setPayUrl(redirectUrl); setStep('redirect');
        setTimeout(() => { window.location.href = redirectUrl; }, 1500);
      } else {
        clearCart(); setStep('success');
        apiGetEntitlements().catch(() => {});
      }
    } catch (err: any) {
      clearTimeout(slowTimer); setSlowConn(false);
      setApiError(err?.message ?? 'Payment initialisation failed. Please try again.');
    } finally { setLoading(false); }
  }

  function formatCardNumber(v: string) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
  function formatExpiry(v: string)     { return v.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})/,'$1/'); }

  if (step === 'redirect') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', fontFamily: 'var(--ace-font)', padding: 24 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,162,182,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ExternalLink size={28} style={{ color: 'var(--ace-brand)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--ace-font)' }}>Redirecting to Payment Gateway</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>
            You're being redirected to {payMethod === 'paystack' ? 'Paystack' : 'Flutterwave'} to complete your payment securely.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ace-brand)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
            <Wifi size={14} className="animate-pulse" /> Connecting to gateway…
          </div>
          {payUrl && (
            <a href={payUrl} style={{ display: 'inline-block', marginTop: 20, color: 'var(--ace-brand)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
              Click here if not redirected automatically
            </a>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', fontFamily: 'var(--ace-font)', padding: 24 }}>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,162,182,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--ace-brand)' }} />
          </div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--ace-font)' }}>Enrolment Confirmed!</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: 6, fontFamily: 'var(--ace-font)' }}>Welcome, {form.firstName || 'Student'}!</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: 28, lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>
            A confirmation receipt has been sent to <strong style={{ color: 'var(--ace-brand)' }}>{form.email}</strong>. Course access will be activated within a few minutes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/courses" style={{ display: 'block', padding: '13px 0', borderRadius: 14, background: 'var(--ace-brand)', color: '#fff', fontWeight: 700, textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--ace-font)' }}>Browse More Courses</Link>
            <Link to="/"       style={{ display: 'block', padding: '11px 0', borderRadius: 14, background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--ace-font)' }}>Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--background)', fontFamily: 'var(--ace-font)' }}>
        <p style={{ color: 'var(--foreground)', fontSize: '1.1rem', fontWeight: 700 }}>Your cart is empty</p>
        <Link to="/courses" style={{ padding: '11px 28px', borderRadius: 999, background: 'var(--ace-brand)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--ace-font)' }}>Browse Courses</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 80, paddingLeft: 16, paddingRight: 16, background: 'var(--background)', fontFamily: 'var(--ace-font)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
          <Link to="/courses" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontFamily: 'var(--ace-font)' }}>← Back to courses</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontFamily: 'var(--ace-font)' }}>Checkout</span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
          {['Your Details','Payment'].map((s, i) => {
            const active = (i === 0 && step === 'details') || (i === 1 && step === 'payment');
            const done   = i === 0 && step === 'payment';
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--ace-font)', background: (done||active) ? 'var(--ace-brand)' : 'var(--border)', color: (done||active) ? '#fff' : 'var(--muted-foreground)' }}>
                    {done ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: active ? 'var(--foreground)' : 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }} className="hidden sm:inline">{s}</span>
                </div>
                {i < 1 && <div style={{ width: 48, height: 1, background: 'var(--border)' }} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Form card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              {step === 'details' ? (
                <motion.div key="details" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
                  <div style={{ padding: '32px 28px' }}>
                    <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4, fontFamily: 'var(--ace-font)' }}>Your Details</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>We'll send your access details and receipt here.</p>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <InputField label="First Name" placeholder="Ada" value={form.firstName} onChange={v => setForm({...form,firstName:v})} error={errors.firstName} half />
                      <InputField label="Last Name"  placeholder="Okonkwo" value={form.lastName} onChange={v => setForm({...form,lastName:v})} error={errors.lastName} half />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <InputField label="Email Address" type="email" placeholder="ada@example.com" value={form.email} onChange={v => setForm({...form,email:v})} error={errors.email} />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <InputField label="Phone Number" type="tel" placeholder="+234 801 234 5678" value={form.phone} onChange={v => setForm({...form,phone:v})} error={errors.phone} />
                    </div>
                    <button onClick={() => { if (validateDetails()) setStep('payment'); }}
                      style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: 'var(--ace-brand)', color: '#fff', fontWeight: 700, fontFamily: 'var(--ace-font)', cursor: 'pointer', fontSize: '0.95rem' }}>
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  <div style={{ padding: '32px 28px' }}>
                    <button onClick={() => setStep('details')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '0.85rem', fontFamily: 'var(--ace-font)', marginBottom: 20 }}>← Back</button>
                    <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4, fontFamily: 'var(--ace-font)' }}>Payment</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: 24, fontFamily: 'var(--ace-font)' }}>Choose your preferred payment method.</p>

                    {slowConn && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,162,182,0.08)', border: '1px solid var(--ace-brand)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'var(--ace-brand)', fontSize: '0.82rem', fontFamily: 'var(--ace-font)' }}>
                        <Wifi size={13} className="animate-pulse" /> Connecting to live backend…
                      </div>
                    )}
                    {apiError && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.82rem', fontFamily: 'var(--ace-font)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={13} /> {apiError}
                      </div>
                    )}

                    {/* Express */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--ace-font)' }}>Express Checkout</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <ApplePayButton onClick={() => { setAgreed(true); clearCart(); setStep('success'); }} />
                        <GooglePayButton onClick={() => { setAgreed(true); clearCart(); setStep('success'); }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--ace-font)' }}>Or pay with</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${payMethod === m.id ? 'var(--ace-brand)' : 'var(--border)'}`, background: payMethod === m.id ? 'rgba(0,162,182,0.06)' : 'transparent', fontFamily: 'var(--ace-font)' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === m.id ? 'var(--ace-brand)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {payMethod === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ace-brand)' }} />}
                          </div>
                          <span style={{ color: 'var(--foreground)' }}>{m.icon}</span>
                          <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>{m.label}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {payMethod === 'card' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <InputField label="Card Number" placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={v => setCardForm({...cardForm,number:formatCardNumber(v)})} error={errors.cardNumber} />
                            <InputField label="Name on Card" placeholder="Ada Okonkwo" value={cardForm.name} onChange={v => setCardForm({...cardForm,name:v})} error={errors.cardName} />
                            <div style={{ display: 'flex', gap: 12 }}>
                              <InputField label="Expiry" placeholder="MM/YY" value={cardForm.expiry} onChange={v => setCardForm({...cardForm,expiry:formatExpiry(v)})} error={errors.expiry} half />
                              <InputField label="CVC" type="password" placeholder="•••" value={cardForm.cvc} onChange={v => setCardForm({...cardForm,cvc:v.replace(/\D/g,'').slice(0,4)})} error={errors.cvc} half />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {(payMethod === 'paystack' || payMethod === 'flutterwave') && (
                        <motion.div key="redir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(0,162,182,0.06)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: '0.83rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                          You'll be securely redirected to {payMethod === 'paystack' ? 'Paystack' : 'Flutterwave'} to complete payment.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button onClick={() => setAgreed(v => !v)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 8, width: '100%' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${errors.agreed ? '#ef4444' : agreed ? 'var(--ace-brand)' : 'var(--border)'}`, background: agreed ? 'var(--ace-brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        {agreed && <CheckCircle2 size={11} color="#fff" />}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.6, fontFamily: 'var(--ace-font)' }}>
                        I agree to Acecerty's <Link to="#" style={{ color: 'var(--ace-brand)' }}>Terms of Service</Link> and <Link to="#" style={{ color: 'var(--ace-brand)' }}>Refund Policy</Link>.
                      </span>
                    </button>
                    {errors.agreed && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: 12, fontFamily: 'var(--ace-font)' }}>{errors.agreed}</p>}

                    <button onClick={handlePay} disabled={loading} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: 'var(--ace-brand)', color: '#fff', fontWeight: 700, fontFamily: 'var(--ace-font)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                      {loading
                        ? <><span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Processing…</>
                        : <><Lock size={15} />Complete Enrolment — ₦{total.toLocaleString()}</>}
                    </button>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      {[['SSL Secured', <Shield key="s" size={12} />], ['256-bit Encryption', <Lock key="l" size={12} />], ['PCI Compliant', <CheckCircle2 key="c" size={12} />]].map(([label, icon]) => (
                        <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
                          <span style={{ color: 'var(--ace-brand)' }}>{icon}</span>{label as string}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24, position: 'sticky', top: 90 }}>
            <h3 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 16, fontFamily: 'var(--ace-font)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(({ course }) => (
                <div key={course.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: (course as any).gradient ?? 'var(--ace-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--ace-font)' }}>
                    {(course.shortTitle ?? course.title).slice(0,2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--ace-font)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.shortTitle ?? course.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{course.duration}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}>₦{course.price.toLocaleString()}</span>
                    <button onClick={() => removeFromCart(course.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}><span>VAT (7.5%)</span><span>₦{vat.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--ace-font)', marginTop: 4 }}><span>Total</span><span style={{ color: 'var(--ace-brand)' }}>₦{total.toLocaleString()}</span></div>
            </div>
            <div style={{ marginTop: 16, background: 'rgba(0,162,182,0.06)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={16} style={{ color: 'var(--ace-brand)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.5 }}>Your payment is encrypted and processed securely. Acecerty never stores your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
