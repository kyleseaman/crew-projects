/**
 * The adjustable page layout: the edge grabbers between the columns, the
 * persisted layout prefs (widths, side-panel collapse, open tab), and the side
 * panel's tab strip, styled after the dashboard's own session side panel
 * (raised active tab fused into the body, accent label + icon, the panel
 * toggle at the strip's trailing edge). The rules are pure, in layout.ts.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { FolderKanban, LayoutDashboard, Library, ListTree, Satellite, type LucideIcon } from 'lucide-react'
import {
  browserStorage,
  clampWidths,
  loadLayout,
  saveLayout,
  tabFromKey,
  widthFromKey,
  widthFromPointer,
  DEFAULT_WIDTHS,
  LIMITS,
  SIDE_TABS,
  type ColumnSide,
  type ColumnWidths,
  type LayoutPrefs,
  type SideTab,
} from './layout'
import { t } from './strings'

// useLayoutEffect warns under renderToStaticMarkup (the tests); the measure
// only matters in a browser.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function gapOf(el: HTMLElement | null): number {
  if (!el || typeof getComputedStyle === 'undefined') return 0
  return parseFloat(getComputedStyle(el).columnGap) || 0
}

export interface PanelLayout {
  prefs: LayoutPrefs
  /** The widths actually applied: prefs clamped to the split's current width. */
  widths: ColumnWidths
  splitRef: RefObject<HTMLDivElement>
  /** Attach to the split element (it mounts after data loads). */
  splitRefCb: (el: HTMLDivElement | null) => void
  setWidth: (side: ColumnSide, px: number) => void
  resetWidth: (side: ColumnSide) => void
  setTab: (tab: SideTab) => void
  toggleCollapsed: () => void
  dragging: ColumnSide | null
  setDragging: (side: ColumnSide | null) => void
}

/** Layout prefs loaded from and saved to localStorage, plus the applied widths
 *  re-clamped whenever the split resizes. `storage` is injectable for tests. */
