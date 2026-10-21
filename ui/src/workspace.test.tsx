import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import {
  buildFolderProjects,
  defaultGoalKey,
  middleTarget,
  resolveGoal,
  selectedGoalKey,
  sessionTone,
  sessionTree,
  slotStatus,
  workspaceReducer,
  type Folder,
  type FolderProject,
  type Slot,
  type WorkspaceState,
} from './model'
import { CenterColumn, GoalPicker, SessionsTree, Workspace } from './Workspace'
import { ColumnGrabber, usePanelLayout } from './Layout'
import { STORAGE_KEY, type SideTab } from './layout'
import { t } from './strings'

// Pins the three-column workspace: which goal is selected, what the middle
// column shows, the sessions tree, and the empty and no-directory states.

const ago = (min: number) => new Date(Date.UTC(2026, 9, 18, 12, 0) - min * 60_000).toISOString()

const SLOTS: Slot[] = [
  // Goal A: older, with a sub-team (C-sub -> W-deep) and a direct worker.
  { key: 'A', agent: 'kirocrew-team-lead', title: 'Goal A', folder_id: 'f1', last_activity_ts: ago(30) },
  { key: 'C-sub', agent: 'kirocrew-conductor', created_by: 'A', title: 'Sub conductor', running: true, last_activity_ts: ago(40) },
  { key: 'W-deep', agent: 'kirocrew-worker', created_by: 'C-sub', title: 'Deep worker', last_activity_ts: ago(41),
    source_links: [{ url: 'https://x/pr/1', number: 1, state: 'merged' }] },
  { key: 'W-a', agent: 'kirocrew-worker', created_by: 'A', title: 'Direct worker', pending_approval: true, last_activity_ts: ago(35) },
  // Goal B: the most recently active live goal, no sessions.
  { key: 'B', agent: 'kirocrew-team-lead', title: 'Goal B', folder_id: 'f1', last_activity_ts: ago(1) },
]
const FOLDERS: Folder[] = [
  { id: 'f1', name: 'Proj', project_dir: '/repo/one' },
  { id: 'f2', name: 'Empty proj' },
]

const projects = buildFolderProjects(FOLDERS, SLOTS, [], [
  { key: 'H', title: 'Old archived goal', agent: 'kirocrew-team-lead', folder_id: 'f1', modified: Date.UTC(2026, 9, 18, 13) / 1000 },
])
const proj = projects.find(p => p.folder.id === 'f1') as FolderProject
const empty = projects.find(p => p.folder.id === 'f2') as FolderProject
const goalA = proj.goals.find(g => g.lead.slot.key === 'A')!

const noop = () => {}
const html = (el: JSX.Element) =>
  renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}>{el}</QueryClientProvider>)
const workspace = (p: FolderProject, initial?: Partial<WorkspaceState>) =>
  html(
    <Workspace p={p} slotsByKey={new Map(SLOTS.map(s => [s.key, s]))} initial={initial}
      onOpenFull={noop} onNewGoal={noop} onSettings={noop} tab="work" />,
  )
/** The slot key the middle column's ChatEmbed is bound to. */
const chatSlot = (markup: string) => markup.match(/data-stub="chat-embed" data-slot="([^"]+)"/)?.[1]
/** The title of the goal the Work tab's picker has selected (none while a
 *  session is open in the middle: the picker then shows its placeholder). */
const currentGoal = (markup: string) =>
  markup.match(/<option value="[^"]+" selected="">([^<]+?)(?: · | \()/)?.[1]

describe('default goal selection', () => {
  it('picks the most recently active LIVE goal, even over a newer archived one', () => {
    expect(defaultGoalKey(proj.goals)).toBe('B')
  })
  it('falls back to an archived goal when no goal is live, and to none with no goals', () => {
    expect(defaultGoalKey(proj.goals.filter(g => g.archived))).toBe('H')
    expect(defaultGoalKey([])).toBeNull()
  })
  it('resolves a vanished goal key to the default', () => {
    expect(resolveGoal(proj.goals, 'gone')?.lead.slot.key).toBe('B')
  })
  it('renders the default goal as current and binds the chat to its lead', () => {
    const m = workspace(proj)
    expect(chatSlot(m)).toBe('B')
    expect(currentGoal(m)).toBe('Goal B')
  })
})

