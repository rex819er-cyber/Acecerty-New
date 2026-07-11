import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
  XCircle, BarChart2, BookOpen, RotateCcw, Home, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Question bank (sample for demo) ───────────────────────────── */
interface Question {
  id: number;
  domain: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTION_BANKS: Record<string, Question[]> = {
  default: [
    {
      id: 1, domain: 'Security & Risk Management',
      text: 'Which of the following BEST describes the principle of least privilege?',
      options: [
        'Users should have access to all resources needed to perform any task',
        'Users are granted only the minimum permissions required to perform their job functions',
        'All users share the same access level to ensure consistency',
        'Privileged accounts are shared among administrators for efficiency',
      ],
      correct: 1,
      explanation: 'The principle of least privilege states that a user, process, or system should be granted only the minimum level of access rights necessary to perform their functions. This limits the potential damage from errors, attacks, or insider threats.',
    },
    {
      id: 2, domain: 'Cryptography & PKI',
      text: 'Which asymmetric encryption algorithm is commonly used for digital signatures and key exchange in SSL/TLS?',
      options: ['AES-256', 'RSA', '3DES', 'SHA-256'],
      correct: 1,
      explanation: 'RSA (Rivest–Shamir–Adleman) is the most widely used asymmetric encryption algorithm for digital signatures and key exchange in SSL/TLS. SHA-256 is a hashing algorithm, and AES/3DES are symmetric ciphers.',
    },
    {
      id: 3, domain: 'Network Security',
      text: 'A stateful firewall differs from a packet-filtering firewall in that it:',
      options: [
        'Filters packets only at Layer 3 based on IP addresses',
        'Tracks the state of active connections and allows return traffic automatically',
        'Inspects application-layer content for malicious payloads',
        'Requires manual rules for every inbound and outbound connection',
      ],
      correct: 1,
      explanation: 'A stateful firewall maintains a connection state table and tracks active sessions. This allows it to automatically permit return traffic for established connections without explicit rules, unlike packet-filtering firewalls.',
    },
    {
      id: 4, domain: 'Identity & Access Management',
      text: 'Which authentication factor category does a fingerprint scan belong to?',
      options: ['Something you know', 'Something you have', 'Something you are', 'Somewhere you are'],
      correct: 2,
      explanation: 'Biometric factors such as fingerprints, retina scans, and voice recognition fall under "something you are" — the inherence factor. Passwords are "something you know" and smart cards are "something you have".',
    },
    {
      id: 5, domain: 'Incident Response',
      text: 'During which phase of the incident response lifecycle is eradication of malware performed?',
      options: ['Identification', 'Containment', 'Eradication', 'Lessons Learned'],
      correct: 2,
      explanation: 'The Eradication phase involves removing malware, closing vulnerabilities, and rebuilding systems after an incident has been contained. It follows Identification and Containment in the NIST incident response lifecycle.',
    },
    {
      id: 6, domain: 'Security Architecture',
      text: 'Which security model enforces mandatory access control by preventing subjects from writing to objects at a lower security level?',
      options: ['Bell-LaPadula Model', 'Biba Integrity Model', 'Clark-Wilson Model', 'Brewer-Nash Model'],
      correct: 0,
      explanation: 'The Bell-LaPadula model is focused on confidentiality and enforces "no write-down" (subjects cannot write to lower classification objects) and "no read-up" rules. Biba focuses on integrity, not confidentiality.',
    },
    {
      id: 7, domain: 'Asset Security',
      text: 'Which data destruction method provides the HIGHEST assurance that data cannot be recovered from a hard drive?',
      options: ['Overwriting with zeros', 'Degaussing', 'Physical destruction / shredding', 'Quick format'],
      correct: 2,
      explanation: 'Physical destruction (shredding or incineration) provides the highest assurance of data destruction as the media is completely rendered unusable. Degaussing is effective for magnetic media but not SSDs; overwriting can leave traces on SSDs.',
    },
    {
      id: 8, domain: 'Software Security',
      text: 'Which of the following BEST prevents SQL injection attacks?',
      options: [
        'Encrypting the database at rest',
        'Using parameterised queries and prepared statements',
        'Implementing a web application firewall only',
        'Hashing all user inputs before processing',
      ],
      correct: 1,
      explanation: 'Parameterised queries (prepared statements) are the most effective defence against SQL injection as they separate code from data. A WAF provides an additional layer but is not the primary prevention control.',
    },
    {
      id: 9, domain: 'Cloud Security',
      text: 'In the shared responsibility model for IaaS, which of the following is the cloud customer\'s responsibility?',
      options: [
        'Physical security of the data centre',
        'Hypervisor and virtualisation layer security',
        'Operating system patching and application security',
        'Network hardware maintenance',
      ],
      correct: 2,
      explanation: 'In IaaS, the cloud provider manages physical infrastructure, networking hardware, and virtualisation. The customer is responsible for OS patching, application security, data security, and IAM configuration.',
    },
    {
      id: 10, domain: 'Governance & Compliance',
      text: 'An organisation processes personal data of EU residents. Which regulation primarily governs their data protection obligations?',
      options: ['HIPAA', 'GDPR', 'PCI DSS', 'SOX'],
      correct: 1,
      explanation: 'The General Data Protection Regulation (GDPR) governs processing of personal data of EU residents, regardless of where the processing organisation is located. HIPAA is US healthcare-specific, PCI DSS covers payment card data, and SOX covers financial reporting.',
    },
  ],
};

function getQuestions(examId: string): Question[] {
  return QUESTION_BANKS[examId] ?? QUESTION_BANKS.default;
}

/* ── Timer ──────────────────────────────────────────────────────── */
function useTimer(initialSeconds: number, running: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);
  return seconds;
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
  const fraction = Math.max(0, timeLeft / totalTime);
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

