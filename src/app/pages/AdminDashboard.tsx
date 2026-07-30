import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, BookOpen, DollarSign, Layers, ClipboardList,
  ShoppingCart, CreditCard, Users, FileText, LogOut, Menu, X,
  Plus, Edit2, Trash2, Upload, Eye, EyeOff, ChevronDown, ChevronUp,
  TrendingUp, Package, Wifi, AlertCircle, CheckCircle2, Save,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  adminGetStats, adminGetCourses, adminCreateCourse, adminUpdateCourse,
  adminPublishCourse, adminUploadImage, adminGetPrices, adminUpdatePrice,
  adminAddPrice, adminDeletePrice, adminGetExams, adminCreateExam,
  adminPublishExam, adminGetQuestions, adminCreateQuestion, adminImportQuestions,
  adminGetOrders, adminGetPayments, adminGetLeads, adminGetAuditLogs,
  adminAddModule, adminAddLesson,
  getStoredToken, storeToken, clearToken, apiLogin,
} from '../lib/api';
import type {
  AdminStats, AdminCourse, ProductPrice, AdminExamProduct, AdminQuestion,
  AdminOrder, AdminPayment, AdminLead, AdminAuditLog, AdminModule, AdminLesson,
} from '../lib/api';

type Section = 'overview' | 'courses' | 'prices' | 'modules' | 'exams' | 'orders' | 'payments' | 'leads' | 'audit';

/* ── mock data ────────────────────────────────────────────────────────────── */
const MOCK_STATS: AdminStats = {
  totalRevenue: 4_820_000, totalOrders: 214, totalStudents: 1_840, totalCourses: 38,
  revenueByMonth: [
    { month: 'Jan', revenue: 320000 }, { month: 'Feb', revenue: 410000 },
    { month: 'Mar', revenue: 380000 }, { month: 'Apr', revenue: 520000 },
    { month: 'May', revenue: 470000 }, { month: 'Jun', revenue: 610000 },
    { month: 'Jul', revenue: 590000 }, { month: 'Aug', revenue: 720000 },
    { month: 'Sep', revenue: 680000 }, { month: 'Oct', revenue: 810000 },
    { month: 'Nov', revenue: 920000 }, { month: 'Dec', revenue: 1040000 },
  ],
  ordersByStatus: [
    { status: 'completed', count: 167 }, { status: 'pending', count: 31 },
    { status: 'failed', count: 16 },
  ],
};

const MOCK_COURSES: AdminCourse[] = [
  { id: '1', title: 'CompTIA Security+ SY0-701', description: 'Comprehensive Security+ prep', category: 'CompTIA', level: 'Intermediate', format: 'online', price: 85000, published: true, slug: 'comptia-security-plus' },
  { id: '2', title: 'CCNA 200-301 Cisco Bootcamp', description: 'Cisco networking fundamentals', category: 'Cisco', level: 'Beginner', format: 'bootcamp', price: 120000, published: true, slug: 'ccna-200-301' },
  { id: '3', title: 'AWS Solutions Architect Associate', description: 'Amazon cloud platform mastery', category: 'AWS', level: 'Intermediate', format: 'online', price: 95000, published: false, slug: 'aws-saa' },
];

const MOCK_PRICES: ProductPrice[] = [
  { id: 'p1', courseId: '1', region: 'NG', currency: 'NGN', amount: 85000 },
  { id: 'p2', courseId: '1', region: 'US', currency: 'USD', amount: 59 },
  { id: 'p3', courseId: '2', region: 'NG', currency: 'NGN', amount: 120000 },
  { id: 'p4', courseId: '3', region: 'NG', currency: 'NGN', amount: 95000 },
];

const MOCK_EXAMS: AdminExamProduct[] = [
  { id: 'e1', title: 'CompTIA Security+ Practice Exam', questions: 90, duration: 90, price: 12000, published: true },
  { id: 'e2', title: 'CCNA 200-301 Practice Exam', questions: 60, duration: 75, price: 10000, published: true },
  { id: 'e3', title: 'AWS SAA Practice Exam', questions: 65, duration: 80, price: 11000, published: false },
];

const MOCK_ORDERS: AdminOrder[] = [
  { id: 'ord-001', userId: 'u1', total: 85000, status: 'completed', createdAt: '2025-07-10', items: [{ courseId: '1', price: 85000 }] },
  { id: 'ord-002', userId: 'u2', total: 120000, status: 'pending', createdAt: '2025-07-12', items: [{ courseId: '2', price: 120000 }] },
  { id: 'ord-003', userId: 'u3', total: 95000, status: 'completed', createdAt: '2025-07-15', items: [{ courseId: '3', price: 95000 }] },
];

