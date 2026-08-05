import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, BookOpen, DollarSign, Layers, ClipboardList,
  ShoppingCart, CreditCard, Users, UserCog, FileText, LogOut, Menu, X,
  Plus, Edit2, Trash2, Upload, Eye, EyeOff, ChevronDown, ChevronUp,
  Wifi, AlertCircle, CheckCircle2, Save, RefreshCw, Award,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  adminGetStats, adminGetCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminPublishCourse, adminUploadImage, adminGetPrices, adminUpsertPrice, adminDeletePrice,
  adminGetExams, adminCreateExam, adminPublishExam, adminGetQuestions, adminCreateQuestion,
  adminImportQuestions, adminGetOrdersList, adminGetUsers, adminGetPayments, adminGetLeads, adminGetAuditLogs,
  adminAddModule, adminAddLesson, adminAddExamForm, adminGetExamProduct, adminUpdateLeadStatus,
  adminGetCourseOutline, clearAdminToken, formatPrice, minorToMajor,
} from '../lib/api';
import type {
  AdminStats, AdminCourse, ProductPrice, AdminExamProduct, AdminQuestion,
  AdminOrder, AdminPayment, AdminLead, AdminAuditLog, AdminUser,
  AdminModuleWithLessons, ItemType, ExamForm,
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

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    success:   { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    published: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    pending:   { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
    failed:    { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    draft:     { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
  };
  const s = map[status.toLowerCase()] ?? map.draft;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--ace-font)' }}>{status}</span>;
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

/* ── helper: live fetch with slow/error state ──────────────────────────── */
function useLive<T>(fetcher: () => Promise<T>, fallback: T) {
  const [data, setData]   = useState<T>(fallback);
  const [slow, setSlow]   = useState(false);
  const [err, setErr]     = useState('');
  const [loading, setLd]  = useState(true);

  function load() {
    setLd(true); setErr(''); setSlow(false);
    const t = setTimeout(() => setSlow(true), 2500);
    fetcher()
      .then(d => setData(d))
      .catch((e: any) => setErr(e?.message ?? 'Failed to load'))
      .finally(() => { clearTimeout(t); setSlow(false); setLd(false); });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, setData, slow, err, loading, reload: load };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION COMPONENTS — all data comes from live API; no mock constants
═══════════════════════════════════════════════════════════════════════ */

function OverviewSection() {
  const EMPTY: AdminStats = {
    users: { total: 0, students: 0 },
    revenue: { byCurrency: {}, totalMinor: 0, currency: 'NGN' },
    orders: { total: 0, byStatus: {} },
    attempts: { total: 0, graded: 0, passed: 0, passRate: 0 },
    topProducts: [],
    revenueOverTime: [],
  };
  const { data: stats, slow, err, reload } = useLive(adminGetStats, EMPTY);

  /* Revenue is grouped by currency because the backend never sums across
     them — a chart needs one series, so it plots the base currency
     (`revenue.currency`) and lists any other currencies as separate figures
     beneath it rather than mixing them into one misleading number. */
  const baseCurrency = stats.revenue.currency;
  const otherCurrencies = Object.entries(stats.revenue.byCurrency).filter(([c]) => c !== baseCurrency);

  const ordersByStatusChart = Object.entries(stats.orders.byStatus).map(([status, count]) => ({ status, count }));
  const revenueChart = stats.revenueOverTime.map(r => ({ month: r.month, revenue: minorToMajor(r.revenueMinor) }));

  return (
    <div>
      {slow && <ColdBanner msg="Connecting to live backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={22} />} label={`Revenue (${baseCurrency})`} value={formatPrice(minorToMajor(stats.revenue.totalMinor), baseCurrency)} color="#22c55e" />
        <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={stats.orders.total.toString()} color="var(--ace-brand)" />
        <StatCard icon={<Users size={22} />} label="Students"            value={stats.users.students.toLocaleString()} color="#a78bfa" />
        <StatCard icon={<Award size={22} />} label="Exam Pass Rate"      value={`${stats.attempts.passRate}%`} color="#fb923c" />
      </div>
      {otherCurrencies.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {otherCurrencies.map(([currency, minor]) => (
            <div key={currency} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontFamily: 'var(--ace-font)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>Revenue ({currency}) </span>
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{formatPrice(minorToMajor(minor), currency)}</span>
            </div>
          ))}
        </div>
      )}
      {revenueChart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Monthly Revenue ({baseCurrency})</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--ace-brand)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--ace-brand)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatPrice(v, baseCurrency)} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--ace-font)' }} formatter={(v: number) => [formatPrice(v, baseCurrency), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--ace-brand)" fill="url(#rg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersByStatusChart}>
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
      {revenueChart.length === 0 && !slow && !err && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>
          No analytics data yet.
        </div>
      )}
    </div>
  );
}

