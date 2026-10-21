import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { buildFolderProjects, type Folder, type FolderProject, type Slot } from './model'
import { buildOverview, firstSentence, leadQuote, needHint } from './overview'
import { OverviewPane } from './Overview'
import { Workspace } from './Workspace'
import { t } from './strings'

// Pins the 0.9.3 Overview: one summary line instead of the four "Right now"
// tiles (which the owner found meaningless: they counted every chat), goal
// rows with the lead's own status, a quote of its latest words and a meta
// line, and plain Needs you rows (no edge bar, no tint) that keep the chat
// they opened highlighted while the panel stays on Overview.

const ago = (min: number) => new Date(Date.UTC(2026, 9, 19, 12, 0) - min * 60_000).toISOString()
const link = (number: number) => ({ url: `https://x/pull/${number}`, number, state: 'open' as const })

const SLOTS: Slot[] = [
  // Goal A: lead idle, spoke last; four chats under it, two of them waiting.
  { key: 'A', agent: 'kirocrew-team-lead', folder_id: 'f', title: 'Goal A', last_activity_ts: ago(4),
    waiting_for_input: true, last_message: 'Merged #12. Next I rebase #13 on main.', source_links: [link(12)] },
  { key: 'A1', agent: 'kirocrew-worker', created_by: 'A', title: 'Shell worker', pending_approval: true,
    pending_approval_info: { tool: 'npm test', tool_kind: 'execute' }, last_activity_ts: ago(2), source_links: [link(13), link(12)] },
  { key: 'A2', agent: 'kirocrew-worker', created_by: 'A', title: 'Asking worker', needs_input: true, last_activity_ts: ago(6) },
  { key: 'A3', agent: 'kirocrew-worker', created_by: 'A', title: 'Stuck worker', interrupted: true, last_activity_ts: ago(30) },
  { key: 'A4', agent: 'kirocrew-worker', created_by: 'A', title: 'Busy worker', running: true, last_activity_ts: ago(1) },
  // Goal B: lead running; its last_message is unknown-role -> no quote.
  { key: 'B', agent: 'kirocrew-conductor', folder_id: 'f', title: 'Goal B', running: true, last_activity_ts: ago(3),
    last_message: 'please look at the flaky test' },
  // Plain chats in the project: counted nowhere on this tab.
  { key: 'P1', agent: 'kirocrew', folder_id: 'f', title: 'Plain chat', running: true },
  { key: 'P2', agent: 'kirocrew', folder_id: 'f', title: 'Plain asking chat', needs_input: true },
]
const FOLDERS: Folder[] = [{ id: 'f', name: 'Proj', project_dir: '/repo' }]
const proj = buildFolderProjects(FOLDERS, SLOTS, [], []).find(p => p.folder.id === 'f') as FolderProject
const noop = () => {}
const html = (el: JSX.Element) =>
  renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}>{el}</QueryClientProvider>)
const pane = (shownKey: string | null = null) =>
  html(<OverviewPane p={proj} shownKey={shownKey} onOpenSession={noop} onSelectGoal={noop} />)
const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')

describe('summary line', () => {
  const ov = buildOverview(proj)
  it('counts GOALS by their lead\'s status, not chats; need-you is the Needs you rows', () => {
    // 8 chats, 2 goals: A idle, B working. Needs you: A1, A2, A3 (P2 is no goal's).
    expect(ov.summary).toEqual({ goals: 2, working: 1, idle: 1, needYou: 3 })
    expect(ov.needs.map(n => n.slotKey)).toEqual(['A1', 'A2', 'A3'])
  })
  it('reads as one line, need-you in the warning colour and left out at zero', () => {
    const m = pane()
    const line = /<p class="tp-ov-summary"[^>]*>([\s\S]*?)<\/p>/.exec(m)?.[1] ?? ''
    expect(line.replace(/<[^>]+>/g, '')).toBe('2 goals · 1 working · 1 idle · 3 need you')
    expect(line).toContain(`<span class="tp-ov-summary-warn">${t.ovSumNeedYou(3)}</span>`)
    const calm = buildFolderProjects(FOLDERS, SLOTS.map(({ pending_approval: _a, needs_input: _b, interrupted: _c, ...s }) => s), [], [])[0]
    const q = html(<OverviewPane p={calm} onOpenSession={noop} onSelectGoal={noop} />)
    expect(q).not.toContain('tp-ov-summary-warn')
    expect(q).not.toContain('need you')
  })
  it('the "Right now" tiles are gone', () => {
    const m = pane()
    expect(m).not.toMatch(/tp-ov-tile|Right now|Goals live/)
    expect(css).not.toContain('.tp-ov-tile')
  })
})

