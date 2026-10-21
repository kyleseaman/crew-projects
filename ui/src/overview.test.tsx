import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import ProjectHub, { NeedsChip } from './App'
import { buildFolderProjects, workspaceReducer, type Folder, type FolderProject, type Slot } from './model'
import { buildOverview, groupPrs, RECENT_LIMIT } from './overview'
import { OverviewPane } from './Overview'
import { Workspace } from './Workspace'
import { SIDE_TABS } from './layout'
import { groupState } from './library'
import { autonudgeFixture, foldersFixture, sessionsPageFixture, slotsFixture } from './dev/fixtures'
import { t } from './strings'

// Pins the Overview tab (0.8): its numbers, its sections, and that it is the
// ONLY place sessions waiting on the person are listed. 0.7 drew a full-width
// "Waiting on you" list above the columns; with six waiting sessions it ate
// two thirds of the viewport and squeezed the chat to three lines.

const ago = (min: number) => new Date(Date.UTC(2026, 9, 19, 12, 0) - min * 60_000).toISOString()
const link = (number: number, extra: Record<string, unknown> = {}) => ({ url: `https://x/pull/${number}`, number, ...extra })

const SLOTS: Slot[] = [
  { key: 'L', agent: 'kirocrew-team-lead', folder_id: 'f', title: 'Lead goal', running: true, last_activity_ts: ago(1),
    source_links: [link(1, { state: 'open', ci: 'failed' }), link(2, { state: 'merged', ci: 'failed' })] },
  { key: 'C', agent: 'kirocrew-conductor', folder_id: 'f-sub', created_by: 'L', parent: { slot: 'L', key: 'L' }, title: 'Conductor', pending_approval: true, last_activity_ts: ago(3) },
  { key: 'W1', agent: 'kirocrew-worker', created_by: 'C', parent: { slot: 'C', key: 'C' }, title: 'Stalled worker', interrupted: true, last_activity_ts: ago(30) },
  { key: 'W2', agent: 'kirocrew-worker', created_by: 'L', title: 'Asking worker', needs_input: true, last_activity_ts: ago(5),
    source_links: [link(3, { state: 'open', ci: 'running' }), link(1, { state: 'open', ci: 'failed' })] },
  { key: 'W3', agent: 'kirocrew-worker', created_by: 'L', title: 'Idle worker', last_activity_ts: ago(10),
    source_links: [link(4, { state: 'closed' }), link(5)] },
  { key: 'G2', agent: 'kirocrew-conductor', folder_id: 'f', title: 'Conductor-led goal', last_activity_ts: ago(20) },
]
const FOLDERS: Folder[] = [
  { id: 'f', name: 'Proj', project_dir: '/repo' },
  { id: 'f-sub', name: 'kirocrew-conductor', parent_id: 'f' },
]
const proj = buildFolderProjects(FOLDERS, SLOTS, [], []).find(p => p.folder.id === 'f') as FolderProject
const noop = () => {}
const html = (el: JSX.Element, qc = new QueryClient()) =>
  renderToStaticMarkup(<QueryClientProvider client={qc}>{el}</QueryClientProvider>)

