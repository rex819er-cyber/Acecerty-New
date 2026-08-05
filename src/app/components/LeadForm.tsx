import React, { useState } from 'react';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { apiSubmitContact } from '../lib/api';

const REQUEST_TYPES = ['Individual Training', 'Team Training', 'Enterprise Solutions', 'Request Quote', 'Other'];

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '', requestType: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* POST /api/leads/contact — the backend's ContactDto is {name, email, phone,
     message}, so company/request-type are folded into the message body. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError('');
    const context = [
      form.requestType && `Request type: ${form.requestType}`,
      form.company    && `Company: ${form.company}`,
    ].filter(Boolean).join('\n');
    try {
      await apiSubmitContact({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone || undefined,
        message: [context, form.message].filter(Boolean).join('\n\n') || 'Training enquiry',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Could not send your request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all';
  const inputStyle = { backgroundColor: 'var(--input-background)', border: '1px solid var(--border)', color: 'var(--foreground)', '--tw-ring-color': '#00A2B6' } as React.CSSProperties;

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden bg-background"
      style={{ fontFamily: 'var(--ace-font)' }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--foreground) 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />
      {/* Cyan glow */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,162,182,0.10) 0%, transparent 70%)', transform: 'translate(30%, -30%)', filter: 'blur(40px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#00A2B6' }}>Get In Touch</p>
            <h2
              className="mb-6 leading-tight text-foreground"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 800 }}
            >
              The accelerated learning company for busy IT professionals looking to upskill, fast.
            </h2>
            <p className="mb-10 leading-relaxed text-muted-foreground text-sm sm:text-base">
              Whether you're an individual looking to level up or an enterprise building a security-ready team, our training advisors are ready to help you find the right path.
            </p>
          </div>

          {/* Right: form */}
          <div className="rounded-3xl p-8 lg:p-10 shadow-2xl bg-card border border-border">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(0,162,182,0.12)' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: '#00A2B6' }} />
                </div>
                <h3 className="mb-3 text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Request Received</h3>
                <p className="text-muted-foreground">A training advisor will contact you shortly to discuss your goals.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="mb-2 text-foreground" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Talk to a training advisor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jane" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" className={inputCls} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputCls} style={inputStyle} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type of Request</label>
                  <select name="requestType" value={form.requestType} onChange={handleChange} className={inputCls} style={{ ...inputStyle }}>
                    <option value="">Select a type…</option>
                    {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us about your training goals…" className={inputCls} style={{ ...inputStyle, resize: 'none' }} />
                </div>
                {error && (
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--destructive)' }}>
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-2 w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: '#00A2B6' }}
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    : <><Send className="h-4 w-4" /> Submit Request</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
