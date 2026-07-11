import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpen, Award, Clock, TrendingUp, Play, CheckCircle2,
  Calendar, Target, ChevronRight, BarChart2, Zap, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Mock data ───────────────────────────────────────────────────── */
const USER = {
  name: 'Ada Okonkwo',
  email: 'ada@example.com',
  avatar: 'AO',
  joinDate: 'Jan 2025',
  streak: 14,
};

const ACTIVE_COURSES = [
  {
    id: 'bc-cissp',
    title: 'CISSP Certification',
    shortTitle: 'CISSP',
    progress: 62,
    totalLessons: 120,
    completedLessons: 74,
    nextLesson: 'Domain 5: Identity & Access Management',
    gradient: 'linear-gradient(135deg,#1a237e,#283593)',
    deadline: '2025-09-15',
    daysLeft: 68,
  },
  {
    id: 'bc-secplus',
    title: 'CompTIA Security+',
    shortTitle: 'Sec+',
    progress: 38,
    totalLessons: 85,
    completedLessons: 32,
    nextLesson: 'Network Security: Protocols & Tools',
    gradient: 'linear-gradient(135deg,#00695c,#00897b)',
    deadline: '2025-10-01',
    daysLeft: 84,
  },
  {
    id: 'bc-aws-saa',
    title: 'AWS Solutions Architect',
    shortTitle: 'AWS SAA',
    progress: 15,
    totalLessons: 96,
    completedLessons: 14,
    nextLesson: 'S3 Storage Classes & Lifecycle Rules',
    gradient: 'linear-gradient(135deg,#e65100,#f57c00)',
    deadline: '2025-11-20',
    daysLeft: 134,
  },
];

const CERTIFICATES = [
  {
    id: 'cert-pmp',
    title: 'PMP® Preparation',
    issueDate: 'May 2025',
    credentialId: 'ACE-2025-PMP-00412',
    gradient: 'linear-gradient(135deg,#4a148c,#6a1b9a)',
  },
  {
    id: 'cert-itil',
    title: 'ITIL® 4 Foundation',
    issueDate: 'Mar 2025',
    credentialId: 'ACE-2025-ITL-00287',
    gradient: 'linear-gradient(135deg,#01579b,#0277bd)',
  },
];

const RECENT_ACTIVITY = [
  { label: 'Completed lesson: Risk Management Frameworks', time: '2h ago', icon: CheckCircle2, color: '#059669' },
  { label: 'Practice exam: CISSP — scored 74%', time: '1d ago', icon: BarChart2, color: 'var(--ace-brand)' },
  { label: 'Started: Domain 4 — Communication & Network Security', time: '2d ago', icon: Play, color: '#6366f1' },
  { label: 'Completed lesson: CIA Triad Deep Dive', time: '3d ago', icon: CheckCircle2, color: '#059669' },
  { label: 'Enrolled in AWS Solutions Architect', time: '5d ago', icon: BookOpen, color: '#f59e0b' },
];

const UPCOMING_DEADLINES = [
  { title: 'CISSP Practice Exam #3', dueDate: 'Jul 14, 2026', type: 'exam', urgent: true },
  { title: 'Security+ Module 4 Quiz', dueDate: 'Jul 18, 2026', type: 'quiz', urgent: false },
  { title: 'CISSP Final Attempt', dueDate: 'Sep 15, 2025', type: 'cert', urgent: false },
];

const EXAM_SCORES = [
  { exam: 'CISSP Mock #1', score: 58, date: 'Jun 20' },
  { exam: 'CISSP Mock #2', score: 67, date: 'Jun 28' },
  { exam: 'CISSP Mock #3', score: 74, date: 'Jul 5' },
  { exam: 'Sec+ Practice', score: 81, date: 'Jul 7' },
];