describe('buildOverview', () => {
  const ov = buildOverview(proj)

  it('Needs you lists approvals, then input, then stalled, each tied to its goal', () => {
    expect(ov.needs.map(n => [n.slotKey, n.kind, n.goalKey])).toEqual([
      ['C', 'approval', 'L'],
      ['W2', 'needs_input', 'L'],
      ['W1', 'stalled', 'L'],
    ])
  })
  it('the summary counts GOALS by their lead\'s status, plus the Needs you rows', () => {
    // 6 chats in this project; 2 goals: L (running -> working), G2 (idle).
    expect(ov.summary).toEqual({ goals: 2, working: 1, idle: 1, needYou: 3 })
  })
  it('a non-goal chat is counted nowhere', () => {
    const withChat = buildFolderProjects(FOLDERS, [...SLOTS, { key: 'X', agent: 'kirocrew', folder_id: 'f', title: 'Plain chat', running: true, pending_approval: true }], [], [])
      .find(x => x.folder.id === 'f') as FolderProject
    const o = buildOverview(withChat)
    expect(o.summary).toEqual(ov.summary)
    expect(o.needs.map(n => n.slotKey)).not.toContain('X')
  })
  it('each goal row carries chats, PRs and activity, and quotes the lead only when the row says it spoke last', () => {
    expect(ov.goals.map(g => [g.title, g.chats, g.prs])).toEqual([['Lead goal', 5, 5], ['Conductor-led goal', 1, 0]])
    // L is running: its last_message may be the person's prompt -> no quote.
    expect(ov.goals.every(g => g.quote === '')).toBe(true)
  })
  it('one goal row per live goal, conductor-led goals included', () => {
    expect(ov.goals.map(g => g.title)).toEqual(['Lead goal', 'Conductor-led goal'])
  })
  it('Recent is newest first, capped, and skips sessions already under Needs you (except approvals)', () => {
    expect(ov.recent.map(r => [r.slotKey, r.kind])).toEqual([
      ['L', 'working'],
      ['C', 'approval'],
      ['W3', 'finished'],
      ['G2', 'finished'],
    ])
    expect(ov.recent.length).toBeLessThanOrEqual(RECENT_LIMIT)
  })
})

describe('pull request groups', () => {
  it('reads only what each link carries: merged/closed win over checks; no state and no checks is unknown', () => {
    const g = groupPrs([
      link(1, { state: 'open', ci: 'failed' }),
      link(2, { state: 'merged', ci: 'failed' }),
      link(3, { state: 'open', ci: 'running' }),
      link(4, { state: 'closed' }),
      link(5),
      link(6, { kind: 'issue', state: 'open' }),
    ] as never)
    expect(Object.fromEntries(Object.entries(g).map(([k, v]) => [k, (v as { number: number }[]).map(l => l.number)]))).toEqual({
      failing: [1], open: [3], merged: [2], closed: [4], unknown: [5],
    })
  })
  it('the project PR list is de-duplicated across sessions', () => {
    expect(buildOverview(proj).prTotal).toBe(5)
  })
})

