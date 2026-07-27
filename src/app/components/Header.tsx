import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, X, ChevronDown, GraduationCap, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { AcecertyLogo } from './AcecertyLogo';

/* ─── Nav structure ──────────────────────────────────────────────────── */

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string; icon: React.ElementType; desc: string }[];
}

const NAV: NavItem[] = [
  { label: 'Exam Vouchers', href: '/exam-vouchers' },
  { label: 'Courses', href: '/courses' },
  {
    label: 'Training',
    href: '/training',
    children: [
      {
        label: 'Training',
        href: '/training',
        icon: GraduationCap,
        desc: 'Bootcamp, self-paced & corporate programmes',
      },
      {
        label: 'Mentorship',
        href: '/mentorship',
        icon: GraduationCap,
        desc: 'Book 1-on-1 sessions with expert mentors',
      },
      {
        label: 'Internship',
        href: '/internship',
        icon: Briefcase,
        desc: 'Hands-on remote tracks across IT disciplines',
      },
    ],
  },
  { label: 'FAQs', href: '/faq' },
  { label: 'Practice Exams', href: '/practice-exams' },
  { label: 'Host a Course', href: '/host-a-course' },
];

/* ─── Training dropdown ─────────────────────────────────────────────── */

function TrainingDropdown({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const childActive = item.children?.some((c) => c.href === location.pathname) ?? false;
  const highlighted = isActive || childActive;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
        style={{ color: highlighted || open ? '#00A2B6' : 'var(--foreground)', fontFamily: 'var(--ace-font)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {item.label}
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'inherit' }}
        />
        <motion.span
          className="absolute bottom-0 left-3 right-3 h-px rounded-full"
          style={{ backgroundColor: '#00A2B6' }}
          initial={false}
          animate={{ scaleX: highlighted || open ? 1 : 0, opacity: highlighted ? 0.8 : open ? 0.5 : 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full left-1/2 mt-2 w-64 rounded-2xl overflow-hidden"
            style={{
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
              zIndex: 100,
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 2, backgroundColor: '#00A2B6' }} />
            <div className="p-2 flex flex-col gap-0.5">
              {item.children!.map((child) => {
                const Icon = child.icon;
                const childIsActive = location.pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: childIsActive ? 'rgba(0,162,182,0.10)' : 'transparent',
                      fontFamily: 'var(--ace-font)',
                    }}
                    onMouseEnter={(e) => {
                      if (!childIsActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      if (!childIsActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: childIsActive ? 'rgba(0,162,182,0.18)' : 'var(--muted)' }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: childIsActive ? '#00A2B6' : 'var(--muted-foreground)' }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: '0.83rem',
                          fontWeight: 600,
                          color: childIsActive ? '#00A2B6' : 'var(--foreground)',
                          fontFamily: 'var(--ace-font)',
                          marginBottom: 1,
                        }}
                      >
                        {child.label}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.45 }}>
                        {child.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Plain nav link ────────────────────────────────────────────────── */

function NavLink({ label, href, isActive }: { label: string; href: string; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={href}
      className="relative px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
      style={{ color: isActive || hovered ? '#00A2B6' : 'var(--foreground)', fontFamily: 'var(--ace-font)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <motion.span
        className="absolute bottom-0 left-3 right-3 h-px rounded-full"
        style={{ backgroundColor: '#00A2B6' }}
        initial={false}
        animate={{ scaleX: isActive || hovered ? 1 : 0, opacity: isActive ? 0.8 : hovered ? 0.5 : 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
    </Link>
  );
}

/* ─── Hamburger ─────────────────────────────────────────────────────── */

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-4 flex flex-col justify-between" style={{ color: 'var(--foreground)' }}>
      <motion.span className="absolute h-0.5 rounded-full bg-current" style={{ width: '100%', top: 0 }}
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
      <motion.span className="absolute h-0.5 rounded-full bg-current" style={{ width: '100%', top: '50%', translateY: '-50%' }}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.15 }} />
      <motion.span className="absolute h-0.5 rounded-full bg-current" style={{ width: '100%', bottom: 0 }}
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
    </div>
  );
}

/* ─── Theme toggle ──────────────────────────────────────────────────── */

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded-full overflow-hidden transition-colors bg-muted border border-border text-foreground"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
            xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </motion.svg>
        ) : (
          <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
            xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ─── Main Header ───────────────────────────────────────────────────── */

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTrainingOpen, setMobileTrainingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, openCart } = useCart();
  const { isDark } = useTheme();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location.pathname]);
  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80); }, [searchOpen]);

  const pillBg = isDark
    ? scrolled ? 'rgba(12,12,18,0.97)' : 'rgba(14,14,22,0.88)'
    : scrolled ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.96)';
  const pillBorder = 'var(--border)';

  /* Flat list for mobile — Training children inlined */
  const MOBILE_FLAT = NAV.flatMap((item) =>
    item.children
      ? [{ label: item.label, href: item.href ?? '#', isChild: false, indent: false }, ...item.children.map((c) => ({ label: c.label, href: c.href, isChild: true, indent: true }))]
      : [{ label: item.label, href: item.href ?? '#', isChild: false, indent: false }],
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ pointerEvents: 'none' }}>
      <div className="w-full px-4 sm:px-6 pt-3 sm:pt-4" style={{ pointerEvents: 'none' }}>
        <div className="max-w-[1200px] mx-auto" style={{ pointerEvents: 'auto' }}>

          {/* ── Pill ─────────────────────────────────────────── */}
          <motion.div
            className="flex items-center gap-2 px-4 sm:px-6"
            animate={{
              backgroundColor: pillBg,
              boxShadow: scrolled
                ? isDark
                  ? '0 4px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset'
                  : '0 4px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset'
                : isDark
                  ? '0 2px 16px rgba(0,0,0,0.35)'
                  : '0 2px 16px rgba(0,0,0,0.07)',
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              borderRadius: 100,
              border: `0.5px solid ${pillBorder}`,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              minHeight: 64,
              fontFamily: 'var(--ace-font)',
            }}
          >
            <Link to="/" className="flex-shrink-0 flex items-center mr-2">
              <AcecertyLogo height={28} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center flex-1 gap-0">
              {NAV.map((item) =>
                item.children ? (
                  <TrainingDropdown
                    key={item.label}
                    item={item}
                    isActive={location.pathname === item.href}
                  />
                ) : (
                  <NavLink
                    key={item.label}
                    label={item.label}
                    href={item.href!}
                    isActive={location.pathname === item.href}
                  />
                ),
              )}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-1.5 ml-auto">
              <ThemeToggle />

              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div key="search-open"
                    initial={{ width: 36, opacity: 0.5 }} animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 36, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="relative">
                    <input
                      ref={searchRef} type="text" value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses…"
                      className="w-full h-9 pl-3 pr-8 rounded-full text-sm outline-none"
                      style={{ backgroundColor: 'var(--muted)', border: '1.5px solid #00A2B6', color: 'var(--foreground)', fontFamily: 'var(--ace-font)' }}
                      onKeyDown={(e) => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button key="search-closed" onClick={() => setSearchOpen(true)}
                    whileHover={{ scale: 1.05, color: '#00A2B6' }} whileTap={{ scale: 0.93 }}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground"
                    aria-label="Search">
                    <Search className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button onClick={openCart}
                whileHover={{ scale: 1.05, color: '#00A2B6' }} whileTap={{ scale: 0.93 }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground"
                aria-label="Open cart">
                <ShoppingCart className="h-4 w-4" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                      style={{ backgroundColor: '#00A2B6' }}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link to="/login"
                className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ml-1"
                style={{ color: '#FFFFFF', background: '#00A2B6', boxShadow: '0 2px 12px rgba(0,162,182,0.30)', fontFamily: 'var(--ace-font)' }}
                onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: '#008fa0' })}
                onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: '#00A2B6' })}
              >
                Login
              </Link>
            </div>

            {/* Mobile icons */}
            <div className="lg:hidden flex items-center gap-1 ml-auto">
              <ThemeToggle />
              <motion.button onClick={openCart} whileTap={{ scale: 0.9 }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-foreground">
                <ShoppingCart className="h-4 w-4" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
                      style={{ backgroundColor: '#00A2B6' }}>
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu">
                <HamburgerIcon open={mobileOpen} />
              </motion.button>
            </div>
          </motion.div>

          {/* ── Mobile menu ───────────────────────────────────── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2 rounded-3xl overflow-hidden"
                style={{
                  background: 'var(--background)',
                  border: `0.5px solid ${pillBorder}`,
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
                }}>
                <div className="px-4 py-4 flex flex-col gap-0.5">
                  {NAV.map((item, i) => {
                    if (item.children) {
                      return (
                        <React.Fragment key={item.label}>
                          <motion.div
                            initial={{ x: -14, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.04, duration: 0.22 }}>
                            <button
                              onClick={() => setMobileTrainingOpen((v) => !v)}
                              className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium transition-all"
                              style={{
                                color: 'var(--foreground)',
                                backgroundColor: 'transparent',
                                fontFamily: 'var(--ace-font)',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {item.label}
                              <ChevronDown
                                className="h-4 w-4 transition-transform"
                                style={{ transform: mobileTrainingOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--muted-foreground)' }}
                              />
                            </button>
                          </motion.div>
                          <AnimatePresence initial={false}>
                            {mobileTrainingOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ overflow: 'hidden' }}
                                className="flex flex-col gap-0.5 pl-3"
                              >
                                {item.children.map((child, ci) => {
                                  const Icon = child.icon;
                                  return (
                                    <motion.div
                                      key={child.href}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: ci * 0.04, duration: 0.18 }}
                                    >
                                      <Link
                                        to={child.href}
                                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-all"
                                        style={{
                                          color: location.pathname === child.href ? '#00A2B6' : 'var(--foreground)',
                                          backgroundColor: location.pathname === child.href ? 'rgba(0,162,182,0.10)' : 'transparent',
                                          fontFamily: 'var(--ace-font)',
                                        }}
                                      >
                                        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: location.pathname === child.href ? '#00A2B6' : 'var(--muted-foreground)' }} />
                                        {child.label}
                                      </Link>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    }

                    return (
                      <motion.div key={item.label}
                        initial={{ x: -14, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.22 }}>
                        <Link to={item.href!}
                          className="block py-3 px-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            color: location.pathname === item.href ? '#00A2B6' : 'var(--foreground)',
                            backgroundColor: location.pathname === item.href ? 'rgba(0,162,182,0.10)' : 'transparent',
                            fontFamily: 'var(--ace-font)',
                          }}>
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: NAV.length * 0.04 + 0.05 }} className="pt-3 pb-1">
                    <Link to="/login"
                      className="block py-3 px-4 rounded-full text-sm font-bold text-white text-center active:scale-[0.97]"
                      style={{ backgroundColor: '#00A2B6', fontFamily: 'var(--ace-font)' }}>
                      Login
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
