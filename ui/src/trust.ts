/**
 * The middle column's approval-mode control: the dashboard composer's
 * Normal / Reads / Trust / YOLO picker, for the chat the middle column shows.
 *
 * WRITE. The host's ChatEmbed has no picker of its own (its
 * ApprovalModePicker is a Redux-bound dashboard component the app SDK does not
 * export), so the app writes through the host's own route,
 * `POST /api/chat/mode {mode, slot}` — the call the dashboard picker makes. For
 * an app token the host takes it only when:
 *   - the app declares `permissions.sessionApproval: true` (else 403
 *     `session_approval_not_granted`), and
 *   - it names ONE live slot the app may control (else 400 `slot_required` /
 *     404 `slot_not_found`), and
 *   - the mode is Normal, Reads or Trust. YOLO is process-global and the host
 *     refuses it from apps, arming AND revoking (`_deny_app_yolo`,
 *     `app_yolo_forbidden`); an app's Normal on one slot also never ends YOLO
 *     (slot_approval.apply_approval_mode). So YOLO is shown, never set here.
 * `/api/chat/mode` sits under the app's existing `/api/chat` api grant.
 *
 * READ. What the picker SHOWS is the host's own state, never a guess:
 *   - the slot row the app already polls (`/api/chat/slots`): `trust`,
 *     `trust_scope`, `trust_reads`, exactly as the dashboard's
 *     `slotApprovalMode` reads them;
 *   - the global YOLO flag, which no slot row carries. The host serves it to
 *     an in-page app only on `GET /api/status` (`yolo`, plus
 *     `disabled_approval_modes` for policy-locked modes): the `slots` event an
 *     in-page app receives is a bare nudge (`mc:app:slots`, detail null), not
 *     the envelope that carries `yolo`. Until that read answers, the mode is
 *     Unknown — never Normal, which could hide a live YOLO.
 */
import type { Slot } from './model'

/** The modes an app may SET, in the dashboard picker's order. */
export type SettableMode = 'normal' | 'trust_reads' | 'trust'
export const TRUST_MODES: readonly SettableMode[] = ['normal', 'trust_reads', 'trust']

/** What the picker can SHOW: every host mode, plus Unknown when it cannot tell. */
export type ShownMode = SettableMode | 'yolo' | 'unknown'
/** The menu's rows, the dashboard's four. */
export const MENU_MODES: readonly (SettableMode | 'yolo')[] = ['normal', 'trust_reads', 'trust', 'yolo']

/** The host route the picker writes through (covered by the `/api/chat` grant). */
export const MODE_PATH = '/api/chat/mode'
/** The host read carrying the global YOLO flag (`permissions.api` `/api/status`). */
export const STATUS_PATH = '/api/status'

/** The slice of `GET /api/status` the picker reads. */
export interface HostModeStatus {
  yolo?: unknown
  disabled_approval_modes?: unknown
}

/** The global YOLO flag: true / false, or null when the read has not answered
 *  (not granted yet, older host, failed) or answered without a boolean. */
export function hostYolo(status: HostModeStatus | null | undefined): boolean | null {
  return typeof status?.yolo === 'boolean' ? status.yolo : null
}

/** Modes the host's `approval_modes` policy forbids (a subset of
 *  trust_reads / trust / yolo); Normal is the floor and never listed. */
export function policyDisabledModes(status: HostModeStatus | null | undefined): Set<string> {
  const raw = status?.disabled_approval_modes
  return new Set(Array.isArray(raw) ? raw.filter((m): m is string => typeof m === 'string' && m !== 'normal') : [])
}

type SlotModeFields = Pick<Slot, 'trust' | 'trust_scope' | 'trust_reads'>

/** The slot's own mode as the dashboard reads it
 *  (website/src/utils/slotApprovalMode.ts), or null when the row carries none
 *  of the fields (a row from a host without them must not read as Normal). */
export function slotOwnMode(slot: SlotModeFields | null | undefined): SettableMode | null {
  if (!slot || (typeof slot.trust !== 'boolean' && typeof slot.trust_reads !== 'boolean' && slot.trust_scope === undefined)) return null
  if (slot.trust || slot.trust_scope) return 'trust'
  if (slot.trust_reads) return 'trust_reads'
  return 'normal'
}

/** The chat's real mode: YOLO wins over every slot mode (it auto-approves every
 *  chat); with the YOLO read unanswered, or a slot row without mode fields,
 *  the answer is Unknown. */
export function shownMode(slot: SlotModeFields | null | undefined, yolo: boolean | null): ShownMode {
  if (yolo === true) return 'yolo'
  if (yolo === null) return 'unknown'
  return slotOwnMode(slot) ?? 'unknown'
}

/** The request body for one pick. Always names the slot: an unnamed slot is
 *  the host's all-slots request, which it refuses from an app. */
export function modeRequest(slotKey: string, mode: SettableMode): { mode: SettableMode; slot: string } {
  return { mode, slot: slotKey }
}

export type TrustErrorKind = 'not_granted' | 'not_allowed' | 'policy' | 'other'

/** Why a pick was refused, from the host's answer, so the control can say so
 *  in words instead of silently snapping back. */
export function trustErrorKind(err: unknown): TrustErrorKind {
  const e = err as { status?: number; body?: string; message?: string } | null
  const text = `${e?.body ?? ''} ${e?.message ?? ''}`
  if (/mode_disabled_by_policy/.test(text)) return 'policy'
  if (/session_approval_not_granted|cannot manage session approvals/.test(text)) return 'not_granted'
  if (e?.status === 404 || e?.status === 400 || /slot_not_found|slot_required|unknown slot/.test(text)) return 'not_allowed'
  return 'other'
}