  const questions = getQuestions(id);
  const DURATION = 90 * 60; // 90 minutes

  const [phase, setPhase] = useState<Phase>('start');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [reviewIdx, setReviewIdx] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const timeLeft = useTimer(DURATION, timerRunning);

  const bg = 'var(--background)';
  const cardBg = 'var(--card)';
  const border = 'var(--border)';
  const textPrimary = 'var(--foreground)';
  const textMuted = 'var(--muted-foreground)';

  const answered = answers.filter((a) => a !== null).length;
  const score = answers.reduce((sum, a, i) => (a === questions[i].correct ? sum + 1 : sum), 0);
  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 70;

  function startExam() {
    setPhase('exam');
    setTimerRunning(true);
  }

  function submitExam() {
    setTimerRunning(false);
    setPhase('results');
  }

  function restart() {
    setAnswers(Array(questions.length).fill(null));
    setFlagged(new Set());
    setCurrent(0);
    setPhase('start');
    setTimerRunning(false);
  }

  function toggleFlag(i: number) {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function selectAnswer(optIdx: number) {
    const next = [...answers];
    next[current] = optIdx;
    setAnswers(next);
  }

  /* ── Start screen ─────────────────────────────────────────────── */
  if (phase === 'start') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20"
        style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <div className="h-32 flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#050D1A,#0A1628)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
            <div className="text-center relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--ace-brand)' }}>Practice Exam</p>
              <h1 className="text-2xl font-black text-white uppercase">{id.toUpperCase()}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: BookOpen, value: `${questions.length}`, label: 'Questions' },
                { icon: Clock, value: '90m', label: 'Duration' },
                { icon: BarChart2, value: '70%', label: 'Pass Mark' },
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
                  'You can review your answers before submitting',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: 'var(--ace-brand)' }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={startExam}
              className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.97]"
              style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 20px rgba(0,162,182,0.35)' }}>
              Start Exam →
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
    const domainScores: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
      domainScores[q.domain].total++;
      if (answers[i] === q.correct) domainScores[q.domain].correct++;
    });

    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <div className="max-w-3xl mx-auto">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Score', value: `${score}/${questions.length}`, color: 'var(--ace-brand)' },
                    { label: 'Correct', value: score, color: '#059669' },
                    { label: 'Incorrect', value: questions.length - score, color: '#dc2626' },
                    { label: 'Pass Mark', value: '70%', color: textMuted },
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
                  {Object.entries(domainScores).map(([domain, { correct, total }]) => {
                    const dpct = Math.round((correct / total) * 100);
                    return (
                      <div key={domain}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: textMuted }}>{domain}</span>
                          <span style={{ color: dpct >= 70 ? '#059669' : '#dc2626' }}>{dpct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${dpct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ backgroundColor: dpct >= 70 ? '#059669' : '#dc2626' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => { setPhase('review'); setReviewIdx(0); }}
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
    const q = questions[reviewIdx];
    const userAns = answers[reviewIdx];
    const isCorrect = userAns === q.correct;

    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
        <div className="max-w-2xl mx-auto">
          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setPhase('results')} className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity" style={{ color: textMuted }}>
              ← Results
            </button>
            <span className="text-sm font-semibold" style={{ color: textMuted }}>
              Question {reviewIdx + 1} of {questions.length}
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(0,162,182,0.12)', color: 'var(--ace-brand)' }}>{q.domain}</span>
                {isCorrect
                  ? <CheckCircle2 className="h-4 w-4 ml-auto" style={{ color: '#059669' }} />
                  : <XCircle className="h-4 w-4 ml-auto" style={{ color: '#dc2626' }} />}
              </div>

              <p className="font-semibold text-base mb-6 leading-relaxed" style={{ color: textPrimary }}>{q.text}</p>

              <div className="flex flex-col gap-3 mb-6">
                {q.options.map((opt, i) => {
                  const isUserChoice = userAns === i;
                  const isAnswer = q.correct === i;
                  let bg2 = 'var(--muted)';
                  let bdr = border;
                  let col = textMuted;
                  if (isAnswer) { bg2 = 'rgba(5,150,105,0.12)'; bdr = '#059669'; col = '#059669'; }
                  if (isUserChoice && !isAnswer) { bg2 = 'rgba(220,38,38,0.10)'; bdr = '#dc2626'; col = '#dc2626'; }
                  return (
                    <div key={i} className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                      style={{ backgroundColor: bg2, border: `1.5px solid ${bdr}` }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: isAnswer ? '#059669' : isUserChoice ? '#dc2626' : 'var(--border)', color: (isAnswer || isUserChoice) ? '#fff' : textMuted }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm leading-relaxed" style={{ color: col }}>{opt}</span>
                      {isAnswer && <CheckCircle2 className="h-4 w-4 ml-auto mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />}
                      {isUserChoice && !isAnswer && <XCircle className="h-4 w-4 ml-auto mt-0.5 flex-shrink-0" style={{ color: '#dc2626' }} />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: 'var(--ace-brand-light)' }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--ace-brand)' }}>Explanation</p>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{q.explanation}</p>
              </div>
            </div>

            <div className="flex border-t" style={{ borderColor: border }}>
              <button onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))} disabled={reviewIdx === 0}
                className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                style={{ color: reviewIdx === 0 ? textMuted : textPrimary, opacity: reviewIdx === 0 ? 0.4 : 1 }}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <div className="w-px" style={{ backgroundColor: border }} />
              <button onClick={() => setReviewIdx(Math.min(questions.length - 1, reviewIdx + 1))} disabled={reviewIdx === questions.length - 1}
                className="flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                style={{ color: reviewIdx === questions.length - 1 ? textMuted : textPrimary, opacity: reviewIdx === questions.length - 1 ? 0.4 : 1 }}>
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
  const progressPct = (answered / questions.length) * 100;

  return (
    <div className="min-h-screen pt-16 pb-32 px-4" style={{ backgroundColor: bg, fontFamily: 'var(--ace-font)' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: 'var(--background)', borderBottom: `1px solid ${border}`, backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center gap-4">
          <div className="flex flex-col justify-center min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>Practice</div>
            <div className="text-sm font-black uppercase tracking-wide truncate" style={{ color: textPrimary }}>{id.toUpperCase()}</div>
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
          <CircularTimer timeLeft={timeLeft} totalTime={DURATION} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Grid: question nav + question */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Question navigator */}
          <div className="hidden lg:block sticky top-20 rounded-2xl p-4"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: textMuted }}>
              {answered}/{questions.length} answered
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const isAns = answers[i] !== null;
                const isCurr = i === current;
                const isFlagged = flagged.has(i);
                return (
                  <button key={i} onClick={() => setCurrent(i)}
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
                      {q.domain}
                    </span>
                  </div>
                  <button onClick={() => toggleFlag(current)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: flagged.has(current) ? '#F59E0B' : textMuted, backgroundColor: flagged.has(current) ? 'rgba(245,158,11,0.12)' : 'transparent' }}
                    title="Flag for review">
                    <Flag className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-base font-semibold mb-6 leading-relaxed" style={{ color: textPrimary }}>{q.text}</p>

                <div className="flex flex-col gap-3">
                  {q.options.map((opt, i) => {
                    const selected = answers[current] === i;
                    return (
                      <motion.button key={i} onClick={() => selectAnswer(i)}
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
                        <span className="text-sm leading-relaxed" style={{ color: selected ? ('var(--foreground)') : textMuted }}>{opt}</span>
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
                  <button onClick={submitExam}
                    className="flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2"
                    style={{ color: 'var(--ace-brand)' }}>
                    Submit Exam ✓
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
          <button onClick={submitExam}
            className="px-4 h-10 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--ace-brand)' }}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