const MOCK_PAYMENTS: AdminPayment[] = [
  { id: 'pay-001', orderId: 'ord-001', amount: 85000, method: 'paystack', status: 'success', createdAt: '2025-07-10', reference: 'PST-abc123' },
  { id: 'pay-002', orderId: 'ord-002', amount: 120000, method: 'flutterwave', status: 'pending', createdAt: '2025-07-12' },
];

const MOCK_LEADS: AdminLead[] = [
  { id: 'l1', name: 'Chidi Okafor', email: 'chidi@example.com', phone: '+234-801-234-5678', source: 'landing_page', createdAt: '2025-07-08' },
  { id: 'l2', name: 'Amara Nwosu', email: 'amara@example.com', source: 'referral', createdAt: '2025-07-11' },
  { id: 'l3', name: 'Tunde Adeyemi', email: 'tunde@example.com', phone: '+234-812-345-6789', source: 'google_ads', createdAt: '2025-07-14' },
];

const MOCK_LOGS: AdminAuditLog[] = [
  { id: 'log1', userId: 'admin', action: 'PUBLISH_COURSE', resource: 'course/1', createdAt: '2025-07-10T09:14:22Z' },
  { id: 'log2', userId: 'admin', action: 'UPDATE_PRICE', resource: 'price/p2', createdAt: '2025-07-11T11:32:08Z' },
  { id: 'log3', userId: 'admin', action: 'CREATE_EXAM', resource: 'exam/e3', createdAt: '2025-07-13T14:55:44Z' },
];

/* ── shared UI ────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, fontFamily: 'var(--ace-font)',
  background: 'var(--muted)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
};

function SlowBanner() {
  return (
    <div style={{ background: 'rgba(0,199,163,0.1)', border: '1px solid var(--ace-brand)', borderRadius: 8, color: 'var(--ace-brand)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--ace-font)', fontSize: '0.82rem' }}>
      <Wifi size={14} className="animate-pulse" /> Connecting to server — server may be waking up…
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, fontSize: '1.3rem' }}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    success: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    published: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    draft: { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
  };
  const s = map[status.toLowerCase()] ?? map.draft;
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--ace-font)' }}>{status}</span>;
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table></div>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: '11px 14px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', fontWeight: 600, background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '11px 14px', color: 'var(--text-secondary)', fontSize: '0.83rem', fontFamily: 'var(--ace-font)', borderBottom: '1px solid var(--border)' }}>{children}</td>;
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, fontSize: '1.15rem' }}>{title}</h2>
      {action}
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'outline'; size?: 'sm' | 'md'; disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--ace-brand)', color: '#fff' },
    ghost: { background: 'var(--muted)', color: 'var(--text-secondary)' },
    danger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
    outline: { background: 'transparent', color: 'var(--ace-brand)', border: '1px solid var(--ace-brand)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: size === 'sm' ? '5px 12px' : '8px 16px',
      borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--ace-font)', fontSize: size === 'sm' ? '0.78rem' : '0.875rem', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 540, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--ace-font)', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

/* ── sections ─────────────────────────────────────────────────────────────── */

