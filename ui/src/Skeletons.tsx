/**
 * Loading placeholders, each drawn in the SAME boxes as the content it stands
 * in for, so nothing moves when the data lands:
 *
 *   PageSkeleton      the three columns (project list | lead chat | side
 *                     panel on its persisted tab) at the persisted widths,
 *                     while folders, slots and loops have not answered.
 *   LibraryRowsSkeleton / ScheduleRowsSkeleton   rows of a group still
 *                     loading inside a loaded tab.
 *   TrustPillSkeleton the approval-mode trigger before the host status read
 *                     answers (instead of a false "Unknown").
 *
 * The bars are the app's own `.tp-sk` (styles.ts), not the host Skeleton: the
 * host box is `--bg-hover`, which in the light palettes is #f0f0f0 on a
 * #fafafa page (~1.04:1, invisible). `.tp-sk` mixes the theme's own text
 * colour, so it reads in every dark, light and cream palette. Every
 * placeholder is aria-hidden; the region it fills says it is busy.
 */
import type { CSSProperties, ReactNode } from 'react'
import { SearchInput } from '@kirocrew/app-sdk/ui'
import { SidePanel, PanelToggle } from './Layout'
import type { SideTab } from './layout'
import { t } from './strings'

/** One placeholder bar. `w` / `h` take any CSS length. `line` sets the height
 *  of the text line the bar stands in for (the bar is centred in it), so a
 *  line of placeholder is exactly as tall as the line of text it becomes. */
export function Sk({ w = '100%', h = 10, r, line, grow = false, className = '' }: { w?: number | string; h?: number | string; r?: number; line?: number; grow?: boolean; className?: string }) {
  const style: CSSProperties = { width: w, height: h, ...(r !== undefined ? { borderRadius: r } : {}) }
  const bar = <span className={`tp-sk ${className}`.trim()} style={style} aria-hidden="true" />
  // `grow` lets a line box take the free width of a flex row (a % bar needs it).
  return line ? <span className={`tp-sk-linebox${grow ? ' tp-sk-grow' : ''}`} style={{ height: line }}>{bar}</span> : bar
}

/** A project row: dot + name + time, the repo/goals line, PR chips. Same box
 *  as `.tp-prow` (App.tsx ProjectRow). */
function ProjectRowSk({ name, sub, chips }: { name: string; sub: string; chips: number }) {
  return (
    <div className="tp-prow tp-prow-sk" aria-hidden="true">
      <div className="tp-row-top">
        <Sk w={7} h={7} r={4} />
        <Sk w={name} h={12} line={18} grow />
        <Sk w={52} h={10} className="tp-sk-push" />
      </div>
      <div className="tp-indent"><Sk w={sub} h={10} line={17} /></div>
      {chips > 0 && (
        <div className="tp-chips tp-indent">
          {Array.from({ length: chips }, (_, i) => <Sk key={i} w={52} h={18} r={4} />)}
        </div>
      )}
    </div>
  )
}

/** The middle column before a goal can be resolved: the header's eyebrow,
 *  title and meta lines, an empty transcript, then the composer and the
 *  approval-mode line where the embed draws them. */
function CenterSk({ panelToggle }: { panelToggle?: ReactNode }) {
  return (
    <section className="tp-center" aria-label={t.chatColumn} aria-busy="true">
      <header className="tp-chead">
        <div className="tp-chead-top">
          <div className="tp-chead-title">
            {/* Line boxes as tall as the loaded eyebrow (17px), title (25px)
                and meta row (20px), so the header keeps its height. */}
            <div className="tp-eyebrow"><Sk w={90} h={10} line={17} /></div>
            <h2 className="tp-h2"><Sk w="min(360px, 70%)" h={16} line={25} /></h2>
          </div>
          <div className="tp-chead-actions">
            <Sk w={100} h={34} r={6} />
            {panelToggle}
          </div>
        </div>
        <div className="tp-chead-meta"><Sk w={230} h={10} line={20} /><Sk w={56} h={18} r={4} /><Sk w={70} h={10} /></div>
      </header>
      <div className="tp-cbody">
        <div className="tp-sk-transcript">
          <Sk w="38%" h={34} r={10} className="tp-sk-end" />
          <Sk w="52%" h={34} r={10} />
        </div>
        <div className="tp-sk-composer"><Sk w="100%" h={44} r={10} /></div>
        <div className="tp-cfoot"><TrustPillSkeleton /></div>
      </div>
    </section>
  )
}

