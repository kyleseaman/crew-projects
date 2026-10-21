import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import {
  buildProjects,
  buildTaskBoard,
  ledgerHasData,
  taskTone,
  waitsOnPerson,
  type LedgerItem,
  type LedgerRead,
  type Slot,
  type TaskTone,
} from './model'
import { GoalTasks, TaskBoardView } from './Workspace'
import { t } from './strings'

// Pins the task board drawn from a goal lead's work ledger, and its fallback
// to the sessions tree when there is no readable ledger.

const SLOTS: Slot[] = [
  { key: 'L', agent: 'kirocrew-team-lead', title: 'Goal' },
  { key: 'C', agent: 'kirocrew-conductor', created_by: 'L', title: 'Sub conductor', running: true },
  { key: 'W1', agent: 'kirocrew-worker', created_by: 'C', title: 'Nested worker', running: true },
  { key: 'W2', agent: 'kirocrew-worker', created_by: 'L', title: 'Approval worker', pending_approval: true },
  { key: 'W3', agent: 'kirocrew-worker', created_by: 'L', title: 'Unbound worker' },
]
const slotsByKey = new Map(SLOTS.map(s => [s.key, s]))
const goal = buildProjects(SLOTS, [])[0]

const item = (over: Partial<LedgerItem>): LedgerItem => ({ item_id: 'it', title: 'T', state: 'open', ...over })

const LEAD: LedgerRead = {
  items: [
    item({ item_id: 'a', title: 'Sub-conductor task', status: 'progress', worker_session_key: 'C', summary: 'Two of three in.' }),
    // Waits on a pending tool approval the worker never reported.
    item({ item_id: 'b', title: 'Approval task', status: 'progress', worker_session_key: 'W2' }),
    item({ item_id: 'c', title: 'Decision task', status: 'question', reason: 'needs_human', summary: 'Pick A or B.' }),
    item({ item_id: 'd', title: 'Landed task', state: 'accepted', status: 'done' }),
  ],
}
const SUB: LedgerRead = { items: [item({ item_id: 'n1', title: 'Nested task', status: 'progress', worker_session_key: 'W1' })] }
const board = buildTaskBoard(goal, LEAD, slotsByKey, k => (k === 'C' ? SUB : null))
const html = (el: JSX.Element) =>
  renderToStaticMarkup(<QueryClientProvider client={new QueryClient()}>{el}</QueryClientProvider>)
const noop = () => {}

describe('task state colours', () => {
  const cases: Array<[Partial<LedgerItem>, Slot | undefined, TaskTone]> = [
    [{ state: 'accepted' }, undefined, 'done'],
    [{ state: 'rejected' }, undefined, 'stuck'],
    [{ state: 'abandoned' }, undefined, 'stuck'],
    [{ status: 'blocked', reason: 'approval' }, undefined, 'needs_you'],
    [{ status: 'question', reason: 'needs_human' }, undefined, 'needs_you'],
    [{ status: 'progress' }, { key: 'w', pending_approval: true }, 'needs_you'],
    [{ status: 'blocked' }, undefined, 'stuck'],
    [{ status: 'progress', stale: true }, undefined, 'stuck'],
    [{ status: 'progress' }, { key: 'w', interrupted: true }, 'stuck'],
    [{ status: 'done' }, undefined, 'waiting'],
    [{ status: 'question' }, undefined, 'waiting'],
    [{ status: 'progress' }, undefined, 'working'],
    [{}, { key: 'w', running: true }, 'working'],
    [{}, undefined, 'waiting'],
  ]
  it.each(cases)('%j on %j is %s', (over, slot, tone) => {
    expect(taskTone(item(over), slot)).toBe(tone)
  })
  it('a person-reason on a closed item never asks the person', () => {
    expect(waitsOnPerson(item({ state: 'accepted', status: 'question', reason: 'needs_human' }))).toBeNull()
  })
  it('every tone has a colour rule on a theme token', () => {
    const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')
    const token: Record<TaskTone, string> = {
      done: '--ok', working: '--info', needs_you: '--warn', stuck: '--danger', waiting: '--muted',
    }
    for (const [tone, v] of Object.entries(token)) {
      expect(css).toMatch(new RegExp(`\\.tp-tone-${tone}[^{]*\\{color:var\\(${v}`))
    }
  })
})