describe('goal selection switches the middle chat', () => {
  it('selecting a goal binds the ChatEmbed to that goal and marks it current', () => {
    const s = workspaceReducer({ goalKey: 'B', sessionKey: null }, { type: 'selectGoal', key: 'A' })
    expect(middleTarget(proj.goals, s).goal?.lead.slot.key).toBe('A')
    const m = workspace(proj, s)
    expect(chatSlot(m)).toBe('A')
    expect(currentGoal(m)).toBe('Goal A')
    expect(m).not.toContain('aria-current="true"')
  })
  it('only one ChatEmbed is ever mounted', () => {
    expect(workspace(proj, { goalKey: 'A' }).match(/data-stub="chat-embed"/g)).toHaveLength(1)
  })
})

describe('a session opens in the middle column', () => {
  const open = workspaceReducer({ goalKey: 'A', sessionKey: null }, { type: 'openSession', key: 'W-a' })

  it('replaces the lead chat with that session, header names it, Back to lead shows', () => {
    const m = workspace(proj, open)
    expect(chatSlot(m)).toBe('W-a')
    expect(m).toContain('Direct worker')
    expect(m).toContain(' · kirocrew-worker')
    expect(m).toContain(t.backToLead)
    expect(m).toContain(t.openInChat)
    expect(m).toMatch(/class="tp-srow" aria-current="true"[^>]*><span class="tp-srow-name">Direct worker/)
  })
  it('Back to lead returns to the goal lead and drops Back to lead', () => {
    const back = workspaceReducer(open, { type: 'backToLead' })
    expect(back).toEqual({ goalKey: 'A', sessionKey: null })
    const m = workspace(proj, back)
    expect(chatSlot(m)).toBe('A')
    expect(m).not.toContain(t.backToLead)
  })
  it('switching goals resets the middle column to the new goal lead', () => {
    expect(workspaceReducer(open, { type: 'selectGoal', key: 'B' })).toEqual({ goalKey: 'B', sessionKey: null })
    expect(workspaceReducer(open, { type: 'selectGoal', key: 'A' }).sessionKey).toBeNull()
  })
  it('a session key outside the goal falls back to the lead', () => {
    expect(middleTarget(proj.goals, { goalKey: 'B', sessionKey: 'W-a' }).session).toBeNull()
  })
})

describe('sessions tree', () => {
  it('nests a sub-team worker under its sub-lead, with an indent list', () => {
    const m = html(<SessionsTree nodes={sessionTree(goalA)} openKey={null} onOpen={noop} />)
    const subIdx = m.indexOf('Sub conductor')
    const nested = m.indexOf('tp-tree-nested', subIdx)
    expect(subIdx).toBeGreaterThan(-1)
    expect(nested).toBeGreaterThan(subIdx)
    expect(m.indexOf('Deep worker')).toBeGreaterThan(nested)
    // The direct worker is a top-level row, after the sub-team's nested list closes.
    expect(m.indexOf('Direct worker')).toBeGreaterThan(m.indexOf('</ul>', nested))
  })
  it('colours each row by its state: working, done (merged), needs approval', () => {
    const m = html(<SessionsTree nodes={sessionTree(goalA)} openKey={null} onOpen={noop} />)
    expect(m).toContain('tp-tone-working">Working')
    expect(m).toContain('tp-tone-done">Done')
    expect(m).toContain('tp-tone-needs_approval">Needs approval')
  })
  it('reads each session status from its slot flags only', () => {
    const tone = (slot: Slot) => sessionTone({ slot, status: slotStatus(slot) })
    expect(tone({ key: 'x' })).toBe('idle')
    expect(tone({ key: 'x', running: true })).toBe('working')
    expect(tone({ key: 'x', pending_approval: true, running: true })).toBe('needs_approval')
    expect(tone({ key: 'x', needs_input: true })).toBe('needs_you')
    expect(tone({ key: 'x', interrupted: true })).toBe('stalled')
    expect(tone({ key: 'x', source_links: [{ url: 'u', number: 1, state: 'open' }] })).toBe('idle')
  })
  it('a goal with no sessions says so', () => {
    expect(workspace(proj, { goalKey: 'B' })).toContain(t.noSessions)
  })
})

describe('empty states', () => {
  it('no goals: the middle explains how to start one; the right list is empty', () => {
    const m = workspace(empty)
    expect(m).toContain(t.noGoalsMiddleTitle)
    expect(m).toContain(t.newGoal)
    expect(m).toContain(t.noGoalsYet)
    expect(m).not.toContain('data-stub="chat-embed"')
    expect(html(<GoalPicker goals={[]} selectedKey={null} onSelect={noop} onNewGoal={noop} />)).toContain(t.goalsHeading(0))
  })
})

