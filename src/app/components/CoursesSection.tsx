import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Clock, Monitor, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';

const CODE_TO_ROUTE: Record<string, string> = {
  'CISSP': 'bc-cissp', 'Security+': 'bc-secplus', 'CISM': 'bc-cism',
  'CCNA': 'bc-ccna', 'CCSP': 'bc-ccsp', 'CISA': 'bc-cisa',
  'AWS-SAA': 'bc-aws-saa', 'PMP': 'bc-pmp', 'Azure': 'bc-azure',
  'CEH': 'bc-ceh', 'CCNP': 'bc-ccnp', 'ITIL® 4': 'bc-itil',
  'CGRC': 'bc-cgrc', 'CDPSE': 'bc-cdpse', 'AWS Sec': 'bc-aws-sec',
};

const COURSES = [
  { id: 0, code: 'CISSP', title: 'Certified Information Systems Security Professional', category: 'Cybersecurity', duration: '6 days', delivery: 'Live online or in-person', heading: 'Master information security leadership', description: 'CISSP is known as the gold standard certification for security professionals with coverage of all security domains.', color: '#0B1D3A' },
  { id: 1, code: 'Security+', title: 'CompTIA Security+ Certification', category: 'Entry Level', duration: '5 days', delivery: 'Hybrid delivery', heading: 'Launch your cybersecurity career', description: 'Security+ is the most popular entry-level cybersecurity certification, covering essential security concepts and practices.', color: '#1a5276' },
  { id: 2, code: 'CISM', title: 'Certified Information Security Manager', category: 'Management', duration: '4 days', delivery: 'Virtual classroom', heading: 'Advance into security management', description: 'CISM validates your expertise in information security management and governance for experienced professionals.', color: '#154360' },
  { id: 3, code: 'CCNA', title: 'Cisco Certified Network Associate', category: 'Networking', duration: '5 days', delivery: 'Hands-on labs', heading: 'Build essential networking skills', description: 'CCNA proves your skills in network fundamentals, IP connectivity, and automation with Cisco technologies.', color: '#17202a' },
  { id: 4, code: 'CCSP', title: 'Certified Cloud Security Professional', category: 'Cloud Security', duration: '5 days', delivery: 'Cloud lab access', heading: 'Secure cloud environments at scale', description: 'CCSP demonstrates your expertise in cloud security architecture, design, and operations across major platforms.', color: '#0d2347' },
  { id: 5, code: 'CISA', title: 'Certified Information Systems Auditor', category: 'Audit', duration: '5 days', delivery: 'Interactive online', heading: 'Become an IS audit expert', description: 'CISA is the world-leading certification for IS audit, control, and security professionals globally.', color: '#1a3a6e' },
  { id: 6, code: 'AWS-SAA', title: 'AWS Solutions Architect Associate', category: 'Cloud', duration: '5 days', delivery: 'AWS lab environment', heading: 'Design resilient AWS architectures', description: 'AWS SAA validates your ability to design and deploy scalable, fault-tolerant systems on Amazon Web Services.', color: '#0B1D3A' },
  { id: 7, code: 'PMP', title: 'Project Management Professional', category: 'Management', duration: '5 days', delivery: 'PMBOK Guide 7th Ed', heading: 'Lead projects with confidence', description: 'PMP is the gold standard in project management, recognized across all industries and countries.', color: '#1a5276' },
  { id: 8, code: 'Azure', title: 'Microsoft Azure Administrator', category: 'Cloud', duration: '4 days', delivery: 'Live online or in-person', heading: 'Master Microsoft Azure administration', description: 'Azure Administrator certification validates skills in implementing, monitoring, and maintaining Microsoft Azure solutions.', color: '#154360' },
  { id: 9, code: 'CEH', title: 'Certified Ethical Hacker', category: 'Cybersecurity', duration: '5 days', delivery: 'Hands-on hacking labs', heading: 'Think like a hacker, defend like a pro', description: 'CEH teaches you to think and act like a hacker (legally) to better defend your organization against real-world attacks.', color: '#17202a' },
  { id: 10, code: 'AWS Sec', title: 'AWS Certified Security – Specialty', category: 'Cloud Security', duration: '3 days', delivery: 'AWS security labs', heading: 'Specialize in AWS security', description: 'This specialty certification demonstrates deep expertise in securing the AWS platform and workloads.', color: '#0d2347' },
  { id: 11, code: 'CCNP', title: 'Cisco Certified Network Professional', category: 'Networking', duration: '10 days', delivery: 'Advanced lab environment', heading: 'Advance your networking expertise', description: 'CCNP Enterprise validates the knowledge and skills required to plan, implement, and troubleshoot enterprise networks.', color: '#1a3a6e' },
  { id: 12, code: 'ITIL® 4', title: 'IT Infrastructure Library Foundation', category: 'IT Service Mgmt', duration: '3 days', delivery: 'Interactive online', heading: 'Master IT service management', description: 'ITIL 4 Foundation provides the key concepts of IT service management and the ITIL 4 framework.', color: '#0B1D3A' },
  { id: 13, code: 'CGRC', title: 'Certified in Governance, Risk and Compliance', category: 'Management', duration: '5 days', delivery: 'Virtual classroom', heading: 'Lead governance, risk and compliance', description: 'CGRC validates expertise in information security risk management and security program governance.', color: '#1a5276' },
  { id: 14, code: 'CDPSE', title: 'Certified Data Privacy Solutions Engineer', category: 'Privacy', duration: '3 days', delivery: 'Live online', heading: 'Engineer data privacy solutions', description: 'CDPSE demonstrates your ability to implement privacy by design and build privacy-enabling solutions.', color: '#154360' },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(COURSES.map((c) => c.category)))];

