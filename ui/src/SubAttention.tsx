/**
 * The named "N stalled" / "N need you" chips shown BESIDE a goal lead's own
 * status. A goal's header pill and its Goals-list row show the lead's status
 * only (`Project.leadStatus`); the sessions under the lead that want the
 * person are surfaced here instead, so one interrupted worker deep in the tree
 * never reads as the lead being stalled. Each chip opens a small menu listing
 * the sessions by title; picking one opens it (the caller wires that to the
 * middle column's open-session path, which keeps Back to lead). A kind with no
 * sessions draws nothing.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CircleHelp, PauseCircle } from 'lucide-react'
import type { Member, SubAttention } from './model'
import { t } from './strings'

type Kind = 'stalled' | 'needsYou'

const KINDS: Kind[] = ['needsYou', 'stalled']

const label = (kind: Kind, n: number) => (kind === 'stalled' ? t.subStalled(n) : t.subNeedsYou(n))
const aria = (kind: Kind, n: number) => (kind === 'stalled' ? t.subStalledAria(n) : t.subNeedsYouAria(n))
const head = (kind: Kind) => (kind === 'stalled' ? t.subStalledHead : t.subNeedsYouHead)

/** The same chips as plain text, for a native `<option>` that cannot hold
 *  markup: "1 needs you · 2 stalled", or '' when nothing waits. */
export function subAttentionText(a: SubAttention): string {
  return KINDS.map(k => (a[k].length ? label(k, a[k].length) : '')).filter(Boolean).join(' · ')
}

function Chip({ kind, members, onOpen }: { kind: Kind; members: Member[]; onOpen: (key: string) => void }) {
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    itemRefs.current[0]?.focus()
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => !!el)
    const i = items.findIndex(el => el === document.activeElement)
    const n = items.length
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % n]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + n) % n]?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  const Icon = kind === 'stalled' ? PauseCircle : CircleHelp
  const names = members.map(m => m.slot.title || t.untitled)
  return (
    <span className="tp-subatt" ref={wrapRef} data-testid={`sub-attention-${kind}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`tp-subatt-chip tp-subatt-${kind}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={aria(kind, members.length)}
        title={names.join('\n')}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
      >
        <Icon size={11} aria-hidden="true" />
        {label(kind, members.length)}
      </button>
      {open && (
        <div id={menuId} className="tp-subatt-menu" role="menu" aria-label={head(kind)} onKeyDown={onMenuKey}>
          <div className="tp-subatt-head">{head(kind)}</div>
          {members.map((m, i) => (
            <button
              key={m.slot.key}
              ref={el => { itemRefs.current[i] = el }}
              type="button"
              role="menuitem"
              className="tp-subatt-item"
              title={t.subOpenHint}
              onClick={e => {
                e.stopPropagation()
                setOpen(false)
                onOpen(m.slot.key)
              }}
            >
              <span className="tp-subatt-name">{m.slot.title || t.untitled}</span>
              {m.slot.agent && <span className="tp-subatt-agent">{m.slot.agent}</span>}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

/** The chips for one goal; nothing at all when no session under the lead
 *  needs the person or is stalled. */
export function SubAttentionChips({ attention, onOpen }: { attention: SubAttention; onOpen: (key: string) => void }) {
  const kinds = KINDS.filter(k => attention[k].length > 0)
  if (kinds.length === 0) return null
  return (
    <span className="tp-subatt-row">
      {kinds.map(k => <Chip key={k} kind={k} members={attention[k]} onOpen={onOpen} />)}
    </span>
  )
}