export function usePanelLayout(storage: Pick<Storage, 'getItem' | 'setItem'> | null = browserStorage()): PanelLayout {
  const [prefs, setPrefs] = useState<LayoutPrefs>(() => loadLayout(storage))
  const [box, setBox] = useState({ width: 0, gap: 0 })
  const [dragging, setDragging] = useState<ColumnSide | null>(null)
  // The edge last moved keeps its width when room runs out; the other gives.
  const [lastSide, setLastSide] = useState<ColumnSide | undefined>(undefined)
  const splitRef = useRef<HTMLDivElement>(null)
  const storageRef = useRef(storage)

  // Saved at once (a toggle followed straight by a reload must survive), but
  // not on every pointer move: a drag writes once, when it ends.
  useEffect(() => {
    if (!dragging) saveLayout(storageRef.current, prefs)
  }, [prefs, dragging])

  // The split mounts only once data has loaded, so it is tracked through a
  // callback ref and measured (and observed) whenever that element changes.
  const [splitEl, setSplitEl] = useState<HTMLDivElement | null>(null)
  const splitRefCb = useCallback((el: HTMLDivElement | null) => {
    ;(splitRef as { current: HTMLDivElement | null }).current = el
    setSplitEl(el)
  }, [])
  useIsoLayoutEffect(() => {
    const el = splitEl
    if (!el) return
    const measure = () => {
      const next = { width: el.clientWidth, gap: gapOf(el) }
      setBox(b => (b.width === next.width && b.gap === next.gap ? b : next))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [splitEl])

  const widths = clampWidths(prefs, {
    container: box.width,
    gap: box.gap,
    collapsed: prefs.collapsed,
    prefer: dragging ?? lastSide,
  })

  // A drag or key press stores the width it can actually show, so the edge
  // tracks the pointer instead of running ahead of a clamped column.
  const setWidth = (side: ColumnSide, px: number) => {
    setLastSide(side)
    setPrefs(p => {
      const shown = clampWidths({ ...p, [side]: px }, { container: box.width, gap: box.gap, collapsed: p.collapsed, prefer: side })
      return { ...p, [side]: shown[side] }
    })
  }
  return {
    prefs,
    widths,
    splitRef,
    splitRefCb,
    setWidth,
    resetWidth: side => setPrefs(p => ({ ...p, [side]: DEFAULT_WIDTHS[side] })),
    setTab: tab => setPrefs(p => ({ ...p, tab })),
    toggleCollapsed: () => setPrefs(p => ({ ...p, collapsed: !p.collapsed })),
    dragging,
    setDragging,
  }
}

/** The edge grabber on one column boundary. A vertical separator: drag it,
 *  nudge it with the arrow keys, double-click it to reset. Hidden (CSS) where
 *  the columns stack. */
export function ColumnGrabber({ side, layout }: { side: ColumnSide; layout: PanelLayout }) {
  const { widths, splitRef, setWidth, resetWidth, setDragging, dragging } = layout
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(side)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging !== side) return
    const el = splitRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setWidth(side, widthFromPointer(side, e.clientX, r, gapOf(el)))
  }
  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging !== side) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setDragging(null)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = widthFromKey(side, widths, e.key, e.shiftKey)
    if (next) {
      e.preventDefault()
      setWidth(side, next[side])
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const grow = (e.key === 'End') === (side === 'left')
      setWidth(side, grow ? LIMITS[side].max : LIMITS[side].min)
    }
  }
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === 'left' ? t.resizeProjects : t.resizeSide}
      aria-valuenow={widths[side]}
      aria-valuemin={LIMITS[side].min}
      aria-valuemax={LIMITS[side].max}
      tabIndex={0}
      title={t.resizeHint}
      className={`tp-grab tp-grab-${side}${dragging === side ? ' tp-grab-active' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={() => resetWidth(side)}
      onKeyDown={onKeyDown}
      data-side={side}
    />
  )
}

/** The host's side-panel glyph (KiroCrew's components/icons/panels.tsx): a
 *  framed window whose right pane is thick and dimmed while the panel is open
 *  (the click tucks it away) and thin and solid while it is closed. */
export function PanelGlyph({ open, size = 15 }: { open: boolean; size?: number }) {
  const pane = open ? { x: 13, width: 6.5, rx: 1.4, opacity: 0.45 } : { x: 17.1, width: 2.4, rx: 1.2, opacity: 1 }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="tp-panel-glyph">
      <rect x={2.5} y={3.25} width={19} height={17.5} rx={3} stroke="currentColor" strokeWidth={1.75} />
      <rect x={pane.x} y={5.25} width={pane.width} height={13.5} rx={pane.rx} fill="currentColor" fillOpacity={pane.opacity} />
    </svg>
  )
}

/** The side-panel toggle. `open` names the panel's current state. */
export function PanelToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const label = open ? t.hidePanel : t.showPanel
  return (
    <button
      type="button"
      className={`tp-panel-toggle${open ? '' : ' tp-panel-toggle-closed'}`}
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      title={label}
    >
      <PanelGlyph open={open} />
    </button>
  )
}

const TAB_META: Record<SideTab, { label: string; Icon: LucideIcon }> = {
  overview: { label: t.tabOverview, Icon: LayoutDashboard },
  work: { label: t.tabWork, Icon: ListTree },
  project: { label: t.tabProject, Icon: FolderKanban },
  subscriptions: { label: t.tabSubscriptions, Icon: Satellite },
  library: { label: t.tabLibrary, Icon: Library },
}

export const tabId = (tab: SideTab) => `tp-tab-${tab}`
export const panelId = (tab: SideTab) => `tp-tabpanel-${tab}`

/** The side panel: the tab strip across the top (a real tablist: roving
 *  focus, arrows/Home/End move and select), the collapse toggle at its
 *  trailing edge, then the open tab's content filling the rest of the column
 *  with its own scroll. Only the open tab's content is rendered. */
export function SidePanel({
  tab,
  onTab,
  onCollapse,
  panes,
}: {
  tab: SideTab
  onTab: (tab: SideTab) => void
  onCollapse: () => void
  panes: Record<SideTab, ReactNode>
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = tabFromKey(tab, e.key)
    if (!next) return
    e.preventDefault()
    onTab(next)
    stripRef.current?.querySelector<HTMLElement>(`#${tabId(next)}`)?.focus()
  }
  return (
    <aside className="tp-side" aria-label={t.sideTabsLabel}>
      <div className="tp-tabstrip">
        <div ref={stripRef} role="tablist" aria-label={t.sideTabsLabel} className="tp-tabs" onKeyDown={onKeyDown}>
          {SIDE_TABS.map(id => {
            const { label, Icon } = TAB_META[id]
            const active = id === tab
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={tabId(id)}
                aria-selected={active}
                aria-controls={panelId(id)}
                tabIndex={active ? 0 : -1}
                className={`tp-tab${active ? ' tp-tab-active' : ''}`}
                onClick={() => onTab(id)}
                title={label}
              >
                <Icon size={14} aria-hidden="true" className="tp-tab-ico" />
                <span className="tp-tab-label">{label}</span>
              </button>
            )
          })}
        </div>
        <span className="tp-tabstrip-rule" aria-hidden="true" />
        <PanelToggle open onToggle={onCollapse} />
      </div>
      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)} className="tp-tabpanel" tabIndex={0}>
        {panes[tab]}
      </div>
    </aside>
  )
}