describe('directory chip replaces the banner', () => {
  it('a project with no directory shows the small header chip', () => {
    expect(empty.needsDir).toBe(true)
    const m = html(
      <CenterColumn p={empty} goal={null} session={null} onBack={noop} onOpenFull={noop} onNewGoal={noop} onSettings={noop} />,
    )
    expect(m).toMatch(/class="tp-dirchip"[^>]*>No directory · <span class="tp-dirchip-act">Set<\/span>/)
  })
  it('a project with a directory shows no chip', () => {
    expect(workspace(proj)).not.toContain('tp-dirchip')
  })
  it('the dashed Set-directory banner is gone', () => {
    const src = ['App.tsx', 'Workspace.tsx'].map(f => readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')).join('\n')
    expect(src).not.toContain('tp-setdir')
    expect(src).not.toContain('t.setDirectoryTitle}</strong>')
  })
})

describe('accessibility hooks', () => {
  it('the goal picker is a labelled native select; rows have visible focus; reduced motion', () => {
    const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')
    expect(css).toMatch(/\.tp-goal-select:focus-visible[^{]*\{outline:2px solid/)
    expect(css).toMatch(/\.tp-ov-need:focus-visible[^{]*\{outline:2px solid/)
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
    const m = workspace(proj)
    const id = m.match(/<label class="tp-sec-title" for="([^"]+)">/)?.[1]
    expect(id).toBeTruthy()
    expect(m).toContain(`<select id="${id}" class="tp-goal-select"`)
    // Live goals first, then archived, each in its own group.
    expect(m.indexOf(`label="${t.workLiveGroup}"`)).toBeLessThan(m.indexOf(`label="${t.workArchivedGroup}"`))
    expect(m).toContain(`Old archived goal (${t.workArchivedTag})`)
  })
})

describe('selection: an opened session deselects the goal', () => {
  const open = workspaceReducer({ goalKey: 'A', sessionKey: null }, { type: 'openSession', key: 'W-a' })

  it('with a session open, the goal row is NOT selected; only the session row is', () => {
    const m = workspace(proj, open)
    expect(currentGoal(m)).toBeUndefined()
    expect(m).toContain(`<option value="" selected="">${t.workGoalPicker}…</option>`)
    expect(m.match(/aria-current="true"/g)).toHaveLength(1)
    expect(m).toMatch(/class="tp-srow" aria-current="true"[^>]*><span class="tp-srow-name">Direct worker/)
  })
  it('Back to lead restores the goal as selected', () => {
    const m = workspace(proj, workspaceReducer(open, { type: 'backToLead' }))
    expect(currentGoal(m)).toBe('Goal A')
    expect(m).not.toMatch(/class="tp-srow" aria-current="true"/)
  })
  it('a stale session key (not drawn in the middle) never deselects the goal', () => {
    expect(selectedGoalKey('A', null)).toBe('A')
    expect(selectedGoalKey('A', 'W-a')).toBeNull()
    expect(currentGoal(workspace(proj, { goalKey: 'B', sessionKey: 'W-a' }))).toBe('Goal B')
  })
})

describe('side panel tabs', () => {
  const panes = {
    project: <p data-pane="project">PROJECT-PANE</p>,
    subscriptions: <p data-pane="subscriptions">SUBS-PANE</p>,
    library: <p data-pane="library">LIBRARY-PANE</p>,
  }
  const tabbed = (tab: SideTab, collapsed = false) =>
    html(
      <Workspace p={proj} slotsByKey={new Map(SLOTS.map(s => [s.key, s]))} initial={{ goalKey: 'A' }}
        onOpenFull={noop} onNewGoal={noop} onSettings={noop} tab={tab} collapsed={collapsed} panes={panes} />,
    )
  const selectedTab = (m: string) => m.match(/role="tab" id="tp-tab-([a-z]+)" aria-selected="true"/)?.[1]

  it('is a tablist of Overview, Work, Project, Subscriptions, Library with roving focus', () => {
    const m = tabbed('overview')
    expect(m).toContain('role="tablist"')
    const tabs = [...m.matchAll(/role="tab" id="tp-tab-([a-z]+)" aria-selected="(true|false)" aria-controls="tp-tabpanel-\1" tabindex="(-?\d)"/g)]
    expect(tabs.map(x => x[1])).toEqual(['overview', 'work', 'project', 'subscriptions', 'library'])
    expect(tabs.map(x => x[3])).toEqual(['0', '-1', '-1', '-1', '-1'])
    expect(m).toMatch(/role="tabpanel" id="tp-tabpanel-overview" aria-labelledby="tp-tab-overview"/)
  })
  it('Overview is the default tab', () => {
    const m = html(
      <Workspace p={proj} slotsByKey={new Map(SLOTS.map(s => [s.key, s]))}
        onOpenFull={noop} onNewGoal={noop} onSettings={noop} panes={panes} />,
    )
    expect(selectedTab(m)).toBe('overview')
    expect(m).toContain(`aria-label="${t.overviewLabel}"`)
  })
  it('Work shows the goal picker and the full sessions tree; other panes are NOT stacked under it', () => {
    const m = tabbed('work')
    expect(selectedTab(m)).toBe('work')
    expect(m).toContain(t.goalsListLabel)
    expect(m).toContain('class="tp-goal-select"')
    expect(m).toContain('Direct worker')
    expect(m).toContain('Deep worker')
    for (const pane of ['PROJECT-PANE', 'SUBS-PANE', 'LIBRARY-PANE']) expect(m).not.toContain(pane)
    expect(m).not.toContain('tp-fold')
    expect(m).not.toContain('<details')
  })
  it('switching tabs swaps the panel content and the selected tab', () => {
    for (const [tab, pane] of [['project', 'PROJECT-PANE'], ['subscriptions', 'SUBS-PANE'], ['library', 'LIBRARY-PANE']] as const) {
      const m = tabbed(tab)
      expect(selectedTab(m)).toBe(tab)
      expect(m).toContain(pane)
      expect(m).not.toContain('tp-goal-select')
      expect(m).not.toContain('tp-ov-')
      expect(m.match(/data-pane=/g)).toHaveLength(1)
    }
  })
  it('the strip carries the collapse toggle; collapsed hides the panel and puts the reopen toggle in the middle header', () => {
    const open = tabbed('overview')
    expect(open).toMatch(/class="tp-tabstrip"[\s\S]*aria-label="Hide side panel" aria-expanded="true"/)
    expect(open).not.toContain('Show side panel')
    const shut = tabbed('overview', true)
    expect(shut).toContain('tp-sidewrap tp-sidewrap-collapsed')
    expect(shut).toMatch(/class="tp-chead"[\s\S]*aria-label="Show side panel" aria-expanded="false"/)
  })
  it('the collapsed state and open tab are read back from storage on load', () => {
    const store = new Map([[STORAGE_KEY, JSON.stringify({ left: 300, right: 320, collapsed: true, tab: 'library' })]])
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
    function Probe() {
      const l = usePanelLayout(storage)
      return <i data-collapsed={String(l.prefs.collapsed)} data-tab={l.prefs.tab} data-left={l.widths.left} />
    }
    expect(html(<Probe />)).toContain('data-collapsed="true" data-tab="library" data-left="300"')
  })
})

describe('column grabbers', () => {
  it('are focusable vertical separators with an accessible name and range, and no buttons', () => {
    function Probe() {
      const l = usePanelLayout(null)
      return <><ColumnGrabber side="left" layout={l} /><ColumnGrabber side="right" layout={l} /></>
    }
    const m = html(<Probe />)
    expect(m).toMatch(/role="separator" aria-orientation="vertical" aria-label="Resize projects column" aria-valuenow="260" aria-valuemin="180" aria-valuemax="420" tabindex="0"/)
    expect(m).toContain('aria-label="Resize side panel"')
    expect(m).not.toContain('<button')
  })
  it('hide where the columns stack, and the stack still shows the side panel', () => {
    const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')
    const narrow = css.slice(css.indexOf('@media (max-width:760px)'))
    expect(narrow).toMatch(/\.tp-grab,\.tp-panel-toggle[^{]*\{display:none\}/)
    expect(narrow).toContain('.tp-sidewrap-collapsed{display:flex}')
  })
})

describe('host composer', () => {
  it('the middle chat is the host ChatEmbed, and app.json grants what its composer needs', () => {
    const app = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8'))
    // /api/chat: send + the in-transcript tool approvals (slot approve endpoint).
    // /api/upload/file: the attach control, paste and drop.
    // /api/slash-commands, /api/file-search: the / and @ pickers.
    for (const path of ['/api/chat', '/api/upload/file', '/api/slash-commands', '/api/file-search']) {
      expect(app.permissions.api).toContain(path)
    }
    expect(app.version).toBe('0.9.4')
    expect(workspace(proj, { goalKey: 'A', sessionKey: 'W-a' }).match(/data-stub="chat-embed"/g)).toHaveLength(1)
  })
})
