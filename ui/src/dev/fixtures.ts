/**
 * Mock fixtures for the dev harness. They mirror the REAL payload shapes the
 * app consumes from the host:
 *
 *   GET /api/chat/slots     -> Slot[]            (see model.ts `Slot`)
 *   GET /api/autonudge      -> { enabled, loops } (see App.tsx `loopsQ`)
 *   GET /api/chat/folders   -> Folder[]          (Step 2)
 *   GET /api/sessions       -> { sessions, ... } (Step 3: archived goals)
 *
 * The data is hand-built to exercise every view the later steps screenshot:
 * multiple projects, a sub-team, direct workers, active and stopped loops,
 * de-duplicated PRs with every CI state, and the needs_you / stalled / working
 * / idle status rollups. Nothing here ships in the production bundle — this
 * module is imported only by the dev harness, never by src/App.tsx.
 */
import type { ArchivedSession, Loop, SessionDoc, Slot } from '../model'

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
 * Project 1 — "Verify telemetry parsers": TWO live goals (team-leads filed in
 * f-parsers). The first has one conductor sub-team (two workers under it) and
 * one direct worker; one of its workers needs approval, so the project rolls up
 * to needs_you. The second is a perf-sweep lead with two direct workers. PRs
 * carry every CI state and one is shared across two members to prove
 * de-duplication. The project also carries archived goals (see sessionsFixture).
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
    // Linked to a Slack channel: the lead watches it and dispatches a goal for
    // each report -> a `slack` subscription row on the project.
    slack_linked: true,
    slack_channel: '#trackout-parsers',
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
    // A second channel link in the project, so the Channel links group shows
    // more than one row.
    slack_linked: true,
    slack_channel: '#trackout-ci',
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
  // A SECOND live goal in the same project, so the live-goals section shows
  // more than one — a lead running a loop with a couple of direct workers.
  {
    key: 'L-parsers-perf',
    agent: 'kirocrew-team-lead',
    title: 'Parser throughput regression sweep',
    project: '/Users/kyle/Development/trackout-turbo',
    folder_id: 'f-parsers',
    running: true,
    last_activity_ts: ago(5),
    last_message: 'Profiling the decode hot path across the fixture corpus.',
  },
  {
    key: 'W-perf-bench',
    agent: 'kirocrew-worker',
    created_by: 'L-parsers-perf',
    title: 'Benchmark decode throughput',
    running: true,
    last_activity_ts: ago(5),
    last_message: 'Running the criterion suite.',
    source_links: [PR(4515, { ci: 'running' })],
  },
  {
    key: 'W-perf-fix',
    agent: 'kirocrew-worker',
    created_by: 'L-parsers-perf',
    title: 'Pre-size the frame buffer',
    running: false,
    last_activity_ts: ago(14),
    last_message: 'Opened PR; checks green.',
    source_links: [PR(4516, { ci: 'passed' })],
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
  // A worker that asked a question and is waiting on the person's answer
  // (needs_input, not a tool approval) — gives the inbox its third kind.
  {
    key: 'W-lines',
    agent: 'kirocrew-worker',
    created_by: 'L-braking',
    title: 'Coaching-line kinds',
    needs_input: true,
    last_activity_ts: ago(12),
    last_message: 'Two schemas fit the report card — which should I use?',
    source_links: [PR(4522, { ci: 'running' })],
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

/** A variant of the slot list with NOTHING waiting on the person: every
 *  pending_approval / needs_input / interrupted flag cleared (a waiting session
 *  becomes running instead, so the projects still show as active). Used only by
 *  the dev harness's `?empty=1` mode to screenshot the inbox's calm empty
 *  state — the projects themselves are unchanged, only their statuses differ. */
export const slotsNoWaitingFixture: Slot[] = slotsFixture.map(s => {
  if (s.pending_approval || s.needs_input || s.interrupted) {
    const { pending_approval: _a, needs_input: _i, interrupted: _t, ...rest } = s
    return { ...rest, running: true }
  }
  return s
})

/**
 * GET /api/sessions -> { sessions, total, has_more }. One row per session file
 * (see core `history_search.list_sessions`): `key`, `title`, `agent`,
 * `folder_id`, `modified` (epoch seconds). The app reads only these.
 *
 * The archived GOALS these exercise:
 *   - f-parsers: two ARCHIVED team-lead goals (an earlier verification pass and
 *     a shipped one), so a project shows both live and archived goals.
 *   - f-braking: one archived goal, alongside its one live goal.
 * Plus rows that must be IGNORED as archived goals:
 *   - L-parsers / L-braking: already LIVE (present in slotsFixture) — a goal
 *     open in a slot must not also appear as history.
 *   - a non-team-lead archived session (a plain chat) — not a goal.
 *   - an archived team-lead with no folder_id — attaches to no project.
 */
const sec = (minutes: number): number => (now - minutes * 60_000) / 1000

export const sessionsFixture: ArchivedSession[] = [
  // Two archived goals under the parsers project.
  {
    key: 'hist-parsers-phase18',
    title: 'Phase 18 parser verification',
    agent: 'kirocrew-team-lead',
    folder_id: 'f-parsers',
    modified: sec(60 * 26),
  },
  {
    key: 'hist-parsers-fixtures',
    title: 'Backfill parser fixtures',
    agent: 'kirocrew-team-lead',
    folder_id: 'f-parsers-ref', // a nested sub-folder: attaches to f-parsers
    modified: sec(60 * 52),
  },
  // One archived goal under the braking project.
  {
    key: 'hist-braking-wave0',
    title: 'Braking coaching wave 0 spike',
    agent: 'kirocrew-team-lead',
    folder_id: 'f-braking',
    modified: sec(60 * 40),
  },
  // IGNORED: these team-leads are already LIVE in slotsFixture.
  { key: 'L-parsers', title: 'Verify telemetry parsers', agent: 'kirocrew-team-lead', folder_id: 'f-parsers', modified: sec(3) },
  { key: 'L-braking', title: 'TrackOut braking coaching', agent: 'kirocrew-team-lead', folder_id: 'f-braking', modified: sec(8) },
  // IGNORED: a plain archived chat (not a team-lead) filed in a project.
  { key: 'hist-chat', title: 'Scratch notes', agent: 'kirocrew', folder_id: 'f-parsers', modified: sec(70) },
  // IGNORED: an archived team-lead with no folder — attaches to no project.
  { key: 'hist-homeless', title: 'Unfiled team effort', agent: 'kirocrew-team-lead', modified: sec(300) },
]

export const sessionsPageFixture: { sessions: ArchivedSession[]; total: number; has_more: boolean } = {
  sessions: sessionsFixture,
  total: sessionsFixture.length,
  has_more: false,
}

/**
 * GET /api/artifacts?chat_folder=<folder_id> -> { artifacts }. In production the
 * host resolves the folder subtree server-side and returns one row per artifact
 * every chat in it touched; the app groups what comes back. The harness can't
 * run that server resolution, so each fixture artifact carries the `folder_id`
 * its session sits in, and the sdk-stub filters by the `chat_folder` query to
 * mimic the server scope. `folder_id` is NOT a field the real API returns — it
 * is a harness-only tag so the stub can scope — and the app never reads it.
 *
 * The parsers project (f-parsers) gets several artifacts across its goals
 * (design docs, a report, a widget) so the Library's Artifacts section is
 * populated; the braking project gets one; codex gets none (empty state).
 */
export interface LibraryArtifactFixture {
  slug: string
  name: string
  kind?: string
  source?: string
  description?: string
  created_at?: string
  updated_at?: string
  session_key?: string
  session_title?: string
  /** Harness-only: which folder's subtree this artifact's session sits in, so
   *  the stub can mimic the server's `chat_folder` scope. Not a real API field. */
  folder_id?: string
}

const artifactsFixture: LibraryArtifactFixture[] = [
  {
    slug: 'parser-coverage-report',
    name: 'Parser coverage report',
    kind: 'document',
    source: 'chat',
    session_key: 'W-audit',
    session_title: 'Audit telemetry-core WASM parser',
    updated_at: ago(20),
    folder_id: 'f-parsers',
  },
  {
    slug: 'wasm-decode-design',
    name: 'WASM decode path design',
    kind: 'document',
    source: 'chat',
    session_key: 'C-ref',
    session_title: 'Reference parser verification',
    updated_at: ago(35),
    folder_id: 'f-parsers',
  },
  {
    slug: 'throughput-dashboard',
    name: 'Throughput dashboard',
    kind: 'widget',
    source: 'chat',
    session_key: 'W-perf-bench',
    session_title: 'Benchmark decode throughput',
    updated_at: ago(6),
    folder_id: 'f-parsers',
  },
  {
    slug: 'braking-report-card',
    name: 'Braking report card',
    kind: 'widget',
    source: 'chat',
    session_key: 'W-corner',
    session_title: 'Corner-type label coaching',
    updated_at: ago(7),
    folder_id: 'f-braking',
  },
]

/** Resolve the `chat_folder`-scoped artifact listing: every artifact tagged
 *  with the requested folder (the real server resolves the subtree; the harness
 *  scopes on the single folder id, which is enough for the screenshot). Strips
 *  the harness-only `folder_id` tag so the payload matches the real API shape. */
export function artifactsForFolder(folderId: string): Array<Omit<LibraryArtifactFixture, 'folder_id'>> {
  return artifactsFixture
    .filter(a => a.folder_id === folderId)
    .map(({ folder_id: _drop, ...rest }) => rest)
}

/**
 * GET /api/artifacts/session-docs -> { docs }. The unscoped firehose: one row
 * per distinct document path across ALL sessions (the app filters to a
 * project's own session keys client-side). Fields mirror the real shape
 * (`path, name, updated_at, session_key, session_title, saved, slug`).
 *
 * Covers: unsaved output files owned by the parsers and braking projects, a
 * SAVED doc (must be hidden — it is surfaced as its artifact instead), and a
 * doc owned by a session no project here owns (must be filtered out).
 */
export const sessionDocsFixture: SessionDoc[] = [
  {
    path: '/Users/kyle/Development/trackout-turbo/.artifacts/parser-audit.md',
    name: 'parser-audit.md',
    session_key: 'W-audit',
    session_title: 'Audit telemetry-core WASM parser',
    updated_at: ago(21),
    saved: false,
  },
  {
    path: '/Users/kyle/Development/trackout-turbo/bench/throughput.csv',
    name: 'throughput.csv',
    session_key: 'W-perf-bench',
    session_title: 'Benchmark decode throughput',
    updated_at: ago(5),
    saved: false,
  },
  {
    path: '/Users/kyle/Development/trackout-turbo/coaching/corner-types.md',
    name: 'corner-types.md',
    session_key: 'W-corner',
    session_title: 'Corner-type label coaching',
    updated_at: ago(6),
    saved: false,
  },
  // SAVED as the parser-coverage-report artifact -> must NOT appear as a loose
  // file (it is shown as the artifact).
  {
    path: '/Users/kyle/Development/trackout-turbo/.artifacts/coverage.md',
    name: 'coverage.md',
    session_key: 'W-audit',
    session_title: 'Audit telemetry-core WASM parser',
    updated_at: ago(20),
    saved: true,
    slug: 'parser-coverage-report',
  },
  // Owned by no project here (a plain ad-hoc chat) -> filtered out.
  {
    path: '/tmp/scratch.md',
    name: 'scratch.md',
    session_key: 'chat-adhoc',
    session_title: 'Quick question',
    updated_at: ago(90),
    saved: false,
  },
]

export const sessionDocsPageFixture: { docs: SessionDoc[] } = { docs: sessionDocsFixture }

export const loopsFixture: Loop[] = [
  // Braking lead: a long patrol loop (drives the project's working status).
  { id: 'lp-braking', slot_key: 'L-braking', active: true, cycle_count: 7, max_cycles: 300, idle_secs: 300, next_due_ts: sec(-4), last_fire_ts: sec(8) },
  // Parsers lead: a STOPPED loop — not a subscription (a stopped loop is not
  // watching anything), so it must NOT appear in the Subscriptions panel.
  { id: 'lp-parsers', slot_key: 'L-parsers', active: false, cycle_count: 12, max_cycles: 300, idle_secs: 300 },
  // Parsers conductor: an ACTIVE monitor loop -> a monitor subscription row
  // with a cadence and a next fire a few minutes out.
  { id: 'lp-ref', slot_key: 'C-ref', active: true, cycle_count: 2, idle_secs: 900, next_due_ts: sec(-11), last_fire_ts: sec(4) },
  // Parsers perf lead: a bounded monitor loop with progress against a cap.
  { id: 'lp-perf', slot_key: 'L-parsers-perf', active: true, cycle_count: 18, max_cycles: 200, idle_secs: 3600, next_due_ts: sec(-50) },
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
