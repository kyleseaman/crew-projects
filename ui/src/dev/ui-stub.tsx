/**
 * Dev-only stub of `@kirocrew/app-sdk/ui`. Mirrors the component surface the
 * app imports from website/src/kirocrew-ui on origin/main: Badge, Btn,
 * Clickable, EmptyState, ErrorNotice, PageHeader, SearchInput, Skeleton.
 *
 * Markup uses the host's theme tokens (var(--...)) so a harness screenshot
 * matches the installed look. Wired in ONLY via the dev Vite alias, so none of
 * this reaches dist/index.mjs.
 */
import React, { forwardRef } from 'react'

type Variant = 'ok' | 'err' | 'warn' | 'aim' | 'muted'

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  ok: { background: 'var(--ok-subtle, color-mix(in srgb, var(--ok) 14%, transparent))', color: 'var(--ok)' },
  err: { background: 'var(--danger-subtle, color-mix(in srgb, var(--danger) 14%, transparent))', color: 'var(--danger)' },
  warn: { background: 'var(--warn-subtle, color-mix(in srgb, var(--warn) 14%, transparent))', color: 'var(--warn)' },
  aim: { background: 'color-mix(in srgb, var(--info, var(--accent)) 14%, transparent)', color: 'var(--info, var(--accent))' },
  muted: { background: 'var(--bg-hover)', color: 'var(--muted)' },
}

export function Badge({ variant, children, ...rest }: { variant: Variant; children: React.ReactNode } & Omit<React.ComponentPropsWithoutRef<'span'>, 'children'>) {
  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        lineHeight: '16px',
        padding: '0 6px',
        borderRadius: 4,
        fontWeight: 600,
        ...VARIANT_STYLE[variant],
      }}
    >
      {children}
    </span>
  )
}

export const Btn = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; primary?: boolean }>(
  function Btn({ primary, danger, children, style, ...rest }, ref) {
    const bg = danger ? 'var(--danger)' : primary ? 'var(--accent)' : 'var(--card)'
    const fg = primary || danger ? 'var(--accent-fg, #fff)' : 'var(--text)'
    return (
      <button
        ref={ref}
        {...rest}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: bg,
          color: fg,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          ...style,
        }}
      >
        {children}
      </button>
    )
  },
)

type ClickableProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'onClick'> & {
  onClick: (e?: React.MouseEvent | React.KeyboardEvent) => void
  disabled?: boolean
}

const Clickable = forwardRef<HTMLDivElement, ClickableProps>(function Clickable(
  { onClick, disabled, children, onKeyDown, tabIndex, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : tabIndex ?? 0}
      aria-disabled={disabled || undefined}
      onClick={e => !disabled && onClick(e)}
      onKeyDown={e => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
        onKeyDown?.(e)
      }}
      {...props}
    >
      {children}
    </div>
  )
})
export { Clickable }

export function SearchInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '6px 10px',
        borderRadius: 7,
        border: '1px solid var(--border)',
        background: 'var(--card)',
        color: 'var(--text)',
        fontSize: 13,
        ...style,
      }}
    />
  )
}

export function Skeleton({ style, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={className}
      {...props}
      style={{
        background: 'var(--bg-hover)',
        borderRadius: 8,
        animation: 'tp-skel-pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
      <div style={{ color: 'var(--muted)' }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, maxWidth: 420 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: React.ReactNode; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '16px 24px 12px' }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-strong, var(--text))' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ flex: 'none' }}>{actions}</div>}
    </header>
  )
}

export default function ErrorNotice({ title, message }: { title: string; message?: string; askAgent?: boolean }) {
  return (
    <div style={{ border: '1px solid var(--danger)', borderRadius: 10, padding: 16, color: 'var(--danger)', background: 'var(--danger-subtle, color-mix(in srgb, var(--danger) 10%, transparent))' }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {message && <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>{message}</div>}
    </div>
  )
}
export { ErrorNotice }