describe('board counts and rows', () => {
  it('counts top-level done of total', () => {
    expect([board.done, board.total]).toEqual([1, 4])
    expect(html(<TaskBoardView board={board} openKey={null} onOpen={noop} />)).toContain(t.tasksDone(1, 4))
  })
  it('nests a sub-conductor task list one level under its task', () => {
    expect(board.rows[0].children.map(r => r.title)).toEqual(['Nested task'])
    expect(board.rows[0].children[0].children).toEqual([])
    const m = html(<TaskBoardView board={board} openKey={null} onOpen={noop} />)
    const parent = m.indexOf('Sub-conductor task')
    const nested = m.indexOf('tp-tree-nested', parent)
    expect(nested).toBeGreaterThan(parent)
    expect(m.indexOf('Nested task')).toBeGreaterThan(nested)
  })
  it('rows with a live worker are buttons; an unbound task is static', () => {
    expect(board.rows.map(r => r.sessionKey)).toEqual(['C', 'W2', null, null])
    const m = html(<TaskBoardView board={board} openKey="W2" onOpen={noop} />)
    expect(m).toMatch(/class="tp-task" aria-current="true"><span class="tp-task-top"><span class="tp-task-title">Approval task/)
    expect(m).toContain('tp-task tp-task-static')
  })
  it('lists sessions bound to no task under Other sessions', () => {
    expect(board.otherSessions.map(m => m.slot.key)).toEqual(['W3'])
    const m = html(<GoalTasks goal={goal} board={board} openKey={null} onOpen={noop} />)
    expect(m).toContain(t.otherSessions)
    expect(m).toContain('Unbound worker')
  })
})

describe('Needs-you strip', () => {
  it('lists every task waiting on the person, with what it waits for', () => {
    expect(board.needsYou.map(r => [r.title, r.waitsFor])).toEqual([
      ['Approval task', 'approval'],
      ['Decision task', 'needs_human'],
    ])
    const m = html(<TaskBoardView board={board} openKey={null} onOpen={noop} />)
    expect(m).toContain(t.needsApproval)
    expect(m).toContain('Pick A or B.')
    expect(m).not.toContain(t.needsYouNone)
  })
  it('says Nothing right now when nothing waits', () => {
    const calm = buildTaskBoard(goal, { items: [item({ item_id: 'z', status: 'progress' })] }, slotsByKey)
    expect(calm.needsYou).toEqual([])
    expect(html(<TaskBoardView board={calm} openKey={null} onOpen={noop} />)).toContain(t.needsYouNone)
  })
})

describe('fallback to the sessions tree', () => {
  it('only a ledger with items counts as data; null, malformed or empty keep the tree', () => {
    expect(ledgerHasData(LEAD)).toBe(true)
    for (const v of [null, undefined, {}, { items: 'x' }, { items: [] }]) expect(ledgerHasData(v)).toBe(false)
  })
  it('the live app passes no ledger source and requests no ledger route', () => {
    const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    expect(app).not.toMatch(/crew-board|work-ledger|members\/[^'"`]*\/dashboard/)
    const manifest = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8'))
    expect(manifest.permissions.api.filter((p: string) => /ledger|crew-board|members/.test(p))).toEqual([])
  })
  it('with no readable ledger the right column shows the Sessions tree, not a board', () => {
    const m = html(<GoalTasks goal={goal} board={null} openKey={null} onOpen={noop} />)
    expect(m).toContain(`>${t.sessionsHeading}</h3>`)
    expect(m).toContain('Sub conductor')
    expect(m).not.toContain('tp-board')
    expect(m).not.toContain('tp-needs')
  })
  it('the app never builds a board from transcripts: board data only comes from a BoardSource', () => {
    const ws = readFileSync(new URL('./Workspace.tsx', import.meta.url), 'utf8')
    expect(ws).toMatch(/enabled: Boolean\(boardSource\)/)
    expect(ws).not.toMatch(/api\.get|\/api\//)
  })
})
