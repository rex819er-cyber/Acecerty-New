import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  LayoutDashboard, BookOpen, DollarSign, Layers, ClipboardList,
  ShoppingCart, CreditCard, Users, UserCog, FileText, LogOut, Menu, X,
  Plus, Edit2, Trash2, Upload, Eye, EyeOff, ChevronDown, ChevronUp,
  Wifi, AlertCircle, CheckCircle2, Save, RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  adminGetStats, adminGetCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminPublishCourse, adminUploadImage, adminGetPrices, adminUpdatePrice, adminAddPrice, adminDeletePrice,
  adminGetExams, adminCreateExam, adminPublishExam, adminGetQuestions, adminCreateQuestion,
  adminImportQuestions, adminGetOrdersList, adminGetUsers, adminGetPayments, adminGetLeads, adminGetAuditLogs,
  adminAddModule, adminAddLesson, clearAdminToken,
} from '../lib/api';
import type {
  AdminStats, AdminCourse, ProductPrice, AdminExamProduct, AdminQuestion,
  AdminOrder, AdminPayment, AdminLead, AdminAuditLog, AdminModule, AdminUser,
} from '../lib/api';

type Section = 'overview'|'courses'|'prices'|'modules'|'exams'|'orders'|'users'|'payments'|'leads'|'audit';