function OverviewSection() {
  const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 2500);
    adminGetStats()
      .then(s => setStats(s))
      .catch(() => {})
      .finally(() => { clearTimeout(t); setSlow(false); });
  }, []);

  return (
    <div>
      {slow && <SlowBanner />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign size={22} />} label="Total Revenue" value={`₦${(stats.totalRevenue / 1000).toFixed(0)}K`} color="#22c55e" />
        <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={stats.totalOrders.toString()} color="var(--ace-brand)" />
        <StatCard icon={<Users size={22} />} label="Students" value={stats.totalStudents.toLocaleString()} color="#a78bfa" />
        <StatCard icon={<BookOpen size={22} />} label="Courses" value={stats.totalCourses.toString()} color="#fb923c" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.revenueByMonth}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ace-brand)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--ace-brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--ace-font)' }} formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="var(--ace-brand)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700, marginBottom: 16 }}>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--ace-font)' }} />
              <Bar dataKey="count" fill="var(--ace-brand)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CoursesSection() {
  const [courses, setCourses] = useState<AdminCourse[]>(MOCK_COURSES);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', level: 'Intermediate', format: 'online', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminGetCourses().then(setCourses).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', category: '', level: 'Intermediate', format: 'online', price: '' });
    setShowModal(true);
  }
  function openEdit(c: AdminCourse) {
    setEditing(c);
    setForm({ title: c.title, description: c.description, category: c.category ?? '', level: c.level ?? 'Intermediate', format: c.format ?? 'online', price: c.price?.toString() ?? '' });
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const r = await adminUploadImage(imageFile).catch(() => ({ url: '' }));
        imageUrl = r.url;
      }
      const payload = { title: form.title, description: form.description, category: form.category, level: form.level, format: form.format, price: Number(form.price), ...(imageUrl ? { image: imageUrl } : {}) };
      if (editing) {
        const updated = await adminUpdateCourse(editing.id, payload).catch(() => ({ ...editing, ...payload }));
        setCourses(cs => cs.map(c => c.id === editing.id ? updated : c));
      } else {
        const created = await adminCreateCourse(payload).catch(() => ({ id: Date.now().toString(), ...payload, published: false } as AdminCourse));
        setCourses(cs => [...cs, created]);
      }
      setShowModal(false);
    } finally { setSaving(false); }
  }

  async function togglePublish(c: AdminCourse) {
    const updated = await adminPublishCourse(c.id, !c.published).catch(() => ({ ...c, published: !c.published }));
    setCourses(cs => cs.map(x => x.id === c.id ? updated : x));
  }

  return (
    <div>
      <SectionHeader title={`Courses (${courses.length})`} action={<Btn onClick={openCreate}><Plus size={14} /> New Course</Btn>} />
      <TableWrap>
        <thead><tr>
          <Th>Title</Th><Th>Category</Th><Th>Level</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th>
        </tr></thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id}>
              <Td><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.title}</span></Td>
              <Td>{c.category}</Td>
              <Td>{c.level}</Td>
              <Td>₦{(c.price ?? 0).toLocaleString()}</Td>
              <Td><Badge status={c.published ? 'published' : 'draft'} /></Td>
              <Td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit2 size={12} /></Btn>
                  <Btn size="sm" variant={c.published ? 'danger' : 'outline'} onClick={() => togglePublish(c)}>
                    {c.published ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Btn>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      {showModal && (
        <Modal title={editing ? 'Edit Course' : 'New Course'} onClose={() => setShowModal(false)}>
          <Field label="Title"><input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Course title" /></Field>
          <Field label="Description"><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="CompTIA, AWS…" /></Field>
            <Field label="Price (₦)"><input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level">
              <select style={inputStyle} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {['Beginner', 'Intermediate', 'Advanced'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Format">
              <select style={inputStyle} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                {['online', 'bootcamp', 'hybrid'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Cover Image (optional)">
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
  const [prices, setPrices] = useState<ProductPrice[]>(MOCK_PRICES);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ courseId: '', region: 'NG', currency: 'NGN', amount: '' });

  useEffect(() => { adminGetPrices().then(setPrices).catch(() => {}); }, []);

  async function saveEdit(p: ProductPrice) {
    const updated = await adminUpdatePrice(p.id, Number(editVal)).catch(() => ({ ...p, amount: Number(editVal) }));
    setPrices(ps => ps.map(x => x.id === p.id ? updated : x));
    setEditing(null);
  }

  async function doDelete(id: string) {
    await adminDeletePrice(id).catch(() => {});
    setPrices(ps => ps.filter(p => p.id !== id));
  }

  async function addPrice() {
    const created = await adminAddPrice({ ...addForm, amount: Number(addForm.amount) }).catch(() => ({ id: Date.now().toString(), ...addForm, amount: Number(addForm.amount) } as ProductPrice));
    setPrices(ps => [...ps, created]);
    setShowAdd(false);
    setAddForm({ courseId: '', region: 'NG', currency: 'NGN', amount: '' });
  }

  return (
    <div>
      <SectionHeader title={`Product Prices (${prices.length})`} action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Price</Btn>} />
      <TableWrap>
        <thead><tr><Th>Course ID</Th><Th>Region</Th><Th>Currency</Th><Th>Amount</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {prices.map(p => (
            <tr key={p.id}>
              <Td>{p.courseId}</Td>
              <Td>{p.region}</Td>
              <Td>{p.currency}</Td>
              <Td>
                {editing === p.id
                  ? <input style={{ ...inputStyle, width: 120, display: 'inline-block' }} value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus />
                  : p.amount.toLocaleString()}
              </Td>
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
      </TableWrap>

      {showAdd && (
        <Modal title="Add Price" onClose={() => setShowAdd(false)}>
          <Field label="Course ID"><input style={inputStyle} value={addForm.courseId} onChange={e => setAddForm(f => ({ ...f, courseId: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region"><input style={inputStyle} value={addForm.region} onChange={e => setAddForm(f => ({ ...f, region: e.target.value }))} /></Field>
            <Field label="Currency"><input style={inputStyle} value={addForm.currency} onChange={e => setAddForm(f => ({ ...f, currency: e.target.value }))} /></Field>
          </div>
          <Field label="Amount"><input style={inputStyle} type="number" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} /></Field>
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
  const [courses, setCourses] = useState<AdminCourse[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [newMod, setNewMod] = useState('');
  const [newLessons, setNewLessons] = useState<Record<string, string>>({});
  const [openMods, setOpenMods] = useState<Set<string>>(new Set());

  useEffect(() => { adminGetCourses().then(setCourses).catch(() => {}); }, []);

  async function addModule() {
    if (!selectedCourse || !newMod.trim()) return;
    const mod = await adminAddModule(selectedCourse, { title: newMod, order: modules.length }).catch(() => ({ id: Date.now().toString(), courseId: selectedCourse, title: newMod, order: modules.length } as AdminModule));
    setModules(ms => [...ms, mod]);
    setNewMod('');
  }

  async function addLesson(moduleId: string) {
    const title = newLessons[moduleId];
    if (!title?.trim()) return;
    await adminAddLesson(moduleId, { title, type: 'video', order: 0 }).catch(() => {});
    setNewLessons(n => ({ ...n, [moduleId]: '' }));
  }

  return (
    <div>
      <SectionHeader title="Modules & Lessons" />
      <div style={{ marginBottom: 20 }}>
        <Field label="Select Course">
          <select style={inputStyle} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">-- choose course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
      </div>

      {selectedCourse && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={newMod} onChange={e => setNewMod(e.target.value)} placeholder="New module title…" />
            <Btn onClick={addModule}><Plus size={14} /> Add Module</Btn>
          </div>

          {modules.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem', padding: '24px 0', textAlign: 'center' }}>
              No modules yet. Add the first module above.
            </div>
          )}

          {modules.map(mod => {
            const isOpen = openMods.has(mod.id);
            return (
              <div key={mod.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10 }}>
                <button style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setOpenMods(s => { const n = new Set(s); n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id); return n; })}>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 600 }}>{mod.title}</span>
                  {isOpen ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={{ ...inputStyle, flex: 1 }} value={newLessons[mod.id] ?? ''} onChange={e => setNewLessons(n => ({ ...n, [mod.id]: e.target.value }))} placeholder="New lesson title…" />
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
  const [exams, setExams] = useState<AdminExamProduct[]>(MOCK_EXAMS);
  const [selectedExam, setSelectedExam] = useState('');
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', questions: '', duration: '', price: '' });
  const [csvText, setCsvText] = useState('');
  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correctIndex: 0 });

  useEffect(() => { adminGetExams().then(setExams).catch(() => {}); }, []);

  async function createExam() {
    const e = await adminCreateExam({ title: newExam.title, questions: Number(newExam.questions), duration: Number(newExam.duration), price: Number(newExam.price) }).catch(() => ({ id: Date.now().toString(), ...newExam, questions: Number(newExam.questions), duration: Number(newExam.duration), price: Number(newExam.price), published: false } as AdminExamProduct));
    setExams(es => [...es, e]);
    setShowCreate(false);
  }

  async function togglePublishExam(ex: AdminExamProduct) {
    const updated = await adminPublishExam(ex.id, !ex.published).catch(() => ({ ...ex, published: !ex.published }));
    setExams(es => es.map(e => e.id === ex.id ? updated : e));
  }

  async function loadQuestions(examId: string) {
    setSelectedExam(examId);
    adminGetQuestions(examId).then(setQuestions).catch(() => setQuestions([]));
  }

  async function addQuestion() {
    if (!selectedExam || !newQ.text.trim()) return;
    const q = await adminCreateQuestion({ examId: selectedExam, text: newQ.text, options: newQ.options, correctIndex: newQ.correctIndex }).catch(() => ({ id: Date.now().toString(), examId: selectedExam, ...newQ } as AdminQuestion));
    setQuestions(qs => [...qs, q]);
    setNewQ({ text: '', options: ['', '', '', ''], correctIndex: 0 });
  }

  async function importCsv() {
    if (!selectedExam) return;
    const r = await adminImportQuestions(selectedExam, csvText).catch(() => ({ imported: 0 }));
    alert(`Imported ${r.imported} questions`);
    setShowImport(false);
    setCsvText('');
    adminGetQuestions(selectedExam).then(setQuestions).catch(() => {});
  }

  return (
    <div>
      <SectionHeader title={`Exams (${exams.length})`} action={<Btn onClick={() => setShowCreate(true)}><Plus size={14} /> New Exam</Btn>} />
      <TableWrap>
        <thead><tr><Th>Title</Th><Th>Questions</Th><Th>Duration</Th><Th>Price</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {exams.map(ex => (
            <tr key={ex.id}>
              <Td><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ex.title}</span></Td>
              <Td>{ex.questions}</Td>
              <Td>{ex.duration} min</Td>
              <Td>₦{ex.price.toLocaleString()}</Td>
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
      </TableWrap>

      {selectedExam && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontWeight: 700 }}>Question Bank ({questions.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" variant="ghost" onClick={() => setShowImport(true)}><Upload size={12} /> CSV Import</Btn>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <Field label="Question Text">
              <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} placeholder="Enter question…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              {newQ.options.map((opt, i) => (
                <Field key={i} label={`Option ${i + 1}${newQ.correctIndex === i ? ' ✓' : ''}`}>
                  <input style={{ ...inputStyle, borderColor: newQ.correctIndex === i ? 'var(--ace-brand)' : undefined }}
                    value={opt} onChange={e => setNewQ(q => { const o = [...q.options]; o[i] = e.target.value; return { ...q, options: o }; })}
                    onClick={() => setNewQ(q => ({ ...q, correctIndex: i }))} />
                </Field>
              ))}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--ace-font)', marginBottom: 10 }}>Click an option field to mark it as correct</div>
            <Btn onClick={addQuestion}><Plus size={13} /> Add Question</Btn>
          </div>

          {questions.map((q, i) => (
            <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--ace-font)', fontSize: '0.85rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>{i + 1}.</span> {q.text}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {q.options.map((o, oi) => (
                  <div key={oi} style={{ fontSize: '0.78rem', color: oi === q.correctIndex ? 'var(--ace-brand)' : 'var(--text-muted)', fontFamily: 'var(--ace-font)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
          <Field label="Title"><input style={inputStyle} value={newExam.title} onChange={e => setNewExam(f => ({ ...f, title: e.target.value }))} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Questions"><input style={inputStyle} type="number" value={newExam.questions} onChange={e => setNewExam(f => ({ ...f, questions: e.target.value }))} /></Field>
            <Field label="Duration (min)"><input style={inputStyle} type="number" value={newExam.duration} onChange={e => setNewExam(f => ({ ...f, duration: e.target.value }))} /></Field>
            <Field label="Price (₦)"><input style={inputStyle} type="number" value={newExam.price} onChange={e => setNewExam(f => ({ ...f, price: e.target.value }))} /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn onClick={createExam}>Create</Btn>
          </div>
        </Modal>
      )}

      {showImport && (
        <Modal title="Import Questions via CSV" onClose={() => setShowImport(false)}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--ace-font)', marginBottom: 12 }}>
            Format: <code>question,option1,option2,option3,option4,correctIndex</code>
          </p>
          <Field label="CSV Content">
            <textarea style={{ ...inputStyle, height: 160, resize: 'vertical' }} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"How many bits in a byte?,4,8,16,32,1\n..."} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowImport(false)}>Cancel</Btn>
            <Btn onClick={importCsv}><Upload size={13} /> Import</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function OrdersSection() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ORDERS);
  useEffect(() => { adminGetOrders().then(r => setOrders(r.orders)).catch(() => {}); }, []);
  return (
    <div>
      <SectionHeader title={`Orders (${orders.length})`} />
      <TableWrap>
        <thead><tr><Th>Order ID</Th><Th>User</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <Td><span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.id}</span></Td>
              <Td>{o.userId}</Td>
              <Td>₦{o.total.toLocaleString()}</Td>
              <Td><Badge status={o.status} /></Td>
              <Td>{o.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

function PaymentsSection() {
  const [payments, setPayments] = useState<AdminPayment[]>(MOCK_PAYMENTS);
  useEffect(() => { adminGetPayments().then(r => setPayments(r.payments)).catch(() => {}); }, []);
  return (
    <div>
      <SectionHeader title={`Payments (${payments.length})`} />
      <TableWrap>
        <thead><tr><Th>Payment ID</Th><Th>Order</Th><Th>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Date</Th></tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.id}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.orderId}</span></Td>
              <Td>₦{p.amount.toLocaleString()}</Td>
              <Td>{p.method}</Td>
              <Td><Badge status={p.status} /></Td>
              <Td>{p.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

function LeadsSection() {
  const [leads, setLeads] = useState<AdminLead[]>(MOCK_LEADS);
  useEffect(() => { adminGetLeads().then(r => setLeads(r.leads)).catch(() => {}); }, []);
  return (
    <div>
      <SectionHeader title={`Leads (${leads.length})`} />
      <TableWrap>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Source</Th><Th>Date</Th></tr></thead>
        <tbody>
          {leads.map(l => (
            <tr key={l.id}>
              <Td><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.name}</span></Td>
              <Td>{l.email}</Td>
              <Td>{l.phone ?? '—'}</Td>
              <Td>{l.source ?? '—'}</Td>
              <Td>{l.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

function AuditSection() {
  const [logs, setLogs] = useState<AdminAuditLog[]>(MOCK_LOGS);
  useEffect(() => { adminGetAuditLogs().then(r => setLogs(r.logs)).catch(() => {}); }, []);
  return (
    <div>
      <SectionHeader title={`Audit Logs (${logs.length})`} />
      <TableWrap>
        <thead><tr><Th>Time</Th><Th>User</Th><Th>Action</Th><Th>Resource</Th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleString()}</span></Td>
              <Td>{l.userId}</Td>
              <Td><span style={{ color: 'var(--ace-brand)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.action}</span></Td>
              <Td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.resource}</span></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

/* ── admin login ────────────────────────────────────────────────────────────── */
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await apiLogin(email, password);
      if (r.user.role !== 'admin') throw new Error('Access denied — admin only');
      storeToken(r.token);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--ace-font)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 40, width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ace-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={18} color="#fff" />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>Acecerty Admin</span>
        </div>

        <form onSubmit={submit}>
          <Field label="Email">
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Password">
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </Field>
          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: 'var(--ace-brand)', color: '#fff', fontFamily: 'var(--ace-font)', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── main dashboard ─────────────────────────────────────────────────────────── */
const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { key: 'courses', label: 'Courses', icon: <BookOpen size={17} /> },
  { key: 'prices', label: 'Prices', icon: <DollarSign size={17} /> },
  { key: 'modules', label: 'Modules', icon: <Layers size={17} /> },
  { key: 'exams', label: 'Exams', icon: <ClipboardList size={17} /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingCart size={17} /> },
  { key: 'payments', label: 'Payments', icon: <CreditCard size={17} /> },
  { key: 'leads', label: 'Leads', icon: <Users size={17} /> },
  { key: 'audit', label: 'Audit Logs', icon: <FileText size={17} /> },
];

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => !!getStoredToken());
  const [section, setSection] = useState<Section>('overview');
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  function logout() { clearToken(); setAuthed(false); }

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    overview: <OverviewSection />,
    courses: <CoursesSection />,
    prices: <PricesSection />,
    modules: <ModulesSection />,
    exams: <ExamsSection />,
    orders: <OrdersSection />,
    payments: <PaymentsSection />,
    leads: <LeadsSection />,
    audit: <AuditSection />,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--ace-font)' }}>
      {/* Sidebar overlay for mobile */}
      {sideOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
          onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 232, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 110,
        transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s',
      }} className="lg:!translate-x-0">
        <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ace-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={15} color="#fff" />
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>Acecerty Admin</span>
          <button onClick={() => setSideOpen(false)} className="lg:hidden ml-auto" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setSection(key); setSideOpen(false); }}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: section === key ? 'rgba(var(--ace-brand-rgb,0,199,163),0.15)' : 'transparent',
                color: section === key ? 'var(--ace-brand)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                fontFamily: 'var(--ace-font)', fontSize: '0.875rem', fontWeight: section === key ? 600 : 400,
                marginBottom: 2,
              }}>
              {icon} {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--ace-font)', fontSize: '0.875rem' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }} className="lg:ml-[232px]">
        {/* Topbar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSideOpen(true)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Menu size={20} />
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--ace-font)' }}>
            {NAV_ITEMS.find(n => n.key === section)?.label}
          </span>
        </div>

        {/* Section content */}
        <div style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
          {SECTION_MAP[section]}
        </div>
      </div>
    </div>
  );
}
