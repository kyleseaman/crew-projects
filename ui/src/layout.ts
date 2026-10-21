/**
 * The page layout the person can change, and keeps across reloads:
 *
 *   - the widths of the two outer columns (projects | chat | side panel),
 *     dragged by the edge grabbers between them. Only the outer columns carry
 *     a width; the middle chat takes the rest and never drops below MID_MIN,
 *     so a drag can never squeeze it unusably narrow;
 *   - whether the right side panel is collapsed;
 *   - which of the side panel's tabs is open.
 *
 * Pure, so the rules are tested without a DOM; the drag/keyboard wiring lives
 * in Layout.tsx. Stored in localStorage under one per-app key.
 */

export type ColumnSide = 'left' | 'right'

export interface ColumnWidths {
  left: number
  right: number
}

export const SIDE_TABS = ['overview', 'work', 'project', 'subscriptions', 'library'] as const
export type SideTab = (typeof SIDE_TABS)[number]

export interface LayoutPrefs extends ColumnWidths {
  collapsed: boolean
  tab: SideTab
}

export const DEFAULT_WIDTHS: ColumnWidths = { left: 260, right: 280 }
export const DEFAULT_LAYOUT: LayoutPrefs = { ...DEFAULT_WIDTHS, collapsed: false, tab: 'overview' }
export const LIMITS: Record<ColumnSide, { min: number; max: number }> = {
  left: { min: 180, max: 420 },
  right: { min: 220, max: 560 },
}
/** The middle chat never gets narrower than this while the split is side by side. */
export const MID_MIN = 360
/** One arrow-key press on a grabber; Shift+arrow moves three steps. */
export const KEY_STEP = 16

/** localStorage key, per app, versioned so a future shape change starts fresh. */
export const STORAGE_KEY = 'project-hub:layout:v1'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface ClampOpts {
  /** The split's inner width, when known. Unknown (SSR, first paint): limits only. */
  container?: number
  /** The grid's column gap. */
  gap?: number
  /** The column being dragged: when room runs out, the OTHER one gives first. */
  prefer?: ColumnSide
  /** The side panel is collapsed, so only the projects column shares the row. */
  collapsed?: boolean
}

/**
 * The widths to apply. Each column sits within its own limits; then, when the
 * container is known and the middle would fall below MID_MIN, the outer
 * columns give room back (the one not being dragged first), never below their
 * minimums.
 */
export function clampWidths(w: ColumnWidths, opts: ClampOpts = {}): ColumnWidths {
  let left = clamp(Math.round(w.left), LIMITS.left.min, LIMITS.left.max)
  let right = clamp(Math.round(w.right), LIMITS.right.min, LIMITS.right.max)
  const { container, gap = 0, prefer, collapsed } = opts
  if (!container || container <= 0) return { left, right }
  let over = left + gap + MID_MIN + (collapsed ? 0 : gap + right) - container
  const order: ColumnSide[] = collapsed ? ['left'] : prefer === 'left' ? ['right', 'left'] : ['left', 'right']
  for (const side of order) {
    if (over <= 0) break
    const cur = side === 'left' ? left : right
    const give = Math.max(0, Math.min(over, cur - LIMITS[side].min))
    if (side === 'left') left -= give
    else right -= give
    over -= give
  }
  return { left, right }
}

/** A dragged edge's new width, from the pointer's x and the split's box. */
export function widthFromPointer(side: ColumnSide, x: number, box: { left: number; right: number }, gap: number): number {
  return side === 'left' ? x - box.left - gap / 2 : box.right - x - gap / 2
}

/** Arrow keys on a grabber move the edge the way the arrow points: the left
 *  grabber widens the projects column on ArrowRight, the right grabber widens
 *  the side panel on ArrowLeft. Null for any other key. */
export function widthFromKey(side: ColumnSide, w: ColumnWidths, key: string, shift: boolean): ColumnWidths | null {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null
  const step = KEY_STEP * (shift ? 3 : 1)
  const dir = key === 'ArrowRight' ? 1 : -1
  return side === 'left' ? { ...w, left: w.left + dir * step } : { ...w, right: w.right - dir * step }
}

/** Arrow / Home / End on the side panel's tablist: the tab to move to, or null. */
export function tabFromKey(current: SideTab, key: string): SideTab | null {
  const i = SIDE_TABS.indexOf(current)
  const n = SIDE_TABS.length
  if (key === 'ArrowRight') return SIDE_TABS[(i + 1) % n]
  if (key === 'ArrowLeft') return SIDE_TABS[(i - 1 + n) % n]
  if (key === 'Home') return SIDE_TABS[0]
  if (key === 'End') return SIDE_TABS[n - 1]
  return null
}

const isTab = (v: unknown): v is SideTab => typeof v === 'string' && (SIDE_TABS as readonly string[]).includes(v)

/** A tab id an earlier version stored, mapped to today's tab, so a returning
 *  person never lands on a tab that no longer exists. 0.7's 'goals' tab is
 *  today's Work tab (renamed in 0.8, same navigator content). */
const LEGACY_TABS: Record<string, SideTab> = { goals: 'work' }
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Read stored prefs; each malformed field falls back to its default. */
export function parseLayout(raw: string | null | undefined): LayoutPrefs {
  if (!raw) return { ...DEFAULT_LAYOUT }
  let v: Partial<Record<keyof LayoutPrefs, unknown>>
  try {
    v = JSON.parse(raw) ?? {}
  } catch {
    return { ...DEFAULT_LAYOUT }
  }
  if (typeof v !== 'object') return { ...DEFAULT_LAYOUT }
  const widths = clampWidths({
    left: isNum(v.left) ? v.left : DEFAULT_LAYOUT.left,
    right: isNum(v.right) ? v.right : DEFAULT_LAYOUT.right,
  })
  return {
    ...widths,
    collapsed: v.collapsed === true,
    tab: isTab(v.tab)
      ? v.tab
      : typeof v.tab === 'string' && Object.prototype.hasOwnProperty.call(LEGACY_TABS, v.tab)
        ? LEGACY_TABS[v.tab]
        : DEFAULT_LAYOUT.tab,
  }
}

export function loadLayout(storage: Pick<Storage, 'getItem'> | null | undefined): LayoutPrefs {
  try {
    return parseLayout(storage?.getItem(STORAGE_KEY))
  } catch {
    return { ...DEFAULT_LAYOUT }
  }
}

export function saveLayout(storage: Pick<Storage, 'setItem'> | null | undefined, p: LayoutPrefs): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ left: p.left, right: p.right, collapsed: p.collapsed, tab: p.tab }))
  } catch {
    // Storage full or disabled: the layout just does not survive a reload.
  }
}

/** localStorage when the page may use it, else null (SSR, privacy mode). */
export function browserStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}