/* ── shared styles & UI primitives ────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, fontFamily: 'var(--ace-font)',
  background: 'var(--muted)', border: '1px solid var(--border)',
  color: 'var(--text-primary, var(--foreground))', fontSize: '0.875rem', outline: 'none',
};

function ColdBanner({ msg }: { msg: string }) {
  return (
    <div style={{ background: 'var(--ace-brand-light)', border: '1px solid var(--ace-brand)', borderRadius: 'var(--ace-radius-sm)', color: 'var(--ace-brand)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--ace-font)', fontSize: '0.82rem' }}>
      <Wifi size={14} className="animate-pulse shrink-0" /> {msg}
    </div>
  );
}

function ErrBanner({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div style={{ background: 'color-mix(in srgb, var(--destructive) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)', borderRadius: 'var(--ace-radius-sm)', color: 'var(--destructive)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--ace-font)', fontSize: '0.82rem' }}>
      <AlertCircle size={14} className="shrink-0" /> {msg}
      {onRetry && <button onClick={onRetry} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ace-font)', fontSize: '0.78rem' }}><RefreshCw size={12} /> Retry</button>}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, fontSize: '1.3rem' }}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ status }: { status?: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    success:   { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    published: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    pending:   { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
    failed:    { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    draft:     { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
  };
  const lc = (status ?? '').toLowerCase();
  const s = map[lc] ?? map.draft;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--ace-font)' }}>{status ?? '—'}</span>;
}

function TblWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table></div>;
}
const Th = ({ children }: { children: React.ReactNode }) => (
  <th style={{ padding: '11px 14px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', fontWeight: 600, background: 'var(--card)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td style={{ padding: '11px 14px', color: 'var(--muted-foreground)', fontSize: '0.83rem', fontFamily: 'var(--ace-font)', borderBottom: '1px solid var(--border)' }}>{children}</td>
);

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, fontSize: '1.15rem' }}>{title}</h2>
      {action}
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'|'outline'; size?: 'sm'|'md'; disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--ace-brand)', color: 'var(--primary-foreground)' },
    ghost:   { background: 'var(--muted)', color: 'var(--muted-foreground)' },
    danger:  { background: 'color-mix(in srgb, var(--destructive) 15%, transparent)', color: 'var(--destructive)', border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)' },
    outline: { background: 'transparent', color: 'var(--ace-brand)', border: '1px solid var(--ace-brand)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: size === 'sm' ? '5px 12px' : '8px 16px', borderRadius: 8,
      border: styles[variant].border ?? 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--ace-font)', fontSize: size === 'sm' ? '0.78rem' : '0.875rem', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.6 : 1,
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--ace-radius-lg)', width: '100%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto' }} className="p-5 sm:p-7" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'var(--muted-foreground)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

/* ── null-safe rendering helpers ──────────────────────────────────────── */
/** Coerces unknown to a finite number; returns fallback for null/undefined/NaN. */
function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
/** Normalises API responses that may wrap an array in an envelope object. */
function safeArr<T>(raw: unknown, ...hints: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    for (const k of [...hints, 'data', 'items', 'results', 'records']) {
      const v = (raw as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}
/** Formats a date value to locale date string, returning '—' on bad input. */
function safeDate(v: unknown): string {
  if (!v) return '—';
  try { const d = new Date(v as string); return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(); }
  catch { return String(v ?? '—'); }
}
/** Formats a date value to locale datetime string, returning '—' on bad input. */
function safeDatetime(v: unknown): string {
  if (!v) return '—';
  try { const d = new Date(v as string); return isNaN(d.getTime()) ? String(v) : d.toLocaleString(); }
  catch { return String(v ?? '—'); }
}

/* ── Error Boundary — catches render crashes in any admin section ──────── */
interface EBState { error: Error | null }
class AdminErrorBoundary extends React.Component<{ children: React.ReactNode; sectionName?: string }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error): EBState { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AdminDashboard] render error:', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        padding: '32px 24px', borderRadius: 'var(--ace-radius-md)', margin: '16px 0',
        background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertCircle size={20} style={{ color: 'var(--destructive)', flexShrink: 0 }} />
          <span style={{ color: 'var(--destructive)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>
            {this.props.sectionName ? `Error in ${this.props.sectionName}` : 'Something went wrong in this section'}
          </span>
        </div>
        <pre style={{ color: 'var(--muted-foreground)', fontFamily: 'monospace', fontSize: '0.78rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'auto' }}>
          {this.state.error.message}
        </pre>
        <button onClick={() => this.setState({ error: null })}
          style={{ marginTop: 14, padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--ace-brand)', color: 'var(--primary-foreground)', fontFamily: 'var(--ace-font)', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );
  }
}

/* ── helper: live fetch with slow/error state ──────────────────────────── */
function useLive<T>(fetcher: () => Promise<T>, fallback: T) {
  const navigate = useNavigate();
  const [data, setData]   = useState<T>(fallback);
  const [slow, setSlow]   = useState(false);
  const [err, setErr]     = useState('');
  const [loading, setLd]  = useState(true);

  function load() {
    setLd(true); setErr(''); setSlow(false);
    const t = setTimeout(() => setSlow(true), 2500);
    fetcher()
      .then(d => setData(d))
      .catch((e: any) => {
        if (e?.status === 401 || e?.status === 403) {
          clearAdminToken();
          navigate('/admin/login', { replace: true });
          return;
        }
        setErr(e?.message ?? 'Failed to load');
      })
      .finally(() => { clearTimeout(t); setSlow(false); setLd(false); });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, setData, slow, err, loading, reload: load };
}

/* Handles 401/403 from CRUD actions — clears token & redirects */
function useHandleAdminErr() {
  const navigate = useNavigate();
  return (e: any): boolean => {
    if (e?.status === 401 || e?.status === 403) {
      clearAdminToken();
      navigate('/admin/login', { replace: true });
      return true;
    }
    return false;
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION COMPONENTS — all data comes from live API; no mock constants
═══════════════════════════════════════════════════════════════════════ */

function OverviewSection() {
  const EMPTY: AdminStats = { totalRevenue: 0, totalOrders: 0, totalStudents: 0, totalCourses: 0, revenueByMonth: [], ordersByStatus: [] };
  const { data: stats, slow, err, reload } = useLive(adminGetStats, EMPTY);

  return (
    <div>
      {slow && <ColdBanner msg="Connecting to live backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={22} />} label="Total Revenue"  value={`₦${(safeNum(stats.totalRevenue) / 1000).toFixed(0)}K`} color="#22c55e" />
        <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={safeNum(stats.totalOrders).toLocaleString()} color="var(--ace-brand)" />
        <StatCard icon={<Users size={22} />} label="Students"            value={safeNum(stats.totalStudents).toLocaleString()} color="#a78bfa" />
        <StatCard icon={<BookOpen size={22} />} label="Courses"          value={safeNum(stats.totalCourses).toLocaleString()} color="#fb923c" />
      </div>
      {stats.revenueByMonth.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--ace-brand)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--ace-brand)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--ace-font)' }} formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--ace-brand)" fill="url(#rg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="status" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--ace-font)' }} />
                <Bar dataKey="count" fill="var(--ace-brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {stats.revenueByMonth.length === 0 && !slow && !err && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          No analytics data yet.
        </div>
      )}
    </div>
  );
}

function CoursesSection() {
  const { data: courses, setData: setCourses, slow, err, reload } = useLive(
    () => adminGetCourses().then(r => safeArr<AdminCourse>(r, 'courses')),
    [] as AdminCourse[],
  );
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<AdminCourse | null>(null);
  const [form, setForm]           = useState({ title: '', description: '', category: '', level: 'Intermediate', format: 'online', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleErr = useHandleAdminErr();

  function openCreate() { setEditing(null); setForm({ title: '', description: '', category: '', level: 'Intermediate', format: 'online', price: '' }); setShowModal(true); }
  function openEdit(c: AdminCourse) { setEditing(c); setForm({ title: c.title, description: c.description, category: c.category ?? '', level: c.level ?? 'Intermediate', format: c.format ?? 'online', price: c.price?.toString() ?? '' }); setShowModal(true); }

  async function save() {
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) { const r = await adminUploadImage(imageFile).catch(() => ({ url: '' })); imageUrl = r.url || undefined; }
      const payload = { title: form.title, description: form.description, category: form.category, level: form.level, format: form.format, price: Number(form.price), ...(imageUrl ? { image: imageUrl } : {}) };
      if (editing) {
        const updated = await adminUpdateCourse(editing.id, payload);
        setCourses(cs => cs.map(c => c.id === editing.id ? updated : c));
      } else {
        const created = await adminCreateCourse(payload);
        setCourses(cs => [...cs, created]);
      }
      setShowModal(false);
      toast.success(editing ? 'Course updated' : 'Course created');
    } catch (e: any) { if (!handleErr(e)) toast.error(e?.message ?? 'Save failed'); }
    finally { setSaving(false); }
  }

  async function togglePublish(c: AdminCourse) {
    try {
      const updated = await adminPublishCourse(c.id, !c.published);
      setCourses(cs => cs.map(x => x.id === c.id ? updated : x));
    } catch (e: any) {
      if (!handleErr(e)) setCourses(cs => cs.map(x => x.id === c.id ? { ...x, published: !x.published } : x));
    }
  }

  /* DELETE /api/admin/courses/{id} — removes it from the public catalog too */
  async function remove(c: AdminCourse) {
    if (!window.confirm(`Delete "${c.title}"? This removes it from the public catalog immediately.`)) return;
    setDeleting(c.id);
    try {
      await adminDeleteCourse(c.id);
      setCourses(cs => cs.filter(x => x.id !== c.id));
      toast.success('Course deleted');
    } catch (e: any) {
      if (!handleErr(e)) toast.error(e?.message ?? 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {slow && <ColdBanner msg="Loading courses from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Courses (${courses.length})`} action={<Btn onClick={openCreate}><Plus size={14} /> New Course</Btn>} />
      <TblWrap>
        <thead><tr><Th>Title</Th><Th>Category</Th><Th>Level</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {courses.length === 0 && !slow && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No courses yet.</td></tr>
          )}
          {courses.map(c => (
            <tr key={c.id}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{c.title}</span></Td>
              <Td>{c.category}</Td><Td>{c.level}</Td>
              <Td>₦{(c.price ?? 0).toLocaleString()}</Td>
              <Td><Badge status={c.published ? 'published' : 'draft'} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit2 size={12} /></Btn>
                  <Btn size="sm" variant={c.published ? 'ghost' : 'outline'} onClick={() => togglePublish(c)}>
                    {c.published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Btn>
                  <Btn size="sm" variant="danger" disabled={deleting === c.id} onClick={() => remove(c)}>
                    <Trash2 size={12} />
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
      {showModal && (
        <Modal title={editing ? 'Edit Course' : 'New Course'} onClose={() => setShowModal(false)}>
          <Field label="Title"><input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Description"><textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></Field>
            <Field label="Price (₦)"><input style={inp} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <select style={inp} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {['Beginner','Intermediate','Advanced'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Format">
              <select style={inp} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                {['online','bootcamp','hybrid'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Cover Image">
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            <Btn variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={13} /> {imageFile ? imageFile.name : 'Choose file'}</Btn>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}><Save size={13} /> {saving ? 'Saving…' : 'Save'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PricesSection() {
  const { data: prices, setData: setPrices, slow, err, reload } = useLive(adminGetPrices, [] as ProductPrice[]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ courseId: '', region: 'NG', currency: 'NGN', amount: '' });

  async function saveEdit(p: ProductPrice) {
    const updated = await adminUpdatePrice(p.id, Number(editVal)).catch(() => ({ ...p, amount: Number(editVal) }));
    setPrices(ps => ps.map(x => x.id === p.id ? updated : x)); setEditing(null);
  }
  async function doDelete(id: string) {
    await adminDeletePrice(id).catch(() => {}); setPrices(ps => ps.filter(p => p.id !== id));
  }
  async function addPrice() {
    const created = await adminAddPrice({ ...addForm, amount: Number(addForm.amount) });
    setPrices(ps => [...ps, created]); setShowAdd(false); setAddForm({ courseId: '', region: 'NG', currency: 'NGN', amount: '' });
  }

  return (
    <div>
      {slow && <ColdBanner msg="Loading prices from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Product Prices (${prices.length})`} action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Price</Btn>} />
      <TblWrap>
        <thead><tr><Th>Course ID</Th><Th>Region</Th><Th>Currency</Th><Th>Amount</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {prices.length === 0 && !slow && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No prices configured yet.</td></tr>
          )}
          {prices.map(p => (
            <tr key={p.id}>
              <Td>{p.courseId}</Td><Td>{p.region}</Td><Td>{p.currency}</Td>
              <Td>{editing === p.id ? <input style={{ ...inp, width: 120, display: 'inline-block' }} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus /> : safeNum(p.amount).toLocaleString()}</Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editing === p.id
                    ? <Btn size="sm" onClick={() => saveEdit(p)}><CheckCircle2 size={12} /></Btn>
                    : <Btn size="sm" variant="ghost" onClick={() => { setEditing(p.id); setEditVal(String(p.amount ?? '')); }}><Edit2 size={12} /></Btn>}
                  <Btn size="sm" variant="danger" onClick={() => doDelete(p.id)}><Trash2 size={12} /></Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
      {showAdd && (
        <Modal title="Add Price" onClose={() => setShowAdd(false)}>
          <Field label="Course ID"><input style={inp} value={addForm.courseId} onChange={e => setAddForm(f => ({ ...f, courseId: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region"><input style={inp} value={addForm.region} onChange={e => setAddForm(f => ({ ...f, region: e.target.value }))} /></Field>
            <Field label="Currency"><input style={inp} value={addForm.currency} onChange={e => setAddForm(f => ({ ...f, currency: e.target.value }))} /></Field>
          </div>
          <Field label="Amount"><input style={inp} type="number" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addPrice}>Add</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ModulesSection() {
  const { data: courses, slow: cSlow } = useLive(
    () => adminGetCourses().then(r => safeArr<AdminCourse>(r, 'courses')),
    [] as AdminCourse[],
  );
  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [newMod, setNewMod]   = useState('');
  const [newLessons, setNewLessons] = useState<Record<string, string>>({});
  const [openMods, setOpenMods]     = useState<Set<string>>(new Set());

  async function addModule() {
    if (!selectedCourse || !newMod.trim()) return;
    const mod = await adminAddModule(selectedCourse, { title: newMod, order: modules.length });
    setModules(ms => [...ms, mod]); setNewMod('');
  }
  async function addLesson(moduleId: string) {
    const title = newLessons[moduleId]; if (!title?.trim()) return;
    await adminAddLesson(moduleId, { title, type: 'video', order: 0 });
    setNewLessons(n => ({ ...n, [moduleId]: '' }));
  }

  return (
    <div>
      {cSlow && <ColdBanner msg="Loading courses…" />}
      <SectionHeader title="Modules & Lessons" />
      <Field label="Select Course">
        <select style={inp} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="">-- choose course --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      {selectedCourse && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input style={{ ...inp, flex: 1 }} value={newMod} onChange={e => setNewMod(e.target.value)} placeholder="New module title…" />
            <Btn onClick={addModule}><Plus size={14} /> Add Module</Btn>
          </div>
          {modules.length === 0 && <div style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem', padding: '24px 0', textAlign: 'center' }}>No modules yet.</div>}
          {modules.map(mod => {
            const isOpen = openMods.has(mod.id);
            return (
              <div key={mod.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10 }}>
                <button style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setOpenMods(s => { const n = new Set(s); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n; })}>
                  <span style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 600 }}>{mod.title}</span>
                  {isOpen ? <ChevronUp size={15} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...inp, flex: 1 }} value={newLessons[mod.id] ?? ''} onChange={e => setNewLessons(n => ({ ...n, [mod.id]: e.target.value }))} placeholder="New lesson title…" />
                      <Btn size="sm" onClick={() => addLesson(mod.id)}><Plus size={12} /> Add</Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function ExamsSection() {
  const { data: exams, setData: setExams, slow, err, reload } = useLive(
    () => adminGetExams().then(r => safeArr<AdminExamProduct>(r, 'exams')),
    [] as AdminExamProduct[],
  );
  const [selectedExam, setSelectedExam] = useState('');
  const [questions, setQuestions]       = useState<AdminQuestion[]>([]);
  const [showCreate, setShowCreate]     = useState(false);
  const [showImport, setShowImport]     = useState(false);
  const [newExam, setNewExam]           = useState({ title: '', questions: '', duration: '', price: '' });
  const [csvText, setCsvText]           = useState('');
  const [newQ, setNewQ]                 = useState({ text: '', options: ['','','',''], correctIndex: 0 });
  const handleErr = useHandleAdminErr();

  async function createExam() {
    try {
      const e = await adminCreateExam({ title: newExam.title, questions: Number(newExam.questions), duration: Number(newExam.duration), price: Number(newExam.price) });
      setExams(es => [...es, e]); setShowCreate(false); setNewExam({ title: '', questions: '', duration: '', price: '' });
      toast.success('Exam created');
    } catch (e: any) { if (!handleErr(e)) toast.error(e?.message ?? 'Create failed'); }
  }
  async function togglePublishExam(ex: AdminExamProduct) {
    try {
      const updated = await adminPublishExam(ex.id, !ex.published);
      setExams(es => es.map(e => e.id === ex.id ? updated : e));
    } catch (e: any) {
      if (!handleErr(e)) setExams(es => es.map(e => e.id === ex.id ? { ...e, published: !e.published } : e));
    }
  }
  async function loadQuestions(examId: string) {
    setSelectedExam(examId); adminGetQuestions(examId).then(setQuestions).catch(() => setQuestions([]));
  }
  async function addQuestion() {
    if (!selectedExam || !newQ.text.trim()) return;
    try {
      const q = await adminCreateQuestion({ examId: selectedExam, text: newQ.text, options: newQ.options, correctIndex: newQ.correctIndex });
      setQuestions(qs => [...qs, q]); setNewQ({ text: '', options: ['','','',''], correctIndex: 0 });
    } catch (e: any) { if (!handleErr(e)) toast.error(e?.message ?? 'Failed to add question'); }
  }
  async function importCsv() {
    if (!selectedExam) return;
    try {
      const r = await adminImportQuestions(selectedExam, csvText);
      toast.success(`Imported ${r.imported} questions`);
      setShowImport(false); setCsvText('');
      adminGetQuestions(selectedExam).then(setQuestions).catch(() => {});
    } catch (e: any) { if (!handleErr(e)) toast.error(e?.message ?? 'Import failed'); }
  }

  return (
    <div>
      {slow && <ColdBanner msg="Loading exams from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Exams (${exams.length})`} action={<Btn onClick={() => setShowCreate(true)}><Plus size={14} /> New Exam</Btn>} />
      <TblWrap>
        <thead><tr><Th>Title</Th><Th>Questions</Th><Th>Duration</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {exams.length === 0 && !slow && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No exams yet.</td></tr>
          )}
          {exams.map(ex => (
            <tr key={ex.id}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{ex.title}</span></Td>
              <Td>{ex.questions ?? '—'}</Td><Td>{ex.duration != null ? `${ex.duration} min` : '—'}</Td><Td>₦{safeNum(ex.price).toLocaleString()}</Td>
              <Td><Badge status={ex.published ? 'published' : 'draft'} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => loadQuestions(ex.id)}>Questions</Btn>
                  <Btn size="sm" variant={ex.published ? 'danger' : 'outline'} onClick={() => togglePublishExam(ex)}>
                    {ex.published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>

      {selectedExam && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>Question Bank ({questions.length})</h3>
            <Btn size="sm" variant="ghost" onClick={() => setShowImport(true)}><Upload size={12} /> CSV Import</Btn>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <Field label="Question Text"><textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              {newQ.options.map((opt, i) => (
                <Field key={i} label={`Option ${i+1}${newQ.correctIndex === i ? ' ✓' : ''}`}>
                  <input style={{ ...inp, borderColor: newQ.correctIndex === i ? 'var(--ace-brand)' : undefined }}
                    value={opt} onChange={e => setNewQ(q => { const o = [...q.options]; o[i] = e.target.value; return { ...q, options: o }; })}
                    onClick={() => setNewQ(q => ({ ...q, correctIndex: i }))} />
                </Field>
              ))}
            </div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', marginBottom: 10 }}>Click an option to mark it correct</div>
            <Btn onClick={addQuestion}><Plus size={13} /> Add Question</Btn>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <div style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted-foreground)', marginRight: 6 }}>{i+1}.</span>{q.text}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {q.options.map((o, oi) => (
                  <div key={oi} style={{ fontSize: '0.78rem', color: oi === q.correctIndex ? 'var(--ace-brand)' : 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {oi === q.correctIndex && <CheckCircle2 size={11} />} {o}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Exam" onClose={() => setShowCreate(false)}>
          <Field label="Title"><input style={inp} value={newExam.title} onChange={e => setNewExam(f => ({ ...f, title: e.target.value }))} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Questions"><input style={inp} type="number" value={newExam.questions} onChange={e => setNewExam(f => ({ ...f, questions: e.target.value }))} /></Field>
            <Field label="Duration (min)"><input style={inp} type="number" value={newExam.duration} onChange={e => setNewExam(f => ({ ...f, duration: e.target.value }))} /></Field>
            <Field label="Price (₦)"><input style={inp} type="number" value={newExam.price} onChange={e => setNewExam(f => ({ ...f, price: e.target.value }))} /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn onClick={createExam}>Create</Btn>
          </div>
        </Modal>
      )}
      {showImport && (
        <Modal title="Import Questions (CSV)" onClose={() => setShowImport(false)}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', fontFamily: 'var(--ace-font)', marginBottom: 12 }}>
            Format: <code style={{ background: 'var(--muted)', padding: '1px 6px', borderRadius: 4 }}>question,opt1,opt2,opt3,opt4,correctIndex</code>
          </p>
          <Field label="CSV Content"><textarea style={{ ...inp, height: 160, resize: 'vertical' }} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"How many bits in a byte?,4,8,16,32,1"} /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowImport(false)}>Cancel</Btn>
            <Btn onClick={importCsv}><Upload size={13} /> Import</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* GET /api/admin/users — platform analytics: accounts, roles, growth */
function UsersSection() {
  const { data: users, slow, err, reload } = useLive(
    () => adminGetUsers().then(r => safeArr<AdminUser>(r, 'users')),
    [] as AdminUser[],
  );

  const admins   = users.filter(u => u.role === 'admin').length;
  const students = users.length - admins;

  return (
    <div>
      {slow && <ColdBanner msg="Loading users from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<Users size={22} />}   label="Total Accounts" value={users.length.toLocaleString()} color="var(--ace-brand)" />
        <StatCard icon={<BookOpen size={22} />} label="Students"      value={students.toLocaleString()}     color="#a78bfa" />
        <StatCard icon={<UserCog size={22} />}  label="Admins"        value={admins.toLocaleString()}       color="#fb923c" />
      </div>

      <SectionHeader title={`Users (${users.length})`} action={<Btn variant="ghost" size="sm" onClick={reload}><RefreshCw size={12} /> Refresh</Btn>} />
      <TblWrap>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th></tr></thead>
        <tbody>
          {users.length === 0 && !slow && (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No users yet.</td></tr>
          )}
          {users.map(u => (
            <tr key={u.id ?? Math.random()}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{u.fullName ?? u.name ?? '—'}</span></Td>
              <Td>{u.email ?? '—'}</Td>
              <Td><Badge status={u.role === 'admin' ? 'published' : 'pending'} /></Td>
              <Td>{safeDate(u.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function OrdersSection() {
  const { data, slow, err, reload } = useLive(
    () => adminGetOrdersList().then(r => safeArr<AdminOrder>(r, 'orders')),
    [] as AdminOrder[],
  );

  const revenue = data.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const paid    = data.filter(o => ['completed', 'success', 'paid'].includes((o.status ?? '').toLowerCase())).length;

  return (
    <div>
      {slow && <ColdBanner msg="Loading orders from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={data.length.toLocaleString()}     color="var(--ace-brand)" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Paid Orders"  value={paid.toLocaleString()}            color="#22c55e" />
        <StatCard icon={<DollarSign size={22} />}   label="Gross Value"  value={`₦${revenue.toLocaleString()}`}   color="#fb923c" />
      </div>

      <SectionHeader title={`Orders (${data.length})`} action={<Btn variant="ghost" size="sm" onClick={reload}><RefreshCw size={12} /> Refresh</Btn>} />
      <TblWrap>
        <thead><tr><Th>Order ID</Th><Th>User</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No orders yet.</td></tr>}
          {data.map(o => (
            <tr key={o.id ?? Math.random()}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id ?? '—'}</span></Td>
              <Td>{o.userId ?? '—'}</Td>
              <Td>₦{safeNum(o.total).toLocaleString()}</Td>
              <Td><Badge status={o.status} /></Td>
              <Td>{safeDate(o.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function PaymentsSection() {
  const { data, slow, err, reload } = useLive(
    () => adminGetPayments().then(r => safeArr<AdminPayment>(r?.payments ?? r, 'payments')),
    [] as AdminPayment[],
  );
  return (
    <div>
      {slow && <ColdBanner msg="Loading payments from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Payments (${data.length})`} />
      <TblWrap>
        <thead><tr><Th>ID</Th><Th>Order</Th><Th>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No payments yet.</td></tr>}
          {data.map(p => (
            <tr key={p.id ?? Math.random()}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.id ?? '—'}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.orderId ?? '—'}</span></Td>
              <Td>₦{safeNum(p.amount).toLocaleString()}</Td>
              <Td>{p.method ?? '—'}</Td>
              <Td><Badge status={p.status} /></Td>
              <Td>{safeDate(p.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function LeadsSection() {
  const { data, slow, err, reload } = useLive(
    () => adminGetLeads().then(r => safeArr<AdminLead>(r?.leads ?? r, 'leads')),
    [] as AdminLead[],
  );
  return (
    <div>
      {slow && <ColdBanner msg="Loading leads from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Leads (${data.length})`} />
      <TblWrap>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Source</Th><Th>Date</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No leads yet.</td></tr>}
          {data.map(l => (
            <tr key={l.id ?? Math.random()}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{l.name ?? '—'}</span></Td>
              <Td>{l.email ?? '—'}</Td>
              <Td>{l.phone ?? '—'}</Td>
              <Td>{l.source ?? '—'}</Td>
              <Td>{safeDate(l.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function AuditSection() {
  const { data, slow, err, reload } = useLive(
    () => adminGetAuditLogs().then(r => safeArr<AdminAuditLog>(r?.logs ?? r, 'logs')),
    [] as AdminAuditLog[],
  );
  return (
    <div>
      {slow && <ColdBanner msg="Loading audit logs from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Audit Logs (${data.length})`} />
      <TblWrap>
        <thead><tr><Th>Time</Th><Th>User</Th><Th>Action</Th><Th>Resource</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No audit logs yet.</td></tr>}
          {data.map(l => (
            <tr key={l.id ?? Math.random()}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{safeDatetime(l.createdAt)}</span></Td>
              <Td>{l.userId ?? '—'}</Td>
              <Td><span style={{ color: 'var(--ace-brand)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.action ?? '—'}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.resource ?? '—'}</span></Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD SHELL
═══════════════════════════════════════════════════════════════════════ */
const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',  label: 'Overview',    icon: <LayoutDashboard size={17} /> },
  { key: 'courses',   label: 'Courses',     icon: <BookOpen size={17} />        },
  { key: 'prices',    label: 'Prices',      icon: <DollarSign size={17} />      },
  { key: 'modules',   label: 'Modules',     icon: <Layers size={17} />          },
  { key: 'exams',     label: 'Exams',       icon: <ClipboardList size={17} />   },
  { key: 'orders',    label: 'Orders',      icon: <ShoppingCart size={17} />    },
  { key: 'users',     label: 'Users',       icon: <UserCog size={17} />         },
  { key: 'payments',  label: 'Payments',    icon: <CreditCard size={17} />      },
  { key: 'leads',     label: 'Leads',       icon: <Users size={17} />           },
  { key: 'audit',     label: 'Audit Logs',  icon: <FileText size={17} />        },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection]   = useState<Section>('overview');
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  /* Access control lives in <AdminRoute>, so by the time this renders we
     already hold a valid admin_access_token. */
  function logout() {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  }

  const wrap = (name: string, node: React.ReactNode) => (
    <AdminErrorBoundary sectionName={name}>{node}</AdminErrorBoundary>
  );

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    overview:  wrap('Overview',    <OverviewSection />),
    courses:   wrap('Courses',     <CoursesSection />),
    prices:    wrap('Prices',      <PricesSection />),
    modules:   wrap('Modules',     <ModulesSection />),
    exams:     wrap('Exams',       <ExamsSection />),
    orders:    wrap('Orders',      <OrdersSection />),
    users:     wrap('Users',       <UsersSection />),
    payments:  wrap('Payments',    <PaymentsSection />),
    leads:     wrap('Leads',       <LeadsSection />),
    audit:     wrap('Audit Logs',  <AuditSection />),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', fontFamily: 'var(--ace-font)' }}>
      {/* Mobile overlay */}
      {sideOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside style={{
        width: 232, flexShrink: 0, background: 'var(--card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 110,
        transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s',
      }} className="lg:!translate-x-0">
        <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ace-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={15} color="var(--primary-foreground)" />
          </div>
          <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '0.95rem' }}>Acecerty Admin</span>
          <button onClick={() => setSideOpen(false)} className="lg:hidden ml-auto" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={16} /></button>
        </div>
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setSection(key); setSideOpen(false); }} style={{
              width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2,
              background: section === key ? 'var(--ace-brand-light)' : 'transparent',
              color: section === key ? 'var(--ace-brand)' : 'var(--muted-foreground)',
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
              fontFamily: 'var(--ace-font)', fontSize: '0.875rem', fontWeight: section === key ? 600 : 400,
            }}>{icon} {label}</button>
          ))}
        </nav>
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--ace-font)', fontSize: '0.875rem' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }} className="lg:ml-[232px]">
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSideOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><Menu size={20} /></button>
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontFamily: 'var(--ace-font)' }}>
            {NAV_ITEMS.find(n => n.key === section)?.label}
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {SECTION_MAP[section]}
        </div>
      </div>
    </div>
  );
}
