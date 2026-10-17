/**
 * Mock fixtures for the dev harness. They mirror the REAL payload shapes the
 * app consumes from the host:
 *
 *   GET /api/chat/slots     -> Slot[]            (see model.ts `Slot`)
 *   GET /api/autonudge      -> { enabled, loops } (see App.tsx `loopsQ`)
 *   GET /api/chat/folders   -> Folder[]          (reserved for later steps)
 *
 * The data is hand-built to exercise every view the later steps screenshot:
 * multiple projects, a sub-team, direct workers, active and stopped loops,
 * de-duplicated PRs with every CI state, and the needs_you / stalled / working
 * / idle status rollups. Nothing here ships in the production bundle — this
 * module is imported only by the dev harness, never by src/App.tsx.
 */
import type { Loop, Slot } from '../model'

/** The /api/chat/folders response shape (reserved for later steps). The app
 *  does not read folders today; the fixture documents the shape so a later
 *  step can wire it without re-deriving the contract. */
export interface Folder {
  id: string
  name: string
  parent_id?: string | null
  session_keys?: string[]
}

const now = Date.now()
/** An ISO timestamp `minutes` ago — keeps fmtRelative output deterministic-ish
 *  relative to capture time without hardcoding a locale-formatted string. */
const ago = (minutes: number): string => new Date(now - minutes * 60_000).toISOString()

const PR = (number: number, extra: Partial<Slot['source_links'] extends (infer E)[] | undefined ? E : never> = {}) => ({
  url: `https://github.com/kyle/trackout-turbo/pull/${number}`,
  number,
  provider: 'github',
  kind: 'change' as const,
  state: 'open' as const,
  ...extra,
})

/**
 * Project 1 — "Verify telemetry parsers": a lead with one conductor sub-team
 * (two workers under it) and one direct worker. One worker needs approval, so
 * the whole project rolls up to needs_you. PRs carry every CI state and one is
 * shared across two members to prove de-duplication.
 */
const parserProject: Slot[] = [
  {
    key: 'L-parsers',
    agent: 'kirocrew-team-lead',
    title: 'Verify telemetry parsers',
    project: '/Users/kyle/Development/trackout-turbo',
    running: false,
    last_activity_ts: ago(3),
    last_message: 'Round 3 corrections merged. Patrolling the two open items.',
    source_links: [PR(4506, { ci: 'passed', state: 'merged' })],
  },
  {
    key: 'C-ref',
    agent: 'kirocrew-conductor',
    created_by: 'L-parsers',
    title: 'Reference parser verification',
    running: true,
    last_activity_ts: ago(4),
    last_message: 'Dispatched the integration worker; waiting on its PR checks.',
  },
  {
    key: 'W-audit',
    agent: 'kirocrew-worker',
    created_by: 'C-ref',
    title: 'Audit telemetry-core WASM parser',
    running: false,
    last_activity_ts: ago(22),
    last_message: 'Wrote the 464-line parser audit; no gaps found.',
    source_links: [PR(4506, { ci: 'passed', state: 'merged' })],
  },
  {
    key: 'W-integ',
    agent: 'kirocrew-worker',
    created_by: 'C-ref',
    title: 'Integrate confirmed WASM parser',
    running: true,
    last_activity_ts: ago(1),
    last_message: 'Opened PR #4511; checks running.',
    source_links: [PR(4511, { ci: 'running' })],
  },
  {
    key: 'W-correct',
    agent: 'kirocrew-worker',
    created_by: 'L-parsers',
    title: 'Resolve owner review findings',
    pending_approval: true,
    last_activity_ts: ago(2),
    last_message: 'Needs approval to force-push the review fixup.',
    source_links: [PR(4512, { ci: 'failed' })],
  },
]

/**
 * Project 2 — "TrackOut braking coaching": an idle lead running an active loop,
 * so it shows as working even with no agent needing attention. Several direct
 * workers in mixed states, including an interrupted (stalled) one.
 */
const brakingProject: Slot[] = [
  {
    key: 'L-braking',
    agent: 'kirocrew-team-lead',
    title: 'TrackOut braking coaching',
    project: '/Users/kyle/Development/trackout-turbo',
    running: false,
    last_activity_ts: ago(8),
    last_message: 'Wave 1 dispatched. Loop will pick up wave 2 as PRs merge.',
  },
  {
    key: 'W-corner',
    agent: 'kirocrew-worker',
    created_by: 'L-braking',
    title: 'Corner-type label coaching',
    running: true,
    last_activity_ts: ago(6),
    last_message: 'Implementing the corner-type classifier.',
    source_links: [PR(4520, { ci: 'running' })],
  },
  {
    key: 'W-record',
    agent: 'kirocrew-worker',
    created_by: 'L-braking',
    title: 'Per-turn driver record',
    interrupted: true,
    last_activity_ts: ago(31),
    last_message: 'Interrupted mid-run; awaiting a resume.',
  },
  {
    key: 'W-presets',
    agent: 'kirocrew-worker',
    created_by: 'L-braking',
    title: 'Coaching-line presets',
    running: false,
    last_activity_ts: ago(45),
    last_message: 'Merged. Presets shipped.',
    source_links: [PR(4521, { ci: 'passed', state: 'merged' })],
  },
]

/**
 * Project 3 — "Codex effort controls": a small lead with no dispatched agents
 * yet, so it exercises the "No agents yet" detail state. Idle with no loop.
 */
const codexProject: Slot[] = [
  {
    key: 'L-codex',
    agent: 'kirocrew-team-lead',
    title: 'Codex effort controls',
    project: '/Users/kyle/Development/KiroCrew',
    running: false,
    last_activity_ts: ago(120),
    last_message: 'Scoping the composer model + effort control work.',
  },
]

/** Sessions that are NOT root team-leads, to prove the grouping ignores them
 *  (a plain chat and an orphaned worker with a dangling parent). */
const noise: Slot[] = [
  { key: 'chat-adhoc', agent: 'kirocrew', title: 'Quick question', last_activity_ts: ago(90) },
  { key: 'W-orphan', agent: 'kirocrew-worker', created_by: 'gone-lead', title: 'Orphan worker', last_activity_ts: ago(200) },
]

export const slotsFixture: Slot[] = [
  ...parserProject,
  ...brakingProject,
  ...codexProject,
  ...noise,
]

export const loopsFixture: Loop[] = [
  { slot_key: 'L-braking', active: true, cycle_count: 7, max_cycles: 300 },
  { slot_key: 'L-parsers', active: false, cycle_count: 12, max_cycles: 300 },
  { slot_key: 'C-ref', active: true, cycle_count: 2 },
]

export const autonudgeFixture: { enabled: boolean; loops: Loop[] } = {
  enabled: true,
  loops: loopsFixture,
}

/** Reserved for later steps that render folders. The app does not read this
 *  today; it documents the /api/chat/folders shape. */
export const foldersFixture: Folder[] = [
  { id: 'f-parsers', name: 'Verify telemetry parsers', parent_id: null, session_keys: ['L-parsers'] },
  { id: 'f-braking', name: 'TrackOut braking coaching', parent_id: null, session_keys: ['L-braking'] },
]
