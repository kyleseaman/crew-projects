import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { buildFolderProjects, buildInbox, sessionTree, type Folder, type FolderProject, type Loop, type Slot } from './model'
import { buildOverview } from './overview'
import { OverviewPane } from './Overview'
import { CenterColumn, GoalPicker, SessionsTree } from './Workspace'
import { SubAttentionChips, subAttentionText } from './SubAttention'
import { t } from './strings'

// Pins 0.9.2: the goal header pill (and every other lead-labelled display)
// shows the LEAD's own status. The owner saw the Slack Code goal read
// "Stalled" beside "Lead · kirocrew-team-lead · 22m ago · Loop 26/80" while
// the lead was idle between patrol cycles: one interrupted worker deep in the
// tree had been folded into the lead's pill. Sessions under the lead that
// want the person are now a separate, named "N stalled" / "N need you" chip.

const ago = (min: number) => new Date(Date.UTC(2026, 9, 19, 12, 0) - min * 60_000).toISOString()
const FOLDERS: Folder[] = [{ id: 'f', name: 'Proj', project_dir: '/repo' }]
const LOOP: Loop = { slot_key: 'L', active: true, cycle_count: 26, max_cycles: 80 }

const leadSlot = (extra: Partial<Slot> = {}): Slot => ({
  key: 'L', agent: 'kirocrew-team-lead', folder_id: 'f', title: 'Slack Code', last_activity_ts: ago(22), ...extra,
})
// A sub-conductor with an interrupted worker two levels down.
const UNDER: Slot[] = [
  { key: 'C', agent: 'kirocrew-conductor', created_by: 'L', title: 'Sub conductor', last_activity_ts: ago(30) },
  { key: 'W', agent: 'kirocrew-worker', created_by: 'C', title: 'Rebase worker', interrupted: true, last_activity_ts: ago(25) },
  { key: 'W2', agent: 'kirocrew-worker', created_by: 'L', title: 'Fine worker', last_activity_ts: ago(40) },
]

const build = (slots: Slot[], loops: Loop[] = []): FolderProject =>
  buildFolderProjects(FOLDERS, slots, loops, []).find(p => p.folder.id === 'f') as FolderProject

const noop = () => {}
const html = (el: JSX.Element) =>
  renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}>{el}</QueryClientProvider>)
const header = (p: FolderProject) => {
  const m = html(<CenterColumn p={p} goal={p.goals[0]} session={null} onBack={noop} onOpenFull={noop} onNewGoal={noop} onSettings={noop} onOpenSession={noop} />)
  return /<div class="tp-chead-meta[^"]*">([\s\S]*?)<\/header>/.exec(m)?.[1] ?? ''
}

describe('goal status: the lead\'s own, never the rollup', () => {
  it('lead idle + interrupted worker: lead Idle, rollup stalled, the worker named', () => {
    const goal = build([leadSlot(), ...UNDER]).goals[0]
    expect(goal.leadStatus).toBe('idle')
    expect(goal.rollupStatus).toBe('stalled')
    expect(goal.subAttention.stalled.map(m => m.slot.title)).toEqual(['Rebase worker'])
    expect(goal.subAttention.needsYou).toEqual([])
  })

  it('an idle lead on an active loop reads Working even with a stalled worker under it', () => {
    const goal = build([leadSlot(), ...UNDER], [LOOP]).goals[0]
    expect(goal.leadStatus).toBe('working')
    expect(goal.subAttention.stalled).toHaveLength(1)
  })

  it('lead interrupted: lead Stalled, and the lead is never listed under itself', () => {
    const goal = build([leadSlot({ interrupted: true }), UNDER[2]]).goals[0]
    expect(goal.leadStatus).toBe('stalled')
    expect(goal.subAttention).toEqual({ needsYou: [], stalled: [] })
  })

  it('a lead waiting on approval outranks its loop', () => {
    expect(build([leadSlot({ pending_approval: true })], [LOOP]).goals[0].leadStatus).toBe('needs_you')
  })
})