describe('goal rows', () => {
  const m = pane()
  const goals = m.slice(m.indexOf(t.ovGoals(2)), m.indexOf(t.ovPrs(2)))
  it('title, the lead\'s own status, the lead\'s quote, and chats · PRs · active', () => {
    expect(goals).toContain('<span class="tp-ov-name">Goal A</span>')
    expect(goals).toContain(`<span class="tp-tone-idle">${t.status.idle}</span>`)
    expect(goals).toContain('<q class="tp-ov-quote" title="Lead’s latest message">Merged #12.</q>')
    expect(goals).toMatch(/5 chats · 2 PRs · active /)
    expect(goals).toMatch(/1 chat · 0 PRs · active /)
  })
  it('never quotes a lead whose latest message may be the person\'s (Goal B is running)', () => {
    expect(goals).not.toContain('flaky test')
    expect(goals.match(/tp-ov-quote/g)).toHaveLength(1)
  })
  it('has no sub-session chips (they repeat Needs you); the middle header keeps them', () => {
    expect(goals).not.toContain('tp-subatt')
    expect(goals).not.toMatch(/\d+ stalled|\d+ need you/)
  })
  it('a row is one button that selects the goal', () => {
    expect(goals.match(/<button type="button" class="tp-ov-goal"/g)).toHaveLength(2)
  })
  it('quote helpers: first sentence only, only from the lead\'s own words', () => {
    expect(firstSentence('Merged #12. Next I rebase.')).toBe('Merged #12.')
    expect(firstSentence('v0.9.2 is out! Next round?')).toBe('v0.9.2 is out!')
    expect(firstSentence('No terminator here…')).toBe('No terminator here…')
    expect(leadQuote({ key: 'x', last_message: 'Hi. There.' })).toBe('')
    expect(leadQuote({ key: 'x', last_message: 'Hi. There.', waiting_for_input: false })).toBe('')
    expect(leadQuote({ key: 'x', last_message: 'Hi. There.', waiting_for_input: true })).toBe('Hi.')
    expect(leadQuote({ key: 'x', has_options: true, prompt_preview: 'Pick one. A or B' })).toBe('Pick one.')
  })
})

describe('Needs you rows', () => {
  const m = pane()
  const rows = [...m.matchAll(/<button type="button" class="tp-ov-need tp-ov-need-(\w+)"[^>]*>([\s\S]*?)<\/button>/g)]
  it('icon, title, "<Label> · <hint>", relative time', () => {
    expect(rows.map(r => r[1])).toEqual(['approval', 'needs_input', 'stalled'])
    const text = rows.map(r => r[2].replace(/<svg[\s\S]*?<\/svg>/, '').replace(/<[^>]+>/g, '|').replace(/\|+/g, '|'))
    expect(text[0]).toMatch(/^\|Shell worker\|.+ ago\|Approval\| · run a shell command\|$/)
    expect(text[1]).toMatch(/^\|Asking worker\|.+ ago\|Question\| · waiting for your answer\|$/)
    expect(text[2]).toMatch(/^\|Stuck worker\|.+ ago\|Stalled\| · needs a resume\|$/)
    for (const r of rows) expect(r[2]).toMatch(/^<svg[^>]*class="[^"]*tp-ov-need-ico/)
  })
  it('hints: the tool kind when the slot exposes it, else a plain fallback', () => {
    expect(needHint({ key: 'x', pending_approval_info: { tool_kind: 'edit' } }, 'approval')).toBe('edit a file')
    expect(needHint({ key: 'x', pending_approval_info: { tool_kind: 'spawn' } }, 'approval')).toBe('start a sub-agent')
    expect(needHint({ key: 'x', pending_approval_info: { tool_kind: 'other' } }, 'approval')).toBe('waiting for your approval')
    expect(needHint({ key: 'x' }, 'approval')).toBe('waiting for your approval')
  })
  it('no coloured left border and no tinted background: colour is on the icon and label only', () => {
    const rules = [...css.matchAll(/(\.tp-ov-need[^{]*)\{([^}]*)\}/g)]
    expect(rules.length).toBeGreaterThan(0)
    for (const [, sel, body] of rules) {
      expect(body, sel).not.toMatch(/border-left/)
      expect(body, sel).not.toMatch(/color-mix\(in srgb,var\(--(warn|danger)\)/)
    }
    expect(css).toMatch(/\.tp-ov-needlist>li\+li\{border-top:1px solid var\(--border\)\}/)
    expect(css).toMatch(/\.tp-ov-need:hover\{background:var\(--bg-hover\)\}/)
  })
  it('the chat open in the middle reads as selected; nothing else does', () => {
    expect(pane().match(/aria-current="true"/g)).toBeNull()
    const open = pane('A3')
    expect(open.match(/aria-current="true"/g)).toHaveLength(1)
    expect(open).toMatch(/class="tp-ov-need tp-ov-need-stalled" aria-current="true"/)
  })
  it('a click opens the chat in the middle and keeps the panel on Overview with the row selected', () => {
    const ws = html(
      <Workspace p={proj} slotsByKey={new Map(SLOTS.map(s => [s.key, s]))} initial={{ goalKey: 'A', sessionKey: 'A3' }}
        onOpenFull={noop} onNewGoal={noop} onSettings={noop} tab="overview" />,
    )
    expect(ws).toMatch(/id="tp-tab-overview" aria-selected="true"/)
    expect(ws).toContain('data-slot="A3"')
    expect(ws).toContain(t.backToLead)
    expect(ws).toMatch(/class="tp-ov-need tp-ov-need-stalled" aria-current="true"/)
    // The row's click only opens the chat: it never switches the tab.
    const src = readFileSync(new URL('./Workspace.tsx', import.meta.url), 'utf8')
    expect(src).toMatch(/onOpenSession=\{\(gk, sk\) => dispatch\(\{ type: 'openInGoal', goalKey: gk, sessionKey: sk \}\)\}/)
  })
  it('a row drops off once its slot no longer needs the person', () => {
    const later = SLOTS.map(s => (s.key === 'A1' ? { ...s, pending_approval: false, running: true } : s))
    const p = buildFolderProjects(FOLDERS, later, [], [])[0]
    expect(buildOverview(p).needs.map(n => n.slotKey)).toEqual(['A2', 'A3'])
  })
})
