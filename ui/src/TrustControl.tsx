/**
 * TrustControl — the middle column's approval-mode picker, drawn by the app
 * under the host ChatEmbed's composer because the embed has no picker of its
 * own. See trust.ts for the host routes, the grants and why YOLO is shown but
 * never set from here.
 *
 * Shown as the dashboard composer shows it: a quiet trigger under the input
 * naming the chat's REAL mode (YOLO in the warning colour when the host says it
 * is on, a placeholder pill while the host status read is still out, Unknown
 * when it failed or said nothing usable — never a guessed Normal),
 * opening a menu of Normal / Reads / Trust / YOLO with descriptions and a check
 * on the current one. YOLO is disabled with a way into the chat, where the
 * host's own picker and confirmation set it. The mode follows changes made
 * elsewhere: the slot row and `GET /api/status` are re-read on the poll and on
 * every `slots` event (App.tsx), and after each pick.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppApi, useAppInfo, useChatLauncher } from '@kirocrew/app-sdk'
import { BookOpen, Check, ChevronDown, CircleHelp, Handshake, Rocket, ShieldCheck } from 'lucide-react'
import type { Slot } from './model'
import { POLL_MS } from './parts'
import {
  MENU_MODES,
  MODE_PATH,
  STATUS_PATH,
  hostYolo,
  modeRequest,
  policyDisabledModes,
  shownMode,
  slotOwnMode,
  trustErrorKind,
  type HostModeStatus,
  type SettableMode,
  type ShownMode,
  type TrustErrorKind,
} from './trust'
import { t } from './strings'
import { TrustPillSkeleton } from './Skeletons'

const ICON: Record<ShownMode, typeof ShieldCheck> = {
  normal: ShieldCheck,
  trust_reads: BookOpen,
  trust: Handshake,
  yolo: Rocket,
  unknown: CircleHelp,
}

/** The shared query key of the host status read; App.tsx refetches it on every
 *  `slots` event so a mode changed in the dashboard shows here at once. */
export const STATUS_QUERY_KEY = ['project-hub', 'status'] as const

export function TrustControl({ slot }: { slot: Slot }) {
  const api = useAppApi()
  const qc = useQueryClient()
  const { active } = useAppInfo()
  const { openChat } = useChatLauncher()
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<TrustErrorKind | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const statusQ = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: () => api.get<HostModeStatus>(STATUS_PATH),
    refetchInterval: active !== false ? POLL_MS : false,
    retry: false,
  })
  // A failed read is no answer: the picker then says Unknown.
  const status = statusQ.isError ? null : statusQ.data
  const yolo = hostYolo(status)
  const locked = policyDisabledModes(status)

  const write = useMutation({
    mutationFn: async (mode: SettableMode) => {
      await api.post(MODE_PATH, modeRequest(slot.key, mode))
      // Re-read before the pick stops showing as pending, so the trigger then
      // shows what the host actually recorded.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['project-hub', 'slots'] }),
        qc.invalidateQueries({ queryKey: STATUS_QUERY_KEY }),
      ])
    },
    onMutate: () => setError(null),
    onError: e => setError(trustErrorKind(e)),
  })

  const real = shownMode(slot, yolo)
  // A pending pick shows as chosen only when YOLO is not overriding it.
  const current: ShownMode = write.isPending && write.variables && real !== 'yolo' ? write.variables : real
  const own = slotOwnMode(slot)
  const Icon = ICON[current]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])
  useEffect(() => {
    if (!open) return
    const i = MENU_MODES.indexOf(current as SettableMode | 'yolo')
    itemRefs.current[i >= 0 && i < 3 ? i : 0]?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }
  const pick = (mode: SettableMode) => {
    close()
    // Under YOLO the slot's own mode is what a pick changes; skip only a no-op.
    if (mode !== own || real === 'unknown') write.mutate(mode)
  }
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled)
    const i = items.findIndex(el => el === document.activeElement)
    const n = items.length
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % n]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + n) % n]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); items[n - 1]?.focus() }
    else if (e.key === 'Tab') setOpen(false)
  }

  // First read still out: a pill-sized placeholder, not "Unknown" (which
  // would claim the host could not say, then flip a moment later).
  if (statusQ.isPending && !write.isPending) {
    return (
      <div className="tp-trust" data-testid="trust-control" data-mode="loading" aria-busy="true" aria-label={t.approvalMode}>
        <TrustPillSkeleton />
      </div>
    )
  }

  return (
    <div className="tp-trust" ref={wrapRef} data-testid="trust-control" data-mode={current}>
      <button
        ref={triggerRef}
        type="button"
        className={`tp-trust-trigger tp-trust-${current}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t.approvalModeAria(t.trustLabel[current])}
        title={current === 'unknown' ? t.trustUnknownHint : t.approvalMode}
        aria-busy={write.isPending || undefined}
        onClick={() => setOpen(o => !o)}
      >
        <Icon size={13} aria-hidden="true" className="tp-trust-ico" />
        <span>{t.trustLabel[current]}</span>
        <ChevronDown size={12} aria-hidden="true" className="tp-trust-chev" />
      </button>
      {write.isPending && <span className="tp-trust-note" role="status">{t.trustSaving}</span>}
      {error && !write.isPending && (
        <span className="tp-trust-note tp-trust-err" role="alert" data-testid="trust-error">{t.trustError[error]}</span>
      )}
      {open && (
        <div id={menuId} className="tp-trust-menu" role="menu" aria-label={t.approvalMode} onKeyDown={onMenuKey}>
          {real === 'yolo' && <p className="tp-trust-banner" data-testid="trust-yolo-banner">{t.trustYoloOnNote}</p>}
          {real === 'unknown' && <p className="tp-trust-banner tp-trust-banner-muted">{t.trustUnknownHint}</p>}
          {MENU_MODES.map((mode, i) => {
            const RowIcon = ICON[mode]
            const isYolo = mode === 'yolo'
            const policy = locked.has(mode)
            const disabled = isYolo || policy
            return (
              <button
                key={mode}
                ref={el => { itemRefs.current[i] = el }}
                type="button"
                role="menuitemradio"
                aria-checked={mode === current}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                tabIndex={mode === current ? 0 : -1}
                className={`tp-trust-item tp-trust-${mode}`}
                onClick={() => !isYolo && !policy && pick(mode)}
              >
                <RowIcon size={14} aria-hidden="true" className="tp-trust-ico" />
                <span className="tp-trust-text">
                  <span className="tp-trust-name">{t.trustLabel[mode]}</span>
                  <span className="tp-trust-desc">
                    {policy ? t.trustPolicyLocked : isYolo ? t.trustYoloDisabledHint : t.trustDesc[mode]}
                  </span>
                </span>
                <Check size={14} aria-hidden="true" className={`tp-trust-check${mode === current ? '' : ' tp-trust-check-off'}`} />
              </button>
            )
          })}
          <div className="tp-trust-foot">
            <span>{t.trustYoloNote}</span>
            <button
              type="button"
              className="tp-trust-open"
              onClick={() => { setOpen(false); openChat({ slotKey: slot.key }) }}
            >
              {t.openInChat}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
