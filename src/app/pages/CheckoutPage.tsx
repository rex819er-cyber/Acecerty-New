import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Lock, ChevronRight, CheckCircle2, AlertCircle, CreditCard, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

type PayMethod = 'apple' | 'google' | 'card' | 'paystack' | 'flutterwave';

/* ── Express payment buttons ─────────────────────────────────────── */
function ApplePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
      style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      Apple Pay
    </button>
  );
}

function GooglePayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] border"
      style={{ backgroundColor: '#fff', color: '#3c4043', borderColor: '#dadce0' }}
    >
      <svg viewBox="0 0 48 20" width="42" height="18">
        <text x="0" y="15" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="14" fill="#4285F4">G</text>
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
  {
    id: 'card',
    label: 'Debit / Credit Card',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 'paystack',
    label: 'Paystack',
    icon: (
      <svg viewBox="0 0 80 24" width="56" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="18" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="18" fill="#00C3F7">Pay</text>
        <text x="36" y="18" fontFamily="Inter,sans-serif" fontWeight="800" fontSize="18" fill="#011B33">stack</text>
      </svg>
    ),
  },
  {
    id: 'flutterwave',
    label: 'Flutterwave',
    icon: <Smartphone className="h-5 w-5" />,
  },
];

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 16" width="40" height="14" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="16" rx="3" fill="#1A1F71" />
      <text x="50%" y="12" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10" fill="#FFFFFF" letterSpacing="1">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 30" width="34" height="22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="15" r="12" fill="#EB001B" />
      <circle cx="30" cy="15" r="12" fill="#F79E1B" />
      <path d="M24 6.8a12 12 0 010 16.4A12 12 0 0124 6.8z" fill="#FF5F00" />
    </svg>
  );
}

function VerveIcon() {
  return (
    <svg viewBox="0 0 48 16" width="40" height="14" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="16" rx="3" fill="#00425F" />
      <text x="50%" y="12" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="9" fill="#FFFFFF" letterSpacing="0.5">VERVE</text>
    </svg>
  );
}

