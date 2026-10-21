/** Small presentational pieces shared by the project list (App.tsx) and the
 *  three-column workspace (Workspace.tsx). */
import { fmtRelative } from '@kirocrew/app-sdk'
import { GitPullRequest, RefreshCw } from 'lucide-react'
import { loopText, type Loop, type SourceLink, type Status } from './model'
import { t } from './strings'

export const POLL_MS = 5000

export const STATUS_VARIANT: Record<Status, 'ok' | 'err' | 'warn' | 'aim' | 'muted'> = {
  needs_you: 'warn',
  stalled: 'err',
  working: 'aim',
  idle: 'muted',
}

export function when(ts: string): string {
  return ts ? fmtRelative(ts) : ''
}

export function StatusDot({ status }: { status: Status }) {
  return <span className={`tp-dot tp-dot-${status}`} aria-hidden="true" />
}

export function PrChip({ link }: { link: SourceLink }) {
  const ci = link.ci ? t.ci[link.ci] : ''
  return (
    <a
      className={`tp-chip ${link.ci ? `tp-ci-${link.ci}` : ''}`}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={ci || link.url}
      onClick={e => e.stopPropagation()}
    >
      <GitPullRequest size={11} aria-hidden="true" />#{link.number}
      {ci && <span className="tp-sr">{ci}</span>}
    </a>
  )
}

export function LoopLine({ loop }: { loop: Loop | null }) {
  if (!loop) return null
  const n = loopText(loop)
  return (
    <span className="tp-loop">
      <RefreshCw size={11} aria-hidden="true" />
      {loop.active ? t.loop(n) : t.loopStopped(n)}
    </span>
  )
}
