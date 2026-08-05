import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
  XCircle, BarChart2, BookOpen, RotateCcw, Home, AlertCircle, Wifi, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  apiGetExamProduct, apiStartAttempt, apiAnswerItem, apiSubmitAttempt,
  apiGetAttemptReview,
} from '../lib/api';
import type {
  ExamProductDetail, AttemptInProgress, AttemptResults, AttemptReviewItem,
} from '../lib/api';

/* ─────────────────────────────────────────────────────────────────────────
   The exam is server-authoritative: the backend owns the question order, the
   option shuffle, the countdown and the grading. This page therefore holds no
   answer key and no question bank — it renders whatever the attempt payload
   contains and mirrors every selection back with
   PATCH /attempts/:id/items/:questionId.

   If no attempt can be created (no published exam form, or a signed-out
   visitor) the page says so rather than inventing questions.
───────────────────────────────────────────────────────────────────────── */

/* ── Question shape rendered from an attempt payload ─────────────── */
interface UiQuestion {
  id: string;
  domain: string;
  text: string;
  options: { id: string; text: string }[];
}

/* ── Timer ──────────────────────────────────────────────────────── */
/* Counts down to a wall-clock deadline rather than decrementing a counter, so
   a backgrounded tab or a slow frame can't drift away from the server's
   expiresAt. */
