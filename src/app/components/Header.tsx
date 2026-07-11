import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { AcecertyLogo } from './AcecertyLogo';

const NAV = [
  { label: 'Exam Vouchers', href: '/exam-vouchers' },
  { label: 'Courses', href: '/courses' },
  { label: 'Training', href: '/training' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Practice Exams', href: '/practice-exams' },
  { label: 'Host a Course', href: '/host-a-course' },
];

function NavLink({ label, href, isActive }: {
  label: string; href: string; isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const textColor = (isActive || hovered) ? '#00A2B6' : 'var(--foreground)';
  return (
    <Link
      to={href}
      className="relative px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
      style={{ color: textColor }}
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

function HamburgerIcon({ open }: { open: boolean }) {
  const color = 'var(--foreground)';
  return (
    <div className="relative w-5 h-4 flex flex-col justify-between" style={{ color }}>
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

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded-full overflow-hidden transition-colors bg-muted border border-border text-foreground"
      style={{}}
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  /* Pill colours */
  const pillBg = isDark
    ? scrolled ? 'rgba(12,12,18,0.97)' : 'rgba(14,14,22,0.88)'
    : scrolled ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.96)';
  const pillBorder = 'var(--border)';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50"
      style={{ pointerEvents: 'none' }}
    >
      {/* Outer wrapper — full viewport width, no bg */}
      <div className="w-full px-4 sm:px-6 pt-3 sm:pt-4" style={{ pointerEvents: 'none' }}>
        <div className="max-w-[1200px] mx-auto" style={{ pointerEvents: 'auto' }}>
          {/* Pill container */}
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
            {/* Logo — SVG with theme-adaptive text color */}
            <Link to="/" className="flex-shrink-0 flex items-center mr-2">
              <AcecertyLogo height={28} />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center flex-1 gap-0">
              {NAV.map((item) => (
                <NavLink
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  isActive={location.pathname === item.href}
                />
              ))}
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
                      style={{
                        backgroundColor: 'var(--muted)',
                        border: '1.5px solid #00A2B6',
                        color: 'var(--foreground)',
                      }}
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
                style={{
                  color: '#FFFFFF',
                  background: '#00A2B6',
                  boxShadow: '0 2px 12px rgba(0,162,182,0.30)',
                }}
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

          {/* Mobile menu — drops below pill */}
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
                  {NAV.map((item, i) => (
                    <motion.div key={item.label}
                      initial={{ x: -14, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}>
                      <Link to={item.href}
                        className="block py-3 px-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          color: location.pathname === item.href ? '#00A2B6' : 'var(--foreground)',
                          backgroundColor: location.pathname === item.href ? 'rgba(0,162,182,0.10)' : 'transparent',
                        }}>
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: NAV.length * 0.04 + 0.05 }} className="pt-3 pb-1">
                    <Link to="/login"
                      className="block py-3 px-4 rounded-full text-sm font-bold text-white text-center active:scale-[0.97]"
                      style={{ backgroundColor: '#00A2B6' }}>
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