/** A heading bar then `rows` list rows, the Overview / Work section shape. */
function SectionSk({ head = 64, rows, rowH = 30 }: { head?: number; rows: number; rowH?: number }) {
  return (
    <div className="tp-ov-sec" aria-hidden="true">
      <Sk w={head} h={9} />
      {Array.from({ length: rows }, (_, i) => <Sk key={i} h={rowH} r={7} />)}
    </div>
  )
}

/** The side panel's tab content, by tab. */
export function PaneSkeleton({ tab }: { tab: SideTab }) {
  let body: ReactNode
  if (tab === 'overview') {
    body = (
      <div className="tp-ov">
        {/* The 0.9.3 Overview: summary line, Needs you rows, goal rows. */}
        <Sk w="75%" h={10} line={18} />
        <SectionSk head={84} rows={3} rowH={40} />
        <SectionSk head={60} rows={2} rowH={58} />
        <SectionSk head={90} rows={2} rowH={20} />
      </div>
    )
  } else if (tab === 'work') {
    body = (
      <>
        <div className="tp-ov-sec"><Sk w={70} h={10} /><Sk h={30} r={7} /></div>
        <SectionSk head={70} rows={5} rowH={24} />
      </>
    )
  } else if (tab === 'library') {
    body = <div className="tp-ov-sec"><Sk w="80%" h={10} /><LibraryRowsSkeleton rows={4} /></div>
  } else {
    body = (
      <div className="tp-ov-sec">
        <Sk w="90%" h={10} />
        <Sk w="60%" h={10} />
        <ScheduleRowsSkeleton rows={3} />
      </div>
    )
  }
  return <div className="tp-pane" aria-busy="true">{body}</div>
}

/** Library rows (`.tp-lib-row`: icon, name over meta, time). */
export function LibraryRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="tp-lib-list tp-sk-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="tp-lib-row tp-lib-row-static">
          <Sk w={14} h={14} r={3} />
          <div className="tp-lib-main"><Sk w={`${55 + ((i * 17) % 30)}%`} h={11} /><Sk w="35%" h={9} /></div>
          <Sk w={44} h={9} />
        </div>
      ))}
    </div>
  )
}

/** Subscription / schedule rows (`.tp-subs-row`). */
export function ScheduleRowsSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="tp-subs-list tp-sk-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="tp-subs-row tp-subs-row-static">
          <Sk w={14} h={14} r={3} />
          <div className="tp-lib-main"><Sk w={`${60 + ((i * 13) % 25)}%`} h={11} /><Sk w="45%" h={9} /></div>
        </div>
      ))}
    </div>
  )
}

/** The approval-mode trigger's box (`.tp-trust-trigger`, 28px tall). */
export function TrustPillSkeleton() {
  return <Sk w={78} h={28} r={8} className="tp-sk-trust" />
}

/** The whole page while its first reads are in flight, in the loaded grid. */
export function PageSkeleton({
  widths,
  collapsed,
  tab,
  onTab,
  onToggleCollapsed,
}: {
  widths: { left: number; right: number }
  collapsed: boolean
  tab: SideTab
  onTab: (tab: SideTab) => void
  onToggleCollapsed: () => void
}) {
  const pane = <PaneSkeleton tab={tab} />
  return (
    <div
      className={`tp-split${collapsed ? ' tp-split-collapsed' : ''}`}
      style={{ '--tp-col-l': `${widths.left}px`, '--tp-col-r': `${widths.right}px` } as CSSProperties}
      data-testid="page-skeleton"
      role="status"
      aria-label={t.loadingProjects}
    >
      <aside className="tp-list" aria-label={t.projects} aria-busy="true">
        <SearchInput disabled placeholder={t.searchProjects} aria-label={t.searchProjects} />
        <ProjectRowSk name="58%" sub="45%" chips={3} />
        <ProjectRowSk name="66%" sub="62%" chips={3} />
        <ProjectRowSk name="52%" sub="40%" chips={2} />
        <ProjectRowSk name="60%" sub="35%" chips={0} />
        <ProjectRowSk name="48%" sub="42%" chips={0} />
      </aside>
      <CenterSk panelToggle={collapsed ? <PanelToggle open={false} onToggle={onToggleCollapsed} /> : undefined} />
      {!collapsed && (
        <div className="tp-sidewrap">
          <SidePanel
            tab={tab}
            onTab={onTab}
            onCollapse={onToggleCollapsed}
            panes={{ overview: pane, work: pane, project: pane, subscriptions: pane, library: pane }}
          />
        </div>
      )}
    </div>
  )
}