function useDeadlineTimer(deadline: number | null, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running || deadline === null) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [running, deadline]);
  if (deadline === null) return 0;
  return Math.max(0, Math.round((deadline - now) / 1000));
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/* ── Circular SVG Clock Timer ───────────────────────────────────── */
function CircularTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const SIZE = 72;
  const STROKE = 4.5;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const fraction = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 0;
  const offset = CIRC * (1 - fraction);
  const urgent = timeLeft < 300;
  const warning = timeLeft < 900;

  const trackColor = 'var(--border)';
  const arcColor = urgent ? '#ef4444' : warning ? '#f59e0b' : 'var(--ace-brand)';
  const textColor = urgent ? '#ef4444' : warning ? '#f59e0b' : ('var(--foreground)');

  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const label = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={trackColor} strokeWidth={STROKE} />
        <motion.circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={arcColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: offset, stroke: arcColor }}
          transition={{ strokeDashoffset: { duration: 0.85, ease: 'linear' }, stroke: { duration: 0.4 } }}
        />
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = SIZE / 2 + (R - 3) * Math.cos(rad);
          const y1 = SIZE / 2 + (R - 3) * Math.sin(rad);
          const x2 = SIZE / 2 + (R + 1.5) * Math.cos(rad);
          const y2 = SIZE / 2 + (R + 1.5) * Math.sin(rad);
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={'var(--border)'} strokeWidth={1.5} />;
        })}
      </svg>
      <div className="flex flex-col items-center justify-center" style={{ zIndex: 1 }}>
        <span className="font-black tabular-nums" style={{ fontSize: 13, color: textColor, lineHeight: 1 }}>{label}</span>
        {urgent && (
          <motion.span style={{ fontSize: 7, color: '#ef4444', lineHeight: 1, marginTop: 2, fontWeight: 700 }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
            URGENT
          </motion.span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
type Phase = 'start' | 'exam' | 'review' | 'results';

export default function ExamInterfacePage() {
  const { id = 'cissp' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('start');

  /* Catalog */
  const [product, setProduct]         = useState<ExamProductDetail | null>(null);
  const [catalogLoading, setCatLoad]  = useState(true);
  const [catalogSlow, setCatSlow]     = useState(false);

  /* Attempt */
  const [attemptId, setAttemptId]     = useState<string | null>(null);
  const [questions, setQuestions]     = useState<UiQuestion[]>([]);
  const [answers, setAnswers]         = useState<Record<string, string | null>>({});
  const [flagged, setFlagged]         = useState<Set<string>>(new Set());
  const [deadline, setDeadline]       = useState<number | null>(null);
  const [totalTime, setTotalTime]     = useState(0);
  const [passMark, setPassMark]       = useState(70);

  /* Outcome */
  const [results, setResults]         = useState<AttemptResults | null>(null);
  const [reviewItems, setReviewItems] = useState<AttemptReviewItem[] | null>(null);

  const [current, setCurrent]         = useState(0);
  const [reviewIdx, setReviewIdx]     = useState(0);
  const [starting, setStarting]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const timeLeft = useDeadlineTimer(deadline, phase === 'exam');

  const bg = 'var(--background)';
  const cardBg = 'var(--card)';
  const border = 'var(--border)';
  const textPrimary = 'var(--foreground)';
  const textMuted = 'var(--muted-foreground)';

  /* ── Catalog lookup ───────────────────────────────────────────── */
  /* GET /api/exam-products/:slugOrCode — the backend also resolves cert codes
     (e.g. `SY0-701`), and surfaces freeDemoExamId for the free attempt. */
  useEffect(() => {
    let cancelled = false;
    setCatLoad(true); setCatSlow(false);
    const slow = setTimeout(() => !cancelled && setCatSlow(true), 2500);
    apiGetExamProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setPassMark(p.passMark ?? 70);
      })
      .catch(() => { /* falls back to the local sample bank */ })
      .finally(() => { clearTimeout(slow); if (!cancelled) { setCatLoad(false); setCatSlow(false); } });
    return () => { cancelled = true; clearTimeout(slow); };
  }, [id]);

  /* The exam form an attempt is started against: the free demo if published,
     otherwise the first published form. */
  const examFormId = product?.freeDemoExamId ?? product?.exams?.[0]?.id ?? null;

  /* ── Start ────────────────────────────────────────────────────── */
  /* There is no local question bank: an attempt only exists if the backend
     creates one. Without a published exam form there is nothing to sit. */
  async function startExam() {
    setError('');

    if (!examFormId) {
      setError('This exam has no published question set yet. Please check back soon.');
      return;
    }

    setStarting(true);
    try {
      /* POST /api/exams/:examId/attempts */
      const payload: AttemptInProgress = await apiStartAttempt(examFormId);
      applyAttempt(payload);
      setPhase('exam');
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number };
      setError(
        e?.status === 401
          ? 'Please sign in to take a practice exam.'
          : e?.message ?? 'Could not start the exam. Please try again.',
      );
    } finally {
      setStarting(false);
    }
  }

  /* Loads an attempt payload into local state. The countdown is anchored on the
     server's own clock (expiresAt − serverTime) so a skewed device clock or a
     slow response can't hand the candidate extra time. */
  function applyAttempt(payload: AttemptInProgress) {
    const { attempt, questions: qs } = payload;
    setAttemptId(attempt.id);
    setQuestions(qs.map((q) => ({
      id: q.questionId,
      domain: q.topic ?? 'General',
      text: q.text,
      options: q.options,
    })));
    setAnswers(Object.fromEntries(qs.map((q) => [q.questionId, q.selectedOptionId])));
    setFlagged(new Set(qs.filter((q) => q.flagged).map((q) => q.questionId)));
    setPassMark(attempt.passMark ?? 70);

    const remainingMs = new Date(attempt.expiresAt).getTime() - new Date(attempt.serverTime).getTime();
    setDeadline(Date.now() + Math.max(0, remainingMs));
    setTotalTime((attempt.durationMinutes ?? 90) * 60);
    setCurrent(0);
    setResults(null);
    setReviewItems(null);
  }

  /* ── Answer / flag (mirrored to the server) ───────────────────── */
  const persist = useCallback(
    (questionId: string, body: { selectedOptionId?: string | null; flagged?: boolean }) => {
      if (!attemptId) return;
      /* Fire-and-forget: local state is already updated, and a dropped PATCH is
         recovered on submit because the server re-reads its own items. */
      apiAnswerItem(attemptId, questionId, body).catch(() => {});
    },
    [attemptId],
  );

  function selectAnswer(optionId: string) {
    const q = questions[current];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }));
    persist(q.id, { selectedOptionId: optionId });
  }

  function toggleFlag(i: number) {
    const q = questions[i];
    if (!q) return;
    const next = new Set(flagged);
    const nowFlagged = !next.has(q.id);
    nowFlagged ? next.add(q.id) : next.delete(q.id);
    setFlagged(next);
    persist(q.id, { flagged: nowFlagged });
  }

  /* ── Submit ───────────────────────────────────────────────────── */
  /* Guards against the auto-submit effect and the button racing each other. */
  const submitGuard = useRef(false);

  const submitExam = useCallback(async () => {
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true); setError('');

    if (!attemptId) {
      submitGuard.current = false;
      setSubmitting(false);
      return;
    }

    try {
      /* POST /api/attempts/:id/submit */
      const res = await apiSubmitAttempt(attemptId);
      setResults(res);
      setPhase('results');
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Could not submit the exam.');
      submitGuard.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [attemptId]);

  /* The server expires an overdue attempt on its own; submitting the moment the
     clock hits zero just makes the transition immediate for the candidate. */
  useEffect(() => {
    if (phase === 'exam' && deadline !== null && timeLeft === 0) void submitExam();
  }, [phase, deadline, timeLeft, submitExam]);

  /* ── Review ───────────────────────────────────────────────────── */
  /* GET /api/attempts/:id/review — only served once the attempt is terminal, so
     the answer key never reaches the browser mid-exam. */
  async function openReview() {
    setReviewIdx(0);
    setPhase('review');
    if (!attemptId || reviewItems) return;
    try {
      setReviewItems(await apiGetAttemptReview(attemptId));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Could not load the answer review.');
    }
  }

  function restart() {
    submitGuard.current = false;
    setAttemptId(null);
    setAnswers({}); setFlagged(new Set()); setCurrent(0);
    setResults(null); setReviewItems(null);
    setDeadline(null);
    setError('');
    setPhase('start');
  }

  /* ── Derived ──────────────────────────────────────────────────── */
  /* Every figure below comes from the server's grading response — the browser
     never sees an answer key, so it cannot compute a score itself. */
  const answered = questions.filter((q) => answers[q.id] != null).length;

  const score  = results?.correctCount ?? 0;
  const totalQ = results?.totalQuestions ?? questions.length;
  const pct    = results ? Math.round(results.percentage) : 0;
  const passed = results?.passed ?? false;

  const title = product ? product.certName : id.toUpperCase();

  /* ── Start screen ─────────────────────────────────────────────── */
  if (phase === 'start') {
    const qCount = product?.questionsCount ?? 0;
    const mins   = product?.perExamDurationMinutes ?? 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20"
        style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full mx-4 rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <div className="h-32 flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
            <div className="text-center relative z-10 px-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--ace-brand)' }}>Practice Exam</p>
              <h1 className="text-2xl font-black text-white uppercase">{title}</h1>
              {product?.certCode && <p className="text-white/50 text-xs mt-1">{product.certCode}</p>}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {catalogSlow && catalogLoading && (
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl text-xs"
                style={{ background: 'var(--ace-brand-light)', color: 'var(--ace-brand)' }}>
                <Wifi className="h-4 w-4 animate-pulse shrink-0" /> Waking the exam server up…
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-xl text-xs"
                style={{ background: 'var(--muted)', color: 'var(--destructive)' }}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
              {[
                { icon: BookOpen, value: qCount ? `${qCount}` : '—', label: 'Questions' },
                { icon: Clock, value: mins ? `${mins}m` : '—', label: 'Duration' },
                { icon: BarChart2, value: `${passMark}%`, label: 'Pass Mark' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center rounded-2xl py-4"
                  style={{ backgroundColor: 'var(--muted)' }}>
                  <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: 'var(--ace-brand)' }} />
                  <p className="font-black text-xl" style={{ color: textPrimary }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-5 py-4 mb-8"
              style={{ backgroundColor: 'var(--muted)', border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: textPrimary }}>Before you begin:</p>
              <ul className="flex flex-col gap-1.5">
                {[
                  'You can flag questions and return to them later',
                  'The timer starts as soon as you click Start Exam',
                  'All questions are single best answer unless stated',
                  'Your answers are saved as you go — the timer is enforced server-side',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)' }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={startExam} disabled={starting || catalogLoading || !examFormId}
              className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 20px rgba(0,162,182,0.35)' }}>
              {starting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
                : catalogLoading ? 'Loading exam…'
                : !examFormId ? 'Not yet available'
                : 'Start Exam →'}
            </button>
            <Link to="/practice-exams"
              className="block text-center mt-3 text-sm py-3"
              style={{ color: textMuted }}>
              ← Back to Practice Exams
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Results screen ───────────────────────────────────────────── */
  if (phase === 'results') {
    /* The per-topic breakdown is computed server-side during grading. */
    const breakdown = (results?.domainBreakdown ?? []).map((d) => ({
      domain: d.topic, correct: d.correct, total: d.total,
    }));

    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Score card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-6"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div className="h-40 flex flex-col items-center justify-center relative"
                style={{ background: passed ? 'linear-gradient(135deg,#064e3b,#047857)' : 'linear-gradient(135deg,#7f1d1d,#991b1b)' }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                <div className="relative z-10 text-center">
                  <div className="text-6xl font-black text-white mb-1">{pct}%</div>
                  <div className="text-white/70 text-sm font-semibold">
                    {passed ? '🎉 Congratulations — You Passed!' : '📚 Keep Studying — You\'ll Get There'}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {results?.status === 'expired' && (
                  <p className="text-xs mb-5 px-4 py-2.5 rounded-xl flex items-center gap-2"
                    style={{ background: 'var(--muted)', color: 'var(--destructive)' }}>
                    <AlertCircle className="h-4 w-4 shrink-0" /> Time expired — the attempt was graded automatically.
                  </p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Score', value: `${score}/${totalQ}`, color: 'var(--ace-brand)' },
                    { label: 'Correct', value: score, color: '#059669' },
                    { label: 'Incorrect', value: totalQ - score, color: '#dc2626' },
                    { label: 'Pass Mark', value: `${passMark}%`, color: textMuted },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center rounded-2xl py-4"
                      style={{ backgroundColor: 'var(--muted)' }}>
                      <p className="font-black text-xl" style={{ color }}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color: textMuted }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Domain breakdown */}
                <h3 className="font-black text-base mb-4" style={{ color: textPrimary }}>Performance by Domain</h3>
                <div className="flex flex-col gap-3 mb-8">
                  {breakdown.map(({ domain, correct, total }) => {
                    const dpct = total > 0 ? Math.round((correct / total) * 100) : 0;
                    return (
                      <div key={domain}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: textMuted }}>{domain}</span>
                          <span style={{ color: dpct >= passMark ? '#059669' : '#dc2626' }}>{dpct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${dpct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ backgroundColor: dpct >= passMark ? '#059669' : '#dc2626' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={openReview}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--muted)', color: textPrimary }}>
                    <BookOpen className="h-4 w-4 inline mr-2" /> Review Answers
                  </button>
                  <button onClick={restart}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--ace-brand)' }}>
                    <RotateCcw className="h-4 w-4 inline mr-2" /> Retake Exam
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Review screen ────────────────────────────────────────────── */
  if (phase === 'review') {
    /* GET /attempts/:id/review is the only source of the answer key — it is
       served only once the attempt is terminal. */
    const liveItem = reviewItems?.[reviewIdx];

    const item = liveItem
      ? {
          domain: liveItem.topic ?? 'General',
          text: liveItem.text,
          explanation: liveItem.explanation ?? '',
          options: liveItem.options,
          selectedOptionId: liveItem.selectedOptionId,
          correctOptionId: liveItem.correctOptionId,
          isCorrect: liveItem.isCorrect,
        }
      : null;

    const reviewCount = reviewItems?.length ?? 0;

    if (attemptId && !reviewItems) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
          <div className="flex items-center gap-3 text-sm" style={{ color: textMuted }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--ace-brand)' }} /> Loading your answer review…
          </div>
        </div>
      );
    }

    if (!item) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
          <AlertCircle className="h-8 w-8" style={{ color: 'var(--destructive)' }} />
          <p className="text-sm text-center" style={{ color: textMuted }}>{error || 'No review is available for this attempt.'}</p>
          <button onClick={() => setPhase('results')} className="text-sm underline" style={{ color: 'var(--ace-brand)' }}>← Back to results</button>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setPhase('results')} className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: textMuted }}>
              ← Results
            </button>
            <span className="text-sm font-semibold" style={{ color: textMuted }}>
              Question {reviewIdx + 1} of {reviewCount}
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(0,162,182,0.12)', color: 'var(--ace-brand)' }}>{item.domain}</span>
                {item.isCorrect
                  ? <CheckCircle2 className="h-4 w-4 ml-auto" style={{ color: '#059669' }} />
                  : <XCircle className="h-4 w-4 ml-auto" style={{ color: '#dc2626' }} />}
              </div>

              <p className="font-semibold text-base mb-6 leading-relaxed" style={{ color: textPrimary }}>{item.text}</p>

              <div className="flex flex-col gap-3 mb-6">
                {item.options.map((opt, i) => {
                  const isUserChoice = item.selectedOptionId === opt.id;
                  const isAnswer = opt.isCorrect || item.correctOptionId === opt.id;
                  let bg2 = 'var(--muted)';
                  let bdr = border;
                  let col = textMuted;
                  if (isAnswer) { bg2 = 'rgba(5,150,105,0.12)'; bdr = '#059669'; col = '#059669'; }
                  if (isUserChoice && !isAnswer) { bg2 = 'rgba(220,38,38,0.10)'; bdr = '#dc2626'; col = '#dc2626'; }
                  return (
                    <div key={opt.id} className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ backgroundColor: bg2, border: `1.5px solid ${bdr}` }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: isAnswer ? '#059669' : isUserChoice ? '#dc2626' : 'var(--border)', color: (isAnswer || isUserChoice) ? '#fff' : textMuted }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: col }}>{opt.text}</span>
                      {isAnswer && <CheckCircle2 className="h-4 w-4 ml-auto mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />}
                      {isUserChoice && !isAnswer && <XCircle className="h-4 w-4 ml-auto mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {item.explanation && (
                <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: 'var(--ace-brand-light)' }}>
                  <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--ace-brand)' }}>Explanation</p>
                  <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{item.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex border-t" style={{ borderColor: border }}>
              <button onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))} disabled={reviewIdx === 0}
                className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                style={{ color: reviewIdx === 0 ? textMuted : textPrimary, opacity: reviewIdx === 0 ? 0.4 : 1 }}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <div className="w-px" style={{ backgroundColor: border }} />
              <button onClick={() => setReviewIdx(Math.min(reviewCount - 1, reviewIdx + 1))} disabled={reviewIdx === reviewCount - 1}
                className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                style={{ color: reviewIdx === reviewCount - 1 ? textMuted : textPrimary, opacity: reviewIdx === reviewCount - 1 ? 0.4 : 1 }}>
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Exam screen ──────────────────────────────────────────────── */
  const q = questions[current];
  const progressPct = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen pt-16 pb-32 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: 'var(--background)', borderBottom: `1px solid ${border}`, backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          <div className="flex flex-col justify-center min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>Practice</div>
            <div className="text-sm font-black uppercase tracking-wide truncate" style={{ color: textPrimary }}>{title}</div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between text-[10px]" style={{ color: textMuted }}>
              <span>{answered}/{questions.length} answered</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }} style={{ backgroundColor: 'var(--ace-brand)' }} />
            </div>
          </div>
          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-xs"
            style={{ background: 'var(--muted)', color: 'var(--destructive)' }}>
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Grid: question nav + question */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Question navigator */}
          <div className="hidden lg:block sticky top-20 rounded-2xl p-4"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: textMuted }}>
              {answered}/{questions.length} answered
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((qq, i) => {
                const isAns = answers[qq.id] != null;
                const isCurr = i === current;
                const isFlagged = flagged.has(qq.id);
                return (
                  <button key={qq.id} onClick={() => setCurrent(i)}
                    className="h-8 w-full rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: isCurr ? 'var(--ace-brand)' : isFlagged ? 'rgba(245,158,11,0.2)' : isAns ? 'rgba(5,150,105,0.15)' : 'var(--muted)',
                      color: isCurr ? '#fff' : isFlagged ? '#D97706' : isAns ? '#059669' : textMuted,
                      border: isCurr ? 'none' : isFlagged ? '1.5px solid #D97706' : 'none',
                    }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs" style={{ color: textMuted }}>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(5,150,105,0.15)' }} /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.2)', border: '1.5px solid #D97706' }} /> Flagged</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--ace-brand)' }} /> Current</div>
            </div>
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="rounded-3xl overflow-hidden shadow-xl"
              style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--ace-brand)' }}>
                      Q{current + 1} / {questions.length}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: 'var(--muted)', color: textMuted }}>
                      {q?.domain}
                    </span>
                  </div>
                  <button onClick={() => toggleFlag(current)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: q && flagged.has(q.id) ? '#F59E0B' : textMuted, backgroundColor: q && flagged.has(q.id) ? 'rgba(245,158,11,0.12)' : 'transparent' }}
                    title="Flag for review">
                    <Flag className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-base font-semibold mb-6 leading-relaxed" style={{ color: textPrimary }}>{q?.text}</p>

                <div className="flex flex-col gap-3">
                  {q?.options.map((opt, i) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <motion.button key={opt.id} onClick={() => selectAnswer(opt.id)}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-start gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                        style={{
                          backgroundColor: selected
                            ? 'var(--ace-brand-light)'
                            : 'var(--muted)',
                          border: `2px solid ${selected ? 'var(--ace-brand)' : border}`,
                        }}>
                        <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ borderColor: selected ? 'var(--ace-brand)' : border, backgroundColor: selected ? 'var(--ace-brand)' : 'transparent', color: selected ? '#fff' : textMuted }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: selected ? ('var(--foreground)') : textMuted }}>{opt.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex border-t" style={{ borderColor: border }}>
                <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
                  className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                  style={{ color: current === 0 ? textMuted : textPrimary, opacity: current === 0 ? 0.4 : 1 }}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <div className="w-px" style={{ backgroundColor: border }} />
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(current + 1)}
                    className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ color: textPrimary }}>
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={submitExam} disabled={submitting}
                    className="flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ color: 'var(--ace-brand)' }}>
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Exam ✓'}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: 'var(--background)', borderTop: `1px solid ${border}`, backdropFilter: 'blur(16px)' }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
          style={{ backgroundColor: 'var(--muted)', color: textPrimary, opacity: current === 0 ? 0.4 : 1 }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center text-xs font-semibold" style={{ color: textMuted }}>
          {answered}/{questions.length} answered
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(current + 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--ace-brand)', color: '#fff' }}>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submitExam} disabled={submitting}
            className="px-4 h-10 rounded-full text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--ace-brand)' }}>
            {submitting ? '…' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