describe('OverviewPane', () => {
  const m = html(<OverviewPane p={proj} onOpenSession={noop} onSelectGoal={noop} />)

  it('draws its sections in the approved order', () => {
    const order = ['data-testid="ov-summary"', t.ovNeedsYou(3), t.ovGoals(2), t.ovPrs(5), t.ovRecent].map(s => m.indexOf(s))
    expect(order.every(i => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })
  it('PR summary line and labelled groups; chips open in a new tab without an opener', () => {
    expect(m).toContain('1 failing · 1 open · 1 merged · 1 closed · 1 no status')
    expect(m).toContain(t.ovPrFailing)
    expect(m).toMatch(/href="https:\/\/x\/pull\/1" target="_blank" rel="noopener noreferrer"/)
  })
  it('each Needs you row is a button with its reason', () => {
    expect(m.match(/class="tp-ov-need tp-ov-need-/g)).toHaveLength(3)
    expect(m).toContain(`<span class="tp-ov-need-label">${t.ovNeedLabel.stalled}</span> · needs a resume`)
  })
  it('leaves Needs you out when nothing waits', () => {
    const calm = SLOTS.map(({ pending_approval: _a, needs_input: _n, interrupted: _i, ...s }) => s)
    const p = buildFolderProjects(FOLDERS, calm, [], []).find(x => x.folder.id === 'f') as FolderProject
    const q = html(<OverviewPane p={p} onOpenSession={noop} onSelectGoal={noop} />)
    expect(q).not.toContain('tp-ov-needs')
    expect(q).toContain('data-testid="ov-summary"')
    expect(q).not.toContain(t.ovSumNeedYou(0))
  })
  it('a Needs you click selects that goal and opens that session in the middle', () => {
    expect(workspaceReducer({ goalKey: 'G2', sessionKey: null }, { type: 'openInGoal', goalKey: 'L', sessionKey: 'W1' }))
      .toEqual({ goalKey: 'L', sessionKey: 'W1' })
    expect(workspaceReducer({ goalKey: 'G2', sessionKey: 'x' }, { type: 'openInGoal', goalKey: 'L', sessionKey: 'L' }))
      .toEqual({ goalKey: 'L', sessionKey: null })
  })
})

describe('waiting sessions are listed ONLY in the Overview tab', () => {
  const slotsByKey = new Map(SLOTS.map(s => [s.key, s]))
  const tab = (id: (typeof SIDE_TABS)[number]) =>
    html(<Workspace p={proj} slotsByKey={slotsByKey} onOpenFull={noop} onNewGoal={noop} onSettings={noop} tab={id} />)

  it('the Overview tab lists them; no other tab does', () => {
    expect(tab('overview')).toContain('tp-ov-needs')
    for (const id of SIDE_TABS.filter(x => x !== 'overview')) expect(tab(id)).not.toContain('tp-ov-need')
  })
  it('the page above the columns carries only a one-line chip, never a list', () => {
    // Full page, server-rendered with the harness fixtures already loaded.
    const qc = new QueryClient()
    qc.setQueryData(['project-hub', 'folders'], foldersFixture)
    qc.setQueryData(['project-hub', 'slots'], slotsFixture)
    qc.setQueryData(['project-hub', 'loops'], autonudgeFixture)
    qc.setQueryData(['project-hub', 'sessions'], sessionsPageFixture)
    const page = html(<ProjectHub />, qc)
    // Markup only: the page's own <style> block names every class.
    const above = page.slice(0, page.indexOf('class="tp-split')).replace(/<style>[\s\S]*?<\/style>/, '')
    expect(page.indexOf('class="tp-split')).toBeGreaterThan(0)
    const waiting = slotsFixture.filter(s => s.pending_approval || s.needs_input || s.interrupted).length
    expect(waiting).toBeGreaterThanOrEqual(6)
    expect(above.match(/class="tp-needschip"/g)).toHaveLength(1)
    expect(above).not.toMatch(/<(ul|li)\b|role="list"|tp-inbox|tp-ov-need/)
    // Nothing from 0.7's inbox survives in the source.
    const src = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    expect(src).not.toMatch(/InboxBar|tp-inbox|buildInbox/)
  })
  it('the chip is one button naming the count, and hides at zero', () => {
    expect(html(<NeedsChip count={6} onOpen={noop} />)).toMatch(/^<button type="button" class="tp-needschip"[^>]*>.*6<span class="tp-needschip-word"> need you<\/span><\/button>$/)
    expect(html(<NeedsChip count={1} onOpen={noop} />)).toContain('1<span class="tp-needschip-word"> needs you</span>')
    expect(html(<NeedsChip count={0} onOpen={noop} />)).toBe('')
  })
  it('the columns fill the remaining height at any number of waiting sessions', () => {
    const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')
    expect(css).toMatch(/\.tp-root\{flex:1;min-height:0;display:flex;flex-direction:column/)
    expect(css).toMatch(/\.tp-split\{[^}]*flex:1;min-height:0/)
    expect(css).toMatch(/\.tp-center\{min-height:0/)
  })
})

describe('Library group state (the 0.7 stuck placeholders)', () => {
  it('rows show as soon as their own query answers; errors and loading are per group', () => {
    expect(groupState({ artifacts: [] }, null, false)).toEqual({ loading: false, error: '' })
    expect(groupState(undefined, null, true)).toEqual({ loading: true, error: '' })
    expect(groupState(undefined, new Error('timed out after 45 s'), false)).toEqual({ loading: false, error: 'timed out after 45 s' })
    // A later failed refresh keeps the rows already received.
    expect(groupState({ docs: [] }, new Error('boom'), false)).toEqual({ loading: false, error: '' })
  })
  it('the Library no longer lists pull requests or draws skeleton placeholders', () => {
    const src = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    const lib = src.slice(src.indexOf('export function LibrarySection'), src.indexOf('function SubscriptionRow'))
    expect(lib).not.toMatch(/PrChip|prs|Skeleton|tp-lib-skel/)
  })
})