describe('middle-column goal header', () => {
  it('lead idle + interrupted worker: pill Idle, and a "1 stalled" chip naming the worker', () => {
    const h = header(build([leadSlot(), ...UNDER]))
    expect(h).toContain(`>${t.status.idle}</span>`)
    expect(h).not.toContain(`>${t.status.stalled}</span>`)
    expect(h).toContain('data-testid="sub-attention-stalled"')
    expect(h).toContain(`>${t.subStalled(1)}</button>`)
    expect(h).toContain(`title="Rebase worker"`)
    expect(h).toContain(`aria-label="${t.subStalledAria(1)}"`)
    expect(h).toContain('aria-haspopup="menu"')
  })

  it('the Slack Code case: idle lead on Loop 26/80 reads Working, the chip still names the worker', () => {
    const h = header(build([leadSlot(), ...UNDER], [LOOP]))
    expect(h).toContain(`>${t.status.working}</span>`)
    expect(h).not.toContain(`>${t.status.stalled}</span>`)
    expect(h).toContain(t.loop('26/80'))
    expect(h).toContain(`>${t.subStalled(1)}</button>`)
  })

  it('lead interrupted: pill Stalled and no chip', () => {
    const h = header(build([leadSlot({ interrupted: true }), UNDER[2]]))
    expect(h).toContain(`>${t.status.stalled}</span>`)
    expect(h).not.toContain('tp-subatt')
  })

  it('needs-you sessions under the lead get their own named chip; zero draws nothing', () => {
    const slots = [leadSlot(), { ...UNDER[2], pending_approval: true }, { key: 'Q', agent: 'kirocrew-worker', created_by: 'L', title: 'Asker', needs_input: true }]
    const h = header(build(slots))
    expect(h).toContain(`>${t.status.idle}</span>`)
    expect(h).toContain(`>${t.subNeedsYou(2)}</button>`)
    expect(h).not.toContain('sub-attention-stalled')
    expect(header(build([leadSlot(), UNDER[2]]))).not.toContain('tp-subatt')
    expect(html(<SubAttentionChips attention={{ needsYou: [], stalled: [] }} onOpen={noop} />)).toBe('')
  })
})

describe('other lead-labelled displays', () => {
  it('Work goal picker: lead status, then the named counts', () => {
    const p = build([leadSlot(), ...UNDER])
    const m = html(<GoalPicker goals={p.goals} selectedKey="L" onSelect={noop} onNewGoal={noop} />)
    expect(m).toContain(`Slack Code · ${t.status.idle} · ${t.subStalled(1)}</option>`)
    expect(subAttentionText(p.goals[0].subAttention)).toBe(t.subStalled(1))
  })

  it('Overview Goals row: the lead\'s own status, and NO sub-session chips (0.9.3: they repeat Needs you)', () => {
    const p = build([leadSlot(), ...UNDER])
    const ov = buildOverview(p)
    expect(ov.goals[0].leadStatus).toBe('idle')
    const m = html(<OverviewPane p={p} onOpenSession={noop} onSelectGoal={noop} />)
    const goals = m.slice(m.indexOf(t.ovGoals(1)), m.indexOf(t.ovPrs(0)))
    expect(goals).toContain(`<span class="tp-tone-idle">${t.status.idle}</span>`)
    expect(goals).not.toContain('tp-tone-stalled')
    expect(goals).not.toContain('tp-subatt')
    // The header keeps them.
    expect(header(p)).toContain('data-testid="sub-attention-stalled"')
  })
})

describe('genuine rollups still count every session', () => {
  const p = build([leadSlot(), ...UNDER])

  it('the left project card dot and the inbox include the stalled worker', () => {
    expect(p.status).toBe('stalled')
    expect(buildInbox([p]).map(i => i.slotKey)).toEqual(['W'])
  })

  it('Overview Needs you lists it, and the summary counts it as one need-you row', () => {
    const ov = buildOverview(p)
    expect(ov.summary.needYou).toBe(1)
    expect(ov.needs.map(n => n.slotKey)).toEqual(['W'])
  })

  it('the Work tree row keeps the worker\'s own Stalled state', () => {
    const m = html(<SessionsTree nodes={sessionTree(p.goals[0])} openKey={null} onOpen={noop} />)
    expect(m).toMatch(/Rebase worker<\/span><span class="tp-srow-tone tp-tone-stalled">Stalled<\/span>/)
  })
})
