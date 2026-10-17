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

/** The GET /api/chat/folders row shape (origin/main). Only the fields the app
 *  reads are typed here; a real folder carries more (color, icon, order,
 *  hidden, tags, owner_app, the computed history_count) that the app ignores.
 *  `extra_repos` is the OPTIONAL multi-repo field sibling item C is adding to
 *  core — present on one fixture, absent on the rest, so both the multi-repo
 *  header and the single-project_dir degrade are screenshotted. */
export interface Folder {
  id: string
  name: string
  parent_id?: string | null
  project_dir?: string
  extra_repos?: string[]
  default_agent?: string
  steering_dirs?: string[]
  history_count?: number
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
    folder_id: 'f-parsers',
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
    folder_id: 'f-braking',
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
    folder_id: 'f-codex',
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

/**
 * GET /api/chat/folders. A project is a top-level folder. The fixtures exercise
 * every project-page state the header can draw:
 *   - f-parsers: MULTI-REPO (project_dir + extra_repos) with read-only
 *     instructions (steering_dirs the app shows but never writes) and one
 *     nested sub-folder (sub-team organisation the project LIST hides).
 *   - f-braking: a single-repo project, no extra_repos (the degrade path).
 *   - f-codex:   a single-repo project with no team sessions attached yet.
 *   - f-unset:   NO project_dir -> the project page shows the Set-directory
 *                prompt and the app NEVER guesses a path.
 */
export const foldersFixture: Folder[] = [
  {
    id: 'f-parsers',
    name: 'Verify telemetry parsers',
    parent_id: null,
    project_dir: '/Users/kyle/Development/trackout-turbo',
    extra_repos: ['/Users/kyle/Development/trackout-telemetry-core'],
    default_agent: 'kirocrew-team-lead',
    steering_dirs: ['/Users/kyle/Development/trackout-turbo/.standards', '/Users/kyle/org-standards'],
    history_count: 4,
  },
  {
    id: 'f-parsers-ref',
    name: 'Reference parser verification',
    parent_id: 'f-parsers',
    history_count: 2,
  },
  {
    id: 'f-braking',
    name: 'TrackOut braking coaching',
    parent_id: null,
    project_dir: '/Users/kyle/Development/trackout-turbo',
    default_agent: 'kirocrew-team-lead',
    history_count: 3,
  },
  {
    id: 'f-codex',
    name: 'Codex effort controls',
    parent_id: null,
    project_dir: '/Users/kyle/Development/KiroCrew',
    default_agent: 'kirocrew-team-lead',
    history_count: 1,
  },
  {
    id: 'f-unset',
    name: 'Mobile companion app',
    parent_id: null,
    default_agent: 'kirocrew-team-lead',
    history_count: 0,
  },
]