function CoursesSection() {
  const { data: courses, setData: setCourses, slow, err, reload } = useLive(adminGetCourses, [] as AdminCourse[]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<AdminCourse | null>(null);
  const [form, setForm]           = useState({ title: '', description: '', category: '', level: 'Intermediate', format: 'online', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    } catch (e: any) { alert(e?.message ?? 'Save failed'); }
    finally { setSaving(false); }
  }

  async function togglePublish(c: AdminCourse) {
    const updated = await adminPublishCourse(c.id, !c.published).catch(() => ({ ...c, published: !c.published }));
    setCourses(cs => cs.map(x => x.id === c.id ? updated : x));
  }

  /* DELETE /api/admin/courses/{id} — removes it from the public catalog too */
  async function remove(c: AdminCourse) {
    if (!window.confirm(`Delete "${c.title}"? This removes it from the public catalog immediately.`)) return;
    setDeleting(c.id);
    try {
      await adminDeleteCourse(c.id);
      setCourses(cs => cs.filter(x => x.id !== c.id));
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed');
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
              <Td>{formatPrice(c.price ?? 0, c.currency)}</Td>
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
            {/* New courses are priced in the platform base currency (NGN); regional
                prices are set afterward from the Prices section. */}
            <Field label="Base Price (NGN)"><input style={inp} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></Field>
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

/* Regional prices hang off a specific catalog item, so GET /admin/product-prices
   takes (itemType, itemId) — there is no "all prices" listing. The section
   therefore starts with an item picker and loads that item's currency rows. */
const CURRENCIES = ['NGN', 'USD', 'GBP', 'GHS', 'KES', 'ZAR'];

function PricesSection() {
  const { data: courses } = useLive(adminGetCourses, [] as AdminCourse[]);
  const { data: exams }   = useLive(adminGetExams,   [] as AdminExamProduct[]);

  const [itemType, setItemType] = useState<ItemType>('course');
  const [itemId, setItemId]     = useState('');
  const [prices, setPrices]     = useState<ProductPrice[]>([]);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ currency: 'USD', amount: '' });

  const options = itemType === 'exam_product'
    ? exams.map(e => ({ id: e.id, label: e.title }))
    : itemType === 'course'
      ? courses.map(c => ({ id: c.id, label: c.title }))
      : [];

  const load = useCallback(async (type: ItemType, id: string) => {
    if (!id) { setPrices([]); return; }
    setLoading(true); setErr('');
    try { setPrices(await adminGetPrices(type, id)); }
    catch (e: any) { setErr(e?.message ?? 'Could not load prices'); setPrices([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(itemType, itemId); }, [load, itemType, itemId]);

  /* PUT is an upsert keyed on (itemType, itemId, currency) — editing an amount
     and adding a currency are the same call. */
  async function upsert(currency: string, amount: number) {
    const saved = await adminUpsertPrice({ itemType, itemId, currency, amount });
    setPrices(ps => {
      const without = ps.filter(p => p.currency !== currency);
      return [...without, saved];
    });
  }

  async function saveEdit(p: ProductPrice) {
    await upsert(p.currency, Number(editVal)).catch(() => {});
    setEditing(null);
  }
  async function doDelete(id: string) {
    await adminDeletePrice(id).catch(() => {}); setPrices(ps => ps.filter(p => p.id !== id));
  }
  async function addPrice() {
    await upsert(addForm.currency, Number(addForm.amount)).catch(() => {});
    setShowAdd(false); setAddForm({ currency: 'USD', amount: '' });
  }

  return (
    <div>
      {loading && <ColdBanner msg="Loading prices from backend…" />}
      {err     && <ErrBanner msg={err} onRetry={() => load(itemType, itemId)} />}
      <SectionHeader
        title={`Regional Prices (${prices.length})`}
        action={<Btn onClick={() => setShowAdd(true)} disabled={!itemId}><Plus size={14} /> Add Currency</Btn>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
        <Field label="Item Type">
          <select style={inp} value={itemType} onChange={e => { setItemType(e.target.value as ItemType); setItemId(''); }}>
            <option value="course">Course</option>
            <option value="exam_product">Exam Product</option>
            <option value="exam_voucher">Exam Voucher</option>
          </select>
        </Field>
        <Field label="Item">
          {options.length > 0 ? (
            <select style={inp} value={itemId} onChange={e => setItemId(e.target.value)}>
              <option value="">Select an item…</option>
              {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          ) : (
            <input style={inp} placeholder="Item UUID" value={itemId} onChange={e => setItemId(e.target.value)} />
          )}
        </Field>
      </div>

      <TblWrap>
        <thead><tr><Th>Currency</Th><Th>Amount</Th><Th>Was</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {prices.length === 0 && !loading && (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>
              {itemId ? 'No regional prices — this item falls back to its NGN base price.' : 'Pick an item to see its regional prices.'}
            </td></tr>
          )}
          {prices.map(p => (
            <tr key={p.id}>
              <Td>{p.currency}</Td>
              <Td>{editing === p.id ? <input style={{ ...inp, width: 120, display: 'inline-block' }} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus /> : p.amount.toLocaleString()}</Td>
              <Td>{p.originalAmount != null ? formatPrice(p.originalAmount, p.currency) : '—'}</Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editing === p.id
                    ? <Btn size="sm" onClick={() => saveEdit(p)}><CheckCircle2 size={12} /></Btn>
                    : <Btn size="sm" variant="ghost" onClick={() => { setEditing(p.id); setEditVal(p.amount.toString()); }}><Edit2 size={12} /></Btn>}
                  <Btn size="sm" variant="danger" onClick={() => doDelete(p.id)}><Trash2 size={12} /></Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
      {showAdd && (
        <Modal title="Add / Update Currency Price" onClose={() => setShowAdd(false)}>
          <Field label="Currency">
            <select style={inp} value={addForm.currency} onChange={e => setAddForm(f => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount"><input style={inp} type="number" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} /></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addPrice}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ModulesSection() {
  const { data: courses, slow: cSlow } = useLive(adminGetCourses, [] as AdminCourse[]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState<AdminModuleWithLessons[]>([]);
  const [newMod, setNewMod]   = useState('');
  const [newLessons, setNewLessons] = useState<Record<string, string>>({});
  const [openMods, setOpenMods]     = useState<Set<string>>(new Set());
  const [outlineErr, setOutlineErr] = useState('');

  /* Load the saved outline when a course is picked — modules and lessons are
     nested inside GET /admin/courses/:id. */
  useEffect(() => {
    if (!selectedCourse) { setModules([]); return; }
    let cancelled = false;
    setOutlineErr('');
    adminGetCourseOutline(selectedCourse)
      .then(ms => { if (!cancelled) setModules(ms); })
      .catch((e: any) => { if (!cancelled) { setModules([]); setOutlineErr(e?.message ?? 'Could not load modules'); } });
    return () => { cancelled = true; };
  }, [selectedCourse]);

  async function addModule() {
    if (!selectedCourse || !newMod.trim()) return;
    try {
      const mod = await adminAddModule(selectedCourse, { title: newMod, order: modules.length });
      setModules(ms => [...ms, { ...mod, lessons: [] }]); setNewMod('');
    } catch (e: any) { setOutlineErr(e?.message ?? 'Could not add module'); }
  }

  async function addLesson(moduleId: string) {
    const title = newLessons[moduleId]; if (!title?.trim()) return;
    const target = modules.find(m => m.id === moduleId);
    try {
      const lesson = await adminAddLesson(moduleId, { title, order: target?.lessons.length ?? 0 });
      setModules(ms => ms.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m));
      setNewLessons(n => ({ ...n, [moduleId]: '' }));
    } catch (e: any) { setOutlineErr(e?.message ?? 'Could not add lesson'); }
  }

  return (
    <div>
      {cSlow && <ColdBanner msg="Loading courses…" />}
      {outlineErr && <ErrBanner msg={outlineErr} />}
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
                  <span style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 600 }}>
                    {mod.title}
                    <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, marginLeft: 8, fontSize: '0.8rem' }}>
                      {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                    </span>
                  </span>
                  {isOpen ? <ChevronUp size={15} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    {mod.lessons.map((l, li) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.83rem' }}>
                        <span style={{ opacity: 0.6, minWidth: 18 }}>{li + 1}.</span> {l.title}
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: mod.lessons.length ? 10 : 0 }}>
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

/* An exam *product* is the sellable bundle; questions and attempts belong to
   an exam *form* underneath it. Picking a product therefore loads its forms,
   and the question bank is scoped to whichever form is selected. */
function ExamsSection() {
  const { data: exams, setData: setExams, slow, err, reload } = useLive(adminGetExams, [] as AdminExamProduct[]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forms, setForms]               = useState<ExamForm[]>([]);
  const [selectedForm, setSelectedForm]  = useState('');
  const [questions, setQuestions]       = useState<AdminQuestion[]>([]);
  const [showCreate, setShowCreate]     = useState(false);
  const [showImport, setShowImport]     = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newExam, setNewExam]           = useState({ title: '', questions: '', duration: '', price: '' });
  const [newForm, setNewForm]           = useState({ title: '', durationMinutes: '90', isFreeDemo: false });
  const [csvText, setCsvText]           = useState('');
  const [newQ, setNewQ]                 = useState({ text: '', options: ['','','',''], correctIndex: 0 });

  async function createExam() {
    const e = await adminCreateExam({ title: newExam.title, questions: Number(newExam.questions), duration: Number(newExam.duration), price: Number(newExam.price) });
    setExams(es => [...es, e]); setShowCreate(false); setNewExam({ title: '', questions: '', duration: '', price: '' });
  }
  async function togglePublishExam(ex: AdminExamProduct) {
    const updated = await adminPublishExam(ex.id, !ex.published).catch(() => ({ ...ex, published: !ex.published }));
    setExams(es => es.map(e => e.id === ex.id ? updated : e));
  }

  /* GET /admin/exam-products/:id → { …product, exams, topics } */
  async function loadForms(productId: string) {
    setSelectedProduct(productId); setSelectedForm(''); setQuestions([]);
    const detail = await adminGetExamProduct(productId).catch(() => null);
    const list = detail?.exams ?? [];
    setForms(list);
    if (list.length === 1) void selectForm(list[0].id);
  }

  async function selectForm(formId: string) {
    setSelectedForm(formId);
    adminGetQuestions(formId).then(setQuestions).catch(() => setQuestions([]));
  }

  async function addForm() {
    if (!selectedProduct || !newForm.title.trim()) return;
    const f = await adminAddExamForm(selectedProduct, {
      title: newForm.title,
      durationMinutes: Number(newForm.durationMinutes) || 90,
      isFreeDemo: newForm.isFreeDemo,
      isPublished: true,
    });
    setForms(fs => [...fs, f]); setShowAddForm(false); setNewForm({ title: '', durationMinutes: '90', isFreeDemo: false });
    void selectForm(f.id);
  }

  async function addQuestion() {
    if (!selectedForm || !newQ.text.trim()) return;
    const q = await adminCreateQuestion({ examId: selectedForm, text: newQ.text, options: newQ.options, correctIndex: newQ.correctIndex });
    setQuestions(qs => [...qs, q]); setNewQ({ text: '', options: ['','','',''], correctIndex: 0 });
  }
  async function importCsv() {
    if (!selectedForm) return;
    const r = await adminImportQuestions(selectedForm, csvText).catch(() => ({ imported: 0 }));
    alert(`Imported ${r.imported} questions`); setShowImport(false); setCsvText('');
    adminGetQuestions(selectedForm).then(setQuestions).catch(() => {});
  }

  return (
    <div>
      {slow && <ColdBanner msg="Loading exams from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Exam Products (${exams.length})`} action={<Btn onClick={() => setShowCreate(true)}><Plus size={14} /> New Exam</Btn>} />
      <TblWrap>
        <thead><tr><Th>Title</Th><Th>Questions</Th><Th>Duration</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {exams.length === 0 && !slow && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No exams yet.</td></tr>
          )}
          {exams.map(ex => (
            <tr key={ex.id}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{ex.title}</span></Td>
              <Td>{ex.questions}</Td><Td>{ex.duration} min</Td><Td>{formatPrice(ex.price, ex.currency)}</Td>
              <Td><Badge status={ex.published ? 'published' : 'draft'} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => loadForms(ex.id)}>Exam Forms</Btn>
                  <Btn size="sm" variant={ex.published ? 'danger' : 'outline'} onClick={() => togglePublishExam(ex)}>
                    {ex.published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>

      {selectedProduct && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>Exam Forms ({forms.length})</h3>
            <Btn size="sm" variant="ghost" onClick={() => setShowAddForm(true)}><Plus size={12} /> New Form</Btn>
          </div>
          {forms.length === 0 ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>
              This product has no exam forms yet. Add one before importing questions — attempts are started against a form.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {forms.map(f => (
                <Btn key={f.id} size="sm" variant={selectedForm === f.id ? undefined : 'ghost'} onClick={() => selectForm(f.id)}>
                  {f.title}{f.isFreeDemo ? ' · free demo' : ''}
                </Btn>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedForm && (
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
            {/* New products are priced in the platform base currency (NGN); regional
                prices are set afterward from the Prices section. */}
            <Field label="Base Price (NGN)"><input style={inp} type="number" value={newExam.price} onChange={e => setNewExam(f => ({ ...f, price: e.target.value }))} /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn onClick={createExam}>Create</Btn>
          </div>
        </Modal>
      )}
      {showAddForm && (
        <Modal title="New Exam Form" onClose={() => setShowAddForm(false)}>
          <Field label="Title"><input style={inp} value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Practice Test 1" /></Field>
          <Field label="Duration (min)"><input style={inp} type="number" value={newForm.durationMinutes} onChange={e => setNewForm(f => ({ ...f, durationMinutes: e.target.value }))} /></Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.82rem', marginBottom: 8 }}>
            <input type="checkbox" checked={newForm.isFreeDemo} onChange={e => setNewForm(f => ({ ...f, isFreeDemo: e.target.checked }))} />
            Free demo — this is the form "Try Free" starts on the public site
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Btn>
            <Btn onClick={addForm}>Create</Btn>
          </div>
        </Modal>
      )}
      {showImport && (
        <Modal title="Import Questions (CSV)" onClose={() => setShowImport(false)}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', fontFamily: 'var(--ace-font)', marginBottom: 12 }}>
            Header row required. Columns: <code style={{ background: 'var(--muted)', padding: '1px 6px', borderRadius: 4 }}>text, explanation, topic, difficulty, optionA, optionB, optionC, optionD, correct</code> — where <code>correct</code> is the letter (A–D) or 1-based index.
          </p>
          <Field label="CSV Content"><textarea style={{ ...inp, height: 160, resize: 'vertical' }} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"text,explanation,topic,difficulty,optionA,optionB,optionC,optionD,correct\nHow many bits in a byte?,A byte is 8 bits.,Fundamentals,Beginner,4,8,16,32,B"} /></Field>
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
  const { data: users, slow, err, reload } = useLive(() => adminGetUsers(), [] as AdminUser[]);

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
            <tr key={u.id}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{u.fullName ?? u.name ?? '—'}</span></Td>
              <Td>{u.email}</Td>
              <Td><Badge status={u.role === 'admin' ? 'published' : 'pending'} /></Td>
              <Td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function OrdersSection() {
  const { data, slow, err, reload } = useLive(() => adminGetOrdersList(), [] as AdminOrder[]);

  /* Orders can be in different currencies (geo-priced) — grouping by currency
     rather than summing keeps a mixed batch from producing a meaningless
     total. */
  const revenueByCurrency = data.reduce<Record<string, number>>((acc, o) => {
    const c = o.currency ?? 'NGN';
    acc[c] = (acc[c] ?? 0) + (o.total ?? 0);
    return acc;
  }, {});
  const paid = data.filter(o => ['completed', 'success', 'paid'].includes((o.status ?? '').toLowerCase())).length;

  return (
    <div>
      {slow && <ColdBanner msg="Loading orders from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={data.length.toLocaleString()}     color="var(--ace-brand)" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Paid Orders"  value={paid.toLocaleString()}            color="#22c55e" />
        <StatCard icon={<DollarSign size={22} />}   label="Gross Value"
          value={Object.entries(revenueByCurrency).map(([c, v]) => formatPrice(v, c)).join(' · ') || formatPrice(0, 'NGN')}
          color="#fb923c" />
      </div>

      <SectionHeader title={`Orders (${data.length})`} action={<Btn variant="ghost" size="sm" onClick={reload}><RefreshCw size={12} /> Refresh</Btn>} />
      <TblWrap>
        <thead><tr><Th>Order ID</Th><Th>User</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No orders yet.</td></tr>}
          {data.map(o => (
            <tr key={o.id}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id}</span></Td>
              <Td>{o.userId}</Td><Td>{formatPrice(o.total, o.currency)}</Td>
              <Td><Badge status={o.status} /></Td><Td>{o.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function PaymentsSection() {
  const { data, slow, err, reload } = useLive(() => adminGetPayments().then(r => r.payments), [] as AdminPayment[]);
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
            <tr key={p.id}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.id}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.orderId}</span></Td>
              <Td>{formatPrice(p.amount, p.currency)}</Td><Td>{p.method}</Td>
              <Td><Badge status={p.status} /></Td><Td>{p.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

/* Mirrors the backend's LeadStatus enum. */
const LEAD_STATUSES = ['new', 'in_review', 'contacted', 'accepted', 'rejected', 'archived'];

function LeadsSection() {
  const { data, setData, slow, err, reload } = useLive(() => adminGetLeads().then(r => r.leads), [] as AdminLead[]);

  /* PATCH /admin/leads/:id — optimistic; the row reverts on failure. */
  async function setStatus(lead: AdminLead, status: string) {
    const previous = lead.status;
    setData(ls => ls.map(l => l.id === lead.id ? { ...l, status } : l));
    await adminUpdateLeadStatus(lead.id, status).catch(() => {
      setData(ls => ls.map(l => l.id === lead.id ? { ...l, status: previous } : l));
    });
  }

  return (
    <div>
      {slow && <ColdBanner msg="Loading leads from backend…" />}
      {err  && <ErrBanner msg={err} onRetry={reload} />}
      <SectionHeader title={`Leads (${data.length})`} />
      <TblWrap>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Type</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {data.length === 0 && !slow && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem' }}>No leads yet.</td></tr>}
          {data.map(l => (
            <tr key={l.id}>
              <Td><span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{l.name}</span></Td>
              <Td>{l.email}</Td><Td>{l.phone ?? '—'}</Td><Td>{l.type ?? l.source ?? '—'}</Td>
              <Td>
                <select
                  style={{ ...inp, width: 130, padding: '5px 8px', fontSize: '0.78rem' }}
                  value={l.status ?? 'new'}
                  onChange={e => setStatus(l, e.target.value)}
                >
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </Td>
              <Td>{l.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TblWrap>
    </div>
  );
}

function AuditSection() {
  const { data, slow, err, reload } = useLive(() => adminGetAuditLogs().then(r => r.logs), [] as AdminAuditLog[]);
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
            <tr key={l.id}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{new Date(l.createdAt).toLocaleString()}</span></Td>
              <Td>{l.userId}</Td>
              <Td><span style={{ color: 'var(--ace-brand)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.action}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.resource}</span></Td>
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

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    overview:  <OverviewSection />,
    courses:   <CoursesSection />,
    prices:    <PricesSection />,
    modules:   <ModulesSection />,
    exams:     <ExamsSection />,
    orders:    <OrdersSection />,
    users:     <UsersSection />,
    payments:  <PaymentsSection />,
    leads:     <LeadsSection />,
    audit:     <AuditSection />,
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