const CATEGORY_ACCENT: Record<string, string> = {
  Cybersecurity: '#dc2626',
  'Entry Level': '#16a34a',
  Management: '#7c3aed',
  Networking: '#2563eb',
  'Cloud Security': '#0891b2',
  Audit: '#d97706',
  Cloud: '#0284c7',
  'IT Service Mgmt': '#6366f1',
  Privacy: '#db2777',
};

function CourseCard({
  course,
  isActive,
  onClick,
  index,
}: {
  course: typeof COURSES[0];
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const accent = CATEGORY_ACCENT[course.category] ?? '#F97316';

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden"
      style={{
        width: 280,
        boxShadow: hovered
          ? '0 12px 36px rgba(11,42,74,0.18)'
          : isActive
          ? '0 8px 24px rgba(11,42,74,0.12)'
          : '0 2px 8px rgba(11,42,74,0.06)',
        border: isActive ? `2px solid #F97316` : '2px solid transparent',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Card header */}
      <div className="px-6 pt-6 pb-8 relative overflow-hidden" style={{ backgroundColor: course.color }}>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: `radial-gradient(ellipse at 30% 40%, ${accent}33 0%, transparent 70%)` }}
        />

        <div className="flex items-start justify-between mb-4 relative">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: `${accent}44`, letterSpacing: '0.04em' }}
          >
            {course.category}
          </span>
          <AnimatePresence>
            {isActive && (
              <motion.span
                key="dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: '#F97316' }}
              />
            )}
          </AnimatePresence>
        </div>

        <div
          className="text-5xl font-black text-white opacity-90 mb-1 relative"
          style={{ letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          {course.code}
        </div>
      </div>

      {/* Card body */}
      <div className="bg-white px-6 pt-5 relative overflow-hidden">
        <h3
          className="text-gray-900 mb-3 leading-snug"
          style={{ fontSize: '0.875rem', fontWeight: 700 }}
        >
          {course.title}
        </h3>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Monitor className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{course.delivery}</span>
          </div>
        </div>

        {/* Buttons area — hover CTA slides up over the static buttons */}
        <div className="relative" style={{ minHeight: 104 }}>
          <div className="flex flex-col gap-2 pb-5">
            <Link
              to={`/courses/${CODE_TO_ROUTE[course.code] ?? 'bc-cissp'}`}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 text-center block"
              style={{ backgroundColor: '#0B1D3A' }}
            >
              View Course
            </Link>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
              style={{ color: '#F97316', borderColor: '#F97316' }}
            >
              ₦60,000
            </button>
          </div>

          <AnimatePresence>
            {hovered && !shouldReduceMotion && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-0 flex flex-col gap-2 pb-5 bg-white"
              >
                <Link
                  to={`/courses/${CODE_TO_ROUTE[course.code] ?? 'bc-cissp'}`}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-95 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F97316' }}
                >
                  <Zap className="h-4 w-4" />
                  Quick Enroll
                </Link>
                <Link
                  to={`/courses/${CODE_TO_ROUTE[course.code] ?? 'bc-cissp'}`}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 text-center block"
                  style={{ backgroundColor: '#0B1D3A' }}
                >
                  View Course
                </Link>
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors"
                  style={{ color: '#F97316', borderColor: '#F97316' }}
                >
                  ₦60,000
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function CoursesSection() {
  const [active, setActive] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterKey, setFilterKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const filtered = selectedCategory === 'All' ? COURSES : COURSES.filter((c) => c.category === selectedCategory);
  const course = filtered[Math.min(active, filtered.length - 1)];

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActive(0);
    setFilterKey((k) => k + 1);
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const idx = ALL_CATEGORIES.indexOf(selectedCategory);
    const el = tabRefs.current[idx];
    const container = tabContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({ left: elRect.left - containerRect.left, width: elRect.width });
    }
  }, [selectedCategory]);

  return (
    <section
      ref={sectionRef}
      id="courses"
      className="py-20 lg:py-28"
      style={{ backgroundColor: '#F8FAFC', fontFamily: 'var(--ace-font)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#F97316' }}>
            WE ARE ACECERTY
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={course?.id ?? 'h'}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="text-gray-900 mb-4 leading-tight"
                  style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 800 }}
                >
                  {course?.heading}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={(course?.id ?? 0) + '-desc'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: '1.05rem' }}
                >
                  {course?.description}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium flex-shrink-0">
              <motion.span
                key={active + '-' + selectedCategory}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Math.min(active, filtered.length - 1) + 1}
              </motion.span>
              <span>/ {filtered.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Category filter tabs with sliding pill */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            ref={tabContainerRef}
            className="relative flex items-center gap-1 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {pillStyle.width > 0 && (
              <motion.div
                className="absolute top-0 rounded-full pointer-events-none z-0"
                animate={{ left: pillStyle.left, width: pillStyle.width }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ height: '100%', backgroundColor: '#0B1D3A' }}
              />
            )}

            {ALL_CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                ref={(el) => (tabRefs.current[i] = el)}
                onClick={() => handleCategoryChange(cat)}
                className="relative z-10 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors duration-200"
                style={{ color: selectedCategory === cat ? '#fff' : '#6b7280' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Carousel controls row */}
        <div className="flex items-center justify-between mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedCategory}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-gray-500"
            >
              {filtered.length} course{filtered.length !== 1 ? 's' : ''} available
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-px active:translate-y-0 transition-all shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="relative flex gap-5 overflow-x-auto pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={filterKey} className="flex gap-5">
              {filtered.map((c, i) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  isActive={course?.id === c.id}
                  onClick={() => setActive(i)}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile dot indicators */}
        <div className="flex justify-center gap-2 mt-4 lg:hidden">
          {filtered.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              animate={{
                width: active === i ? 24 : 8,
                backgroundColor: active === i ? '#F97316' : '#d1d5db',
              }}
              transition={{ duration: 0.25 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Browse all CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <motion.button
            whileHover={shouldReduceMotion ? {} : { y: -3, boxShadow: '0 12px 28px rgba(11,29,58,0.25)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white shadow-lg"
            style={{ backgroundColor: '#0B1D3A' }}
          >
            View All Courses <ArrowRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