function InputField({
  label, type = 'text', placeholder, value, onChange, error, half,
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; half?: boolean;
}) {
  const borderColor = error ? 'var(--destructive)' : 'var(--border)';
  const focusBorder = error ? 'var(--destructive)' : 'var(--ace-brand)';
  return (
    <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
      <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-input-background text-foreground"
        style={{ border: `1.5px solid ${borderColor}`, fontFamily: 'var(--ace-font)' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = focusBorder)}
        onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
      />
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1 text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bg = 'var(--background)';
  const cardBg = 'var(--card)';
  const sectionBg = 'var(--muted)';
  const border = 'var(--border)';
  const textPrimary = 'var(--foreground)';
  const textMuted = 'var(--muted-foreground)';

  const VAT_RATE = 0.075;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  function validateDetails() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (!form.phone.trim()) errs.phone = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCard() {
    const errs: Record<string, string> = {};
    if (payMethod === 'card') {
      if (cardForm.number.replace(/\s/g, '').length < 16) errs.cardNumber = '16-digit card number required';
      if (!cardForm.name.trim()) errs.cardName = 'Name on card required';
      if (!cardForm.expiry.match(/^\d{2}\/\d{2}$/)) errs.expiry = 'MM/YY format';
      if (cardForm.cvc.length < 3) errs.cvc = '3-digit CVC required';
    }
    if (!agreed) errs.agreed = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleDetailsNext() {
    if (validateDetails()) setStep('payment');
  }

  function handlePay() {
    if (!validateCard()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      clearCart();
    }, 2200);
  }

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(v: string) {
    return v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})/, '$1/');
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20"
        style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="max-w-md w-full rounded-3xl p-8 text-center shadow-2xl"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--ace-brand-light)' }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: 'var(--ace-brand)' }} />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: textPrimary }}>Enrolment Confirmed!</h1>
          <p className="text-sm mb-2" style={{ color: textMuted }}>
            Welcome, {form.firstName}! A confirmation has been sent to
          </p>
          <p className="font-semibold text-sm mb-6" style={{ color: 'var(--ace-brand)' }}>{form.email}</p>
          <p className="text-xs mb-8 leading-relaxed" style={{ color: textMuted }}>
            Your course access will be activated within 30 minutes. Check your email for login credentials and course materials.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/courses"
              className="block py-3.5 rounded-2xl text-sm font-bold text-white text-center"
              style={{ backgroundColor: 'var(--ace-brand)' }}>
              Browse More Courses
            </Link>
            <Link to="/"
              className="block py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-20"
        style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <p className="text-xl font-bold" style={{ color: textPrimary }}>Your cart is empty</p>
        <Link to="/courses" className="px-6 py-3 rounded-full text-sm font-bold text-white" style={{ backgroundColor: 'var(--ace-brand)' }}>
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/courses" className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-70" style={{ color: textMuted }}>
            ← Back to courses
          </Link>
          <ChevronRight className="h-4 w-4" style={{ color: textMuted }} />
          <span className="text-sm font-semibold" style={{ color: textPrimary }}>Checkout</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {['Your Details', 'Payment'].map((s, i) => {
            const active = (i === 0 && step === 'details') || (i === 1 && step === 'payment');
            const done = (i === 0 && step === 'payment');
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: done ? 'var(--ace-brand)' : active ? 'var(--ace-brand)' : 'var(--border)',
                      color: done || active ? '#fff' : textMuted,
                    }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block" style={{ color: active ? textPrimary : textMuted }}>{s}</span>
                </div>
                {i < 1 && <div className="flex-1 h-px max-w-[60px]" style={{ backgroundColor: border }} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Form */}
          <div className="relative rounded-3xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <AnimatePresence mode="wait">
              {step === 'details' ? (
                <motion.div key="details" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}>
                  <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-black mb-1" style={{ color: textPrimary }}>Your Details</h2>
                    <p className="text-sm mb-6" style={{ color: textMuted }}>We'll send your access details and receipt here.</p>

                    <div className="flex gap-4 mb-4">
                      <InputField label="First Name" placeholder="Ada" value={form.firstName}
                        onChange={(v) => setForm({ ...form, firstName: v })} error={errors.firstName} half />
                      <InputField label="Last Name" placeholder="Okonkwo" value={form.lastName}
                        onChange={(v) => setForm({ ...form, lastName: v })} error={errors.lastName} half />
                    </div>
                    <div className="mb-4">
                      <InputField label="Email Address" type="email" placeholder="ada@example.com" value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })} error={errors.email}/>
                    </div>
                    <div className="mb-8">
                      <InputField label="Phone Number" type="tel" placeholder="+234 801 234 5678" value={form.phone}
                        onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone}/>
                    </div>

                    <button onClick={handleDetailsNext}
                      className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.97]"
                      style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 20px var(--ace-brand-glow)' }}>
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                  <div className="p-6 sm:p-8">
                    <button onClick={() => setStep('details')} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: textMuted }}>
                      ← Back
                    </button>
                    <h2 className="text-xl font-black mb-1" style={{ color: textPrimary }}>Payment</h2>
                    <p className="text-sm mb-5" style={{ color: textMuted }}>Choose your preferred payment method.</p>

                    {/* Express checkout */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-px" style={{ backgroundColor: border }} />
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>Express Checkout</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: border }} />
                      </div>
                      <div className="flex gap-3">
                        <ApplePayButton onClick={() => {
                          setPayMethod('apple');
                          setAgreed(true);
                          setTimeout(() => { setLoading(true); setTimeout(() => { setLoading(false); setStep('success'); clearCart(); }, 1800); }, 300);
                        }} />
                        <GooglePayButton onClick={() => {
                          setPayMethod('google');
                          setAgreed(true);
                          setTimeout(() => { setLoading(true); setTimeout(() => { setLoading(false); setStep('success'); clearCart(); }, 1800); }, 300);
                        }} />
                      </div>
                      <p className="text-[11px] text-center mt-2" style={{ color: textMuted }}>Tap to pay instantly with your saved card</p>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 h-px" style={{ backgroundColor: border }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>Or pay with</span>
                      <div className="flex-1 h-px" style={{ backgroundColor: border }} />
                    </div>

                    {/* Method selector */}
                    <div className="flex flex-col gap-2 mb-6">
                      {PAYMENT_METHODS.map((m) => (
                        <button key={m.id} onClick={() => setPayMethod(m.id)}
                          className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                          style={{
                            border: `2px solid ${payMethod === m.id ? 'var(--ace-brand)' : border}`,
                            backgroundColor: payMethod === m.id ? 'var(--ace-brand-light)' : 'transparent',
                          }}>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: payMethod === m.id ? 'var(--ace-brand)' : border }}>
                            {payMethod === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--ace-brand)' }} />}
                          </div>
                          <span style={{ color: textPrimary }}>{m.icon}</span>
                          <span className="font-medium text-sm" style={{ color: textPrimary }}>{m.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Card form */}
                    <AnimatePresence>
                      {payMethod === 'card' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                          style={{ overflow: 'hidden', position: 'relative' }}
                          className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <VisaIcon />
                            <MastercardIcon />
                            <VerveIcon />
                          </div>
                          <div className="flex flex-col gap-4">
                            <InputField label="Card Number" placeholder="1234 5678 9012 3456"
                              value={cardForm.number} onChange={(v) => setCardForm({ ...cardForm, number: formatCardNumber(v) })}
                              error={errors.cardNumber}/>
                            <InputField label="Name on Card" placeholder="Ada Okonkwo"
                              value={cardForm.name} onChange={(v) => setCardForm({ ...cardForm, name: v })}
                              error={errors.cardName}/>
                            <div className="flex gap-4">
                              <InputField label="Expiry" placeholder="MM/YY"
                                value={cardForm.expiry} onChange={(v) => setCardForm({ ...cardForm, expiry: formatExpiry(v) })}
                                error={errors.expiry} half />
                              <InputField label="CVC" type="password" placeholder="•••"
                                value={cardForm.cvc} onChange={(v) => setCardForm({ ...cardForm, cvc: v.replace(/\D/g, '').slice(0, 4) })}
                                error={errors.cvc} half />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {(payMethod === 'paystack' || payMethod === 'flutterwave') && (
                        <motion.div key="redirect-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="rounded-2xl px-5 py-4 mb-6 text-sm"
                          style={{ backgroundColor: 'var(--ace-brand-light)', color: textMuted }}>
                          You'll be securely redirected to {payMethod === 'paystack' ? 'Paystack' : 'Flutterwave'} to complete payment.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Terms */}
                    <button onClick={() => setAgreed(!agreed)} className="flex items-start gap-3 text-left mb-6">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ border: `2px solid ${errors.agreed ? '#ef4444' : agreed ? 'var(--ace-brand)' : border}`, backgroundColor: agreed ? 'var(--ace-brand)' : 'transparent' }}>
                        {agreed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                        I agree to Acecerty's <Link to="#" className="underline" style={{ color: 'var(--ace-brand)' }}>Terms of Service</Link> and{' '}
                        <Link to="#" className="underline" style={{ color: 'var(--ace-brand)' }}>Refund Policy</Link>. I understand my enrolment is non-transferable.
                      </p>
                    </button>
                    {errors.agreed && <p className="text-xs mb-4" style={{ color: '#ef4444' }}>{errors.agreed}</p>}

                    <button onClick={handlePay} disabled={loading}
                      className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 20px var(--ace-brand-glow)', opacity: loading ? 0.8 : 1 }}>
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Complete Enrolment — ₦{total.toLocaleString()}
                        </>
                      )}
                    </button>

                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
                        <Shield className="h-3.5 w-3.5" style={{ color: 'var(--ace-brand)' }} /> SSL Secured
                      </div>
                      <div className="w-px h-4" style={{ backgroundColor: border }} />
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
                        <Lock className="h-3.5 w-3.5" style={{ color: 'var(--ace-brand)' }} /> 256-bit Encryption
                      </div>
                      <div className="w-px h-4" style={{ backgroundColor: border }} />
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--ace-brand)' }} /> PCI Compliant
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="rounded-3xl sticky top-24" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <div className="p-6">
              <h3 className="font-black text-base mb-4" style={{ color: textPrimary }}>Order Summary</h3>

              <div className="flex flex-col gap-3 mb-5">
                {items.map(({ course }) => (
                  <div key={course.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                      style={{ background: course.gradient ?? 'var(--ace-brand)' }}>
                      {course.shortTitle.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug truncate" style={{ color: textPrimary }}>{course.shortTitle}</p>
                      <p className="text-xs truncate" style={{ color: textMuted }}>{course.duration}</p>
                    </div>
                    <div className="flex items-start gap-1.5 flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: textPrimary }}>₦60,000</span>
                      <button onClick={() => removeFromCart(course.id)} className="hover:opacity-70 transition-opacity mt-0.5">
                        <X className="h-3.5 w-3.5" style={{ color: textMuted }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex flex-col gap-2.5" style={{ borderColor: border }}>
                <div className="flex justify-between text-sm" style={{ color: textMuted }}>
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: textMuted }}>
                  <span>VAT (7.5%)</span>
                  <span>₦{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-base mt-1" style={{ color: textPrimary }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--ace-brand)' }}>₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-4 flex items-center gap-3"
                style={{ backgroundColor: 'var(--ace-brand-light)' }}>
                <Shield className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--ace-brand)' }} />
                <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                  Your payment is encrypted and processed securely. Acecerty never stores your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
