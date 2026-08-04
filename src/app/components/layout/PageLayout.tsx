import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   Shared responsive layout primitives.

   Every full-page view should sit inside <PageShell> (background + vertical
   rhythm) and wrap its content in <PageContainer> (max width + gutters), so
   nothing ever touches the physical screen edge on a phone. Centred cards
   (auth, callbacks, payment confirmation) use <CenteredCard>.

   All colours, radii, shadows and type come from the CSS variables in
   theme.css — restyling the app means editing those tokens, not these files.
───────────────────────────────────────────────────────────────────────── */

type Width = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const WIDTH_CLASS: Record<Width, string> = {
  sm:   'max-w-3xl',
  md:   'max-w-5xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  full: 'max-w-none',
};

/** Horizontal gutters used everywhere: 16px → 24px → 32px. */
export const GUTTER = 'px-4 sm:px-6 lg:px-8';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: Width;
  /** Set false when a child needs to bleed to the viewport edge (marquees, hero art). */
  gutter?: boolean;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
}

export function PageContainer({
  width = 'xl', gutter = true, as: Tag = 'div', className = '', children, ...rest
}: PageContainerProps) {
  return (
    <Tag
      className={`w-full ${WIDTH_CLASS[width]} mx-auto ${gutter ? GUTTER : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds clearance for the fixed header. */
  topPadding?: boolean;
}

/**
 * Full-height page background. `overflow-x: clip` here is the last line of
 * defence against a stray wide child producing a horizontal scrollbar.
 */
export function PageShell({ topPadding = true, className = '', children, style, ...rest }: PageShellProps) {
  return (
    <div
      className={`min-h-screen ${topPadding ? 'pt-20 sm:pt-24' : ''} pb-12 sm:pb-16 ${className}`.replace(/\s+/g, ' ').trim()}
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--ace-font)',
        overflowX: 'clip',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface PageHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Page title block with fluid type and a wrap-safe action slot. */
export function PageHeading({ eyebrow, title, subtitle, actions, className = '' }: PageHeadingProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 ${className}`}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <p
            className="text-xs"
            style={{
              color: 'var(--ace-brand)', fontFamily: 'var(--ace-font)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-xl sm:text-2xl lg:text-3xl"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--ace-font)', fontWeight: 800, lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm sm:text-base mt-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)', lineHeight: 1.6 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export interface CenteredCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card width bound — `md` is the 28rem default used by auth and payment cards. */
  size?: 'sm' | 'md' | 'lg';
}

const CARD_WIDTH: Record<NonNullable<CenteredCardProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

/**
 * Vertically and horizontally centred card for login / register / payment
 * confirmation. `min-h-screen` + flex centring keeps it in the middle of any
 * viewport, and the gutter stops it from bleeding on narrow phones.
 */
export function CenteredCard({ size = 'md', className = '', children, style, ...rest }: CenteredCardProps) {
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${GUTTER} py-10`}
      style={{ background: 'var(--background)', fontFamily: 'var(--ace-font)', overflowX: 'clip' }}
    >
      <div
        className={`w-full ${CARD_WIDTH[size]} p-6 sm:p-8 ${className}`.replace(/\s+/g, ' ').trim()}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--ace-radius-xl)',
          boxShadow: 'var(--ace-shadow-lg)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

/* ── responsive form primitives ───────────────────────────────────────── */

export const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  minHeight: 44,                       /* comfortable tap target on mobile */
  borderRadius: 'var(--ace-radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--input-background)',
  color: 'var(--foreground)',
  fontFamily: 'var(--ace-font)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: 'var(--muted-foreground)',
  fontFamily: 'var(--ace-font)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  /** Renders inside the field on the right (password reveal, unit suffix). */
  trailing?: React.ReactNode;
}

/**
 * Label + input + error, sized fluidly. `min-w-0` on the wrapper is what stops
 * a field inside a flex row from forcing the row wider than the viewport.
 */
export function Field({ label, error, hint, trailing, className = '', ...input }: FieldProps) {
  return (
    <div className={`w-full min-w-0 ${className}`}>
      <label className="text-xs" style={labelStyle}>{label}</label>
      <div className="relative">
        <input
          className="text-sm sm:text-base"
          style={{
            ...fieldStyle,
            borderColor: error ? 'var(--destructive)' : 'var(--border)',
            paddingRight: trailing ? 44 : fieldStyle.padding as string | number,
          }}
          {...input}
        />
        {trailing && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {trailing}
          </span>
        )}
      </div>
      {error
        ? <p className="text-xs mt-1" style={{ color: 'var(--destructive)', fontFamily: 'var(--ace-font)' }}>{error}</p>
        : hint
          ? <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--ace-font)' }}>{hint}</p>
          : null}
    </div>
  );
}

/** Stacks fields on mobile, sits them side by side from `sm` up. */
export function FieldRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>{children}</div>;
}

/** Full-width primary action with a mobile-safe tap height. */
export function PrimaryButton({
  children, className = '', style, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 text-sm sm:text-base transition-opacity active:scale-[0.99] disabled:opacity-60 ${className}`}
      style={{
        minHeight: 48,
        padding: '13px 20px',
        border: 'none',
        borderRadius: 'var(--ace-radius-md)',
        background: 'var(--ace-brand)',
        color: 'var(--primary-foreground)',
        fontFamily: 'var(--ace-font)',
        fontWeight: 700,
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