/* ── Sub-components ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; value: string | number; sub?: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl p-5 bg-card border border-border"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-black mb-0.5 text-foreground">{value}</div>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
    </motion.div>
  );
}

function CourseProgressCard({ course }: {
  course: typeof ACTIVE_COURSES[0];
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="relative rounded-2xl overflow-hidden bg-card border border-border">
      <div className="h-2 w-full" style={{ background: course.gradient }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-black text-base text-foreground">{course.title}</div>
            <div className="text-xs mt-0.5 flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {course.daysLeft} days until target date
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black" style={{ background: `${course.progress >= 70 ? '#059669' : 'var(--ace-brand)'}18`, color: course.progress >= 70 ? '#059669' : 'var(--ace-brand)' }}>
            {course.progress}%
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
            <span>{course.completedLessons} of {course.totalLessons} lessons</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-border">
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: course.gradient }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <div className="text-xs font-semibold truncate text-muted-foreground">Up next:</div>
            <div className="text-xs truncate font-medium text-foreground">{course.nextLesson}</div>
          </div>
          <Link to={`/courses/${course.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
            style={{ background: course.gradient }}>
            <Play className="h-3 w-3" /> Resume
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'certificates'>('overview');

  const totalProgress = Math.round(ACTIVE_COURSES.reduce((s, c) => s + c.progress, 0) / ACTIVE_COURSES.length);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: 'linear-gradient(135deg,#00A2B6,#006d78)' }}>
              {USER.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Welcome back, {USER.name.split(' ')[0]}!</h1>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <Zap className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
                <span>{USER.streak}-day learning streak</span>
                <span>·</span>
                <span>Member since {USER.joinDate}</span>
              </div>
            </div>
          </div>
          <Link to="/courses"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white self-start sm:self-auto"
            style={{ background: 'linear-gradient(135deg,#00A2B6,#006d78)', boxShadow: '0 4px 16px rgba(0,162,182,0.3)' }}>
            <BookOpen className="h-4 w-4" /> Browse Courses
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Active Courses" value={ACTIVE_COURSES.length} sub="+1 this month" color="var(--ace-brand)" />
          <StatCard icon={Award} label="Certificates Earned" value={CERTIFICATES.length} sub="Keep going!" color="#6366f1" />
          <StatCard icon={Target} label="Avg. Progress" value={`${totalProgress}%`} sub="Across all courses" color="#059669" />
          <StatCard icon={TrendingUp} label="Practice Scores" value="74%" sub="Last exam score" color="#f59e0b" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl self-start w-full sm:w-auto bg-muted">
          {(['overview', 'exams', 'certificates'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                backgroundColor: activeTab === tab ? 'var(--card)' : 'transparent',
                color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                {/* Left: courses + activity */}
                <div className="flex flex-col gap-6">
                  {/* Active courses */}
                  <div>
                    <h2 className="font-black text-lg mb-4 text-foreground">Active Courses</h2>
                    <div className="flex flex-col gap-4">
                      {ACTIVE_COURSES.map((c) => (
                        <CourseProgressCard key={c.id} course={c} />
                      ))}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-2xl p-5 bg-card border border-border">
                    <h2 className="font-black text-base mb-4 text-foreground">Recent Activity</h2>
                    <div className="flex flex-col gap-3">
                      {RECENT_ACTIVITY.map((a, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${a.color}18` }}>
                            <a.icon className="h-3.5 w-3.5" style={{ color: a.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug text-foreground">{a.label}</p>
                            <p className="text-xs mt-0.5 text-muted-foreground">{a.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: deadlines + quick actions */}
                <div className="flex flex-col gap-4">
                  {/* Upcoming deadlines */}
                  <div className="rounded-2xl p-5 bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-black text-base text-foreground">Upcoming</h2>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-3">
                      {UPCOMING_DEADLINES.map((d, i) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-b last:border-0 border-border">
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: d.urgent ? '#ef4444' : 'var(--ace-brand)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-snug text-foreground">{d.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: d.urgent ? '#ef4444' : 'var(--muted-foreground)' }}>{d.dueDate}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0"
                            style={{ backgroundColor: d.type === 'exam' ? 'rgba(99,102,241,0.12)' : d.type === 'quiz' ? 'rgba(0,162,182,0.1)' : 'rgba(5,150,105,0.1)', color: d.type === 'exam' ? '#6366f1' : d.type === 'quiz' ? 'var(--ace-brand)' : '#059669' }}>
                            {d.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice exam CTA */}
                  <div className="rounded-2xl p-5 text-white"
                    style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)', border: `1px solid rgba(255,255,255,0.08)` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: 'rgba(0,162,182,0.2)' }}>
                      <Target className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
                    </div>
                    <h3 className="font-black text-base mb-1">Ready to test yourself?</h3>
                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Practice exams simulate real exam conditions and track your improvement.
                    </p>
                    <Link to="/practice-exams"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: 'var(--ace-brand)' }}>
                      Start Practice Exam <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'exams' && (
            <motion.div key="exams"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="font-black text-lg text-foreground">Exam Performance History</h2>
                  <p className="text-sm mt-1 text-muted-foreground">Track your progress across all practice exams</p>
                </div>
                <div className="p-6">
                  {/* Score trend bars */}
                  <div className="flex items-end gap-4 h-40 mb-6">
                    {EXAM_SCORES.map((e, i) => {
                      const pct = e.score;
                      const barColor = pct >= 70 ? '#059669' : '#f59e0b';
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: barColor }}>{pct}%</span>
                          <div className="w-full rounded-t-lg relative" style={{ height: `${pct}%`, minHeight: 8, backgroundColor: `${barColor}20`, border: `1.5px solid ${barColor}40` }}>
                            <motion.div className="absolute bottom-0 left-0 right-0 rounded-t-lg"
                              initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                              style={{ backgroundColor: barColor, opacity: 0.7 }} />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold text-foreground">{e.exam.split(' ').slice(-1)[0]}</p>
                            <p className="text-[9px] text-muted-foreground">{e.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-3">
                    {EXAM_SCORES.map((e, i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0 border-border">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: e.score >= 70 ? 'rgba(5,150,105,0.12)' : 'rgba(245,158,11,0.12)' }}>
                          {e.score >= 70
                            ? <CheckCircle2 className="h-4 w-4" style={{ color: '#059669' }} />
                            : <Star className="h-4 w-4" style={{ color: '#f59e0b' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{e.exam}</p>
                          <p className="text-xs text-muted-foreground">{e.date}</p>
                        </div>
                        <span className="font-black text-lg" style={{ color: e.score >= 70 ? '#059669' : '#f59e0b' }}>{e.score}%</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/practice-exams"
                    className="mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
                    style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 16px rgba(0,162,182,0.3)' }}>
                    <Target className="h-4 w-4" /> Take Another Practice Exam
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div key="certificates"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              <div className="grid sm:grid-cols-2 gap-4">
                {CERTIFICATES.map((cert) => (
                  <motion.div key={cert.id} whileHover={{ y: -4 }}
                    className="relative rounded-2xl overflow-hidden shadow-xl border border-border">
                    <div className="h-28 relative flex items-center justify-center" style={{ background: cert.gradient }}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '14px 14px' }} />
                      <div className="text-center relative z-10">
                        <Award className="h-10 w-10 text-white mx-auto mb-1" />
                        <div className="w-16 h-px bg-white/40 mx-auto" />
                      </div>
                    </div>
                    <div className="p-5 bg-card">
                      <p className="font-black text-base mb-1 text-foreground">{cert.title}</p>
                      <p className="text-xs mb-1 text-muted-foreground">Issued: {cert.issueDate}</p>
                      <p className="text-xs font-mono text-muted-foreground">ID: {cert.credentialId}</p>
                      <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] border border-border text-foreground">
                        Download Certificate
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Empty state for future certificates */}
                <div className="rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center bg-muted" style={{ border: "2px dashed var(--border)" }}>
                  <Award className="h-10 w-10 mb-3 text-muted-foreground" style={{ opacity: 0.5 }} />
                  <p className="font-semibold text-sm mb-1 text-muted-foreground">More certificates coming</p>
                  <p className="text-xs text-muted-foreground">Complete your active courses to earn them</p>
                  <Link to="/courses" className="mt-4 px-4 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: 'rgba(0,162,182,0.12)', color: 'var(--ace-brand)' }}>
                    View Courses
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
