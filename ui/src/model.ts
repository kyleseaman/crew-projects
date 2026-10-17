/**
 * Pure grouping logic: turns the flat session list into projects.
 *
 * A project is a root `kirocrew-team-lead` session. Everything it created
 * (directly or transitively, via `created_by`) belongs to it. The tree is
 * flattened to at most two levels: a direct child that created sessions of
 * its own becomes a sub-team (its lead plus all its descendants as workers);
 * a direct child with no children is a worker of the project itself.
 */

export const TEAM_LEAD_AGENT = 'kirocrew-team-lead'

export interface SourceLink {
  url: string
  number: number
  provider?: string
  kind?: 'change' | 'issue'
  state?: 'open' | 'draft' | 'merged' | 'closed'
  ci?: 'running' | 'passed' | 'failed' | null
}

export interface Slot {
  key: string
  title?: string
  agent?: string
  created_by?: string
  running?: boolean
  pending_approval?: boolean
  needs_input?: boolean
  interrupted?: boolean
  last_ts?: string
  last_activity_ts?: string
  last_message?: string
  project?: string
  /** The folder this session is filed into, when any. Used to attach a
   *  project's agent activity to its folder. */
  folder_id?: string
  source_links?: SourceLink[]
}

export interface Loop {
  slot_key: string
  active: boolean
  cycle_count?: number
  max_cycles?: number
}

export type Status = 'needs_you' | 'stalled' | 'working' | 'idle'

export interface Member {
  slot: Slot
  status: Status
}

export interface SubTeam {
  lead: Member
  workers: Member[]
}

export interface Project {
  lead: Member
  loop: Loop | null
  subTeams: SubTeam[]
  workers: Member[]
  /** Every session in the project except the lead. */
  memberCount: number
  activeCount: number
  status: Status
  prs: SourceLink[]
  repo: string
  updated: string
  /** True when this goal is an ARCHIVED (history) team-lead session with no
   *  live slot — it has no agents, loop or live status; the UI shows it as a
   *  dimmed, openable goal rather than a running team. A live goal built from
   *  the slot list is false. */
  archived: boolean
}

export function slotStatus(s: Slot): Status {
  if (s.pending_approval || s.needs_input) return 'needs_you'
  if (s.interrupted) return 'stalled'
  if (s.running) return 'working'
  return 'idle'
}

const STATUS_RANK: Record<Status, number> = { needs_you: 3, stalled: 2, working: 1, idle: 0 }

function worst(a: Status, b: Status): Status {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b
}

function updatedAt(s: Slot): string {
  return s.last_activity_ts || s.last_ts || ''
}

function basename(path: string | undefined): string {
  if (!path) return ''
  const parts = path.replace(/[\\/]+$/, '').split(/[\\/]/)
  return parts[parts.length - 1] || ''
}

/** Prefer the active loop for a slot; fall back to the most recent stopped one. */
export function loopFor(slotKey: string, loops: Loop[]): Loop | null {
  const mine = loops.filter(l => l.slot_key === slotKey)
  return mine.find(l => l.active) ?? mine[mine.length - 1] ?? null
}

export function buildProjects(slots: Slot[], loops: Loop[]): Project[] {
  const byKey = new Map(slots.map(s => [s.key, s]))
  const children = new Map<string, Slot[]>()
  for (const s of slots) {
    const parent = s.created_by
    if (!parent || parent === s.key || !byKey.has(parent)) continue
    const list = children.get(parent) ?? []
    list.push(s)
    children.set(parent, list)
  }

  // Descendants with a visited set, so a corrupt created_by cycle cannot hang.
  const descendants = (key: string, seen: Set<string>): Slot[] => {
    const out: Slot[] = []
    for (const c of children.get(key) ?? []) {
      if (seen.has(c.key)) continue
      seen.add(c.key)
      out.push(c, ...descendants(c.key, seen))
    }
    return out
  }

  const isRootLead = (s: Slot) =>
    s.agent === TEAM_LEAD_AGENT && !(s.created_by && byKey.has(s.created_by) && s.created_by !== s.key)

  const byRecent = (a: Member, b: Member) => updatedAt(b.slot).localeCompare(updatedAt(a.slot))
  const member = (s: Slot): Member => ({ slot: s, status: slotStatus(s) })

  const projects: Project[] = []
  for (const lead of slots.filter(isRootLead)) {
    const seen = new Set([lead.key])
    const subTeams: SubTeam[] = []
    const workers: Member[] = []
    for (const child of children.get(lead.key) ?? []) {
      if (seen.has(child.key)) continue
      seen.add(child.key)
      const below = descendants(child.key, seen)
      if (below.length) subTeams.push({ lead: member(child), workers: below.map(member).sort(byRecent) })
      else workers.push(member(child))
    }
    workers.sort(byRecent)
    subTeams.sort((a, b) => byRecent(a.lead, b.lead))

    const all = [member(lead), ...subTeams.flatMap(t => [t.lead, ...t.workers]), ...workers]
    const loop = loopFor(lead.key, loops)
    let status = all.reduce<Status>((acc, m) => worst(acc, m.status), 'idle')
    if (status === 'idle' && loop?.active) status = 'working'

    const prs = new Map<string, SourceLink>()
    for (const m of all) {
      for (const link of m.slot.source_links ?? []) {
        if ((link.kind ?? 'change') === 'change' && !prs.has(link.url)) prs.set(link.url, link)
      }
    }

    projects.push({
      lead: member(lead),
      loop,
      subTeams,
      workers,
      memberCount: all.length - 1,
      activeCount: all.slice(1).filter(m => m.status !== 'idle').length,
      status,
      prs: [...prs.values()],
      repo: basename(lead.project),
      updated: all.map(m => updatedAt(m.slot)).sort().pop() ?? '',
      archived: false,
    })
  }

  // Projects needing attention first, then most recently updated.
  return projects.sort(
    (a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status] || b.updated.localeCompare(a.updated),
  )
}

export function loopText(loop: Loop | null): string {
  if (!loop) return ''
  const n = loop.cycle_count ?? 0
  return loop.max_cycles ? `${n}/${loop.max_cycles}` : String(n)
}

/* ---------------------------------------------------------------------------
 * Archived goals.
 *
 * A project's goals are its root `kirocrew-team-lead` sessions. The LIVE ones
 * come from `/api/chat/slots` (above). The ARCHIVED ones are history sessions
 * with no open slot: `GET /api/sessions` lists every session file, each row
 * carrying `key`, `title`, `agent`, `folder_id` and `modified` (see core
 * `history_search.list_sessions`). An archived goal is a history row whose
 * agent is the team lead, filed in the project's folder, that no live slot
 * already holds open. It has no live sub-team/worker rollup (its dispatched
 * sessions, if any, are themselves archived rows the project does not expand),
 * so it renders as a dimmed, openable goal.
 * ------------------------------------------------------------------------- */

/** One row from `GET /api/sessions` (`{ sessions, total, has_more }`). Only the
 *  fields this app reads are typed; a row carries more (messages, created,
 *  memory_mode, preview) the app ignores. */
export interface ArchivedSession {
  key: string
  title?: string
  agent?: string
  folder_id?: string
  /** Epoch seconds (float) from the file mtime, per core `list_sessions`. */
  modified?: number
}

/** The `GET /api/sessions` envelope. */
export interface SessionsPage {
  sessions: ArchivedSession[]
  total?: number
  has_more?: boolean
}

/** An archived session's `modified` (epoch seconds) as an ISO string, so the
 *  UI formats it with the same relative-time helper as a live slot's
 *  timestamp. Empty when absent or unparseable — never a guessed time. */
function archivedUpdatedAt(s: ArchivedSession): string {
  const secs = typeof s.modified === 'number' ? s.modified : NaN
  if (!Number.isFinite(secs)) return ''
  return new Date(secs * 1000).toISOString()
}

/** Build an archived goal (a `Project` with no live rollup) from a history row.
 *  It carries only the lead; status is always idle and there is no loop. */
function archivedGoal(s: ArchivedSession): Project {
  const slot: Slot = {
    key: s.key,
    title: s.title,
    agent: s.agent,
    folder_id: s.folder_id,
    last_activity_ts: archivedUpdatedAt(s),
  }
  return {
    lead: { slot, status: 'idle' },
    loop: null,
    subTeams: [],
    workers: [],
    memberCount: 0,
    activeCount: 0,
    status: 'idle',
    prs: [],
    repo: '',
    updated: archivedUpdatedAt(s),
    archived: true,
  }
}

/**
 * The archived team-lead goals of a project, newest first. An archived goal is
 * a history row that:
 *   - is a `kirocrew-team-lead` session,
 *   - is filed in the project's folder subtree (`folder_id`),
 *   - and has NO live slot (`liveKeys`) — a goal open in a slot is live, and
 *     showing it twice would double-count it.
 * `liveKeys` is every live slot key, so a live goal is never duplicated as an
 * archived one.
 */
export function archivedGoalsIn(
  sessions: ArchivedSession[],
  subtree: Set<string>,
  liveKeys: Set<string>,
): Project[] {
  const goals: Project[] = []
  for (const s of sessions) {
    if (s.agent !== TEAM_LEAD_AGENT) continue
    const folderId = (s.folder_id || '').trim()
    if (!folderId || !subtree.has(folderId)) continue
    if (liveKeys.has(s.key)) continue
    goals.push(archivedGoal(s))
  }
  return goals.sort((a, b) => b.updated.localeCompare(a.updated))
}

/* ---------------------------------------------------------------------------
 * Library — a project's artifacts, output files and de-duplicated PRs.
 *
 * Two host listing endpoints feed it (both on origin/main):
 *
 *   GET /api/artifacts?chat_folder=<folder_id>
 *     Every artifact TOUCHED by a chat filed in the folder's subtree (open or
 *     archived), already resolved server-side from the folder id. One row per
 *     artifact carrying { slug, name, kind, source, description, created_at,
 *     updated_at, session_key, session_title }. The server scopes it to the
 *     project's folder, so the app passes the project's `folder.id` and groups
 *     what comes back — it does NOT re-filter by session.
 *
 *   GET /api/artifacts/session-docs?session=<session_key>
 *     Non-code DOCUMENT files a session produced (file_changes), one row per
 *     distinct path: { path, name, updated_at, session_key, session_title,
 *     message_ts, saved, slug }. Scoped to ONE session only — the app fetches
 *     it per session the project owns and merges the results, de-duplicating by
 *     path (an `artifact` and its backing `output file` are shown once each).
 *
 * A project owns an artifact/doc when its session belongs to the project — the
 * project's goals plus every sub-team/worker under them (and its archived goal
 * leads). `projectSessionKeys` derives exactly that set from the goals the
 * folder already carries, so the app never guesses membership.
 * ------------------------------------------------------------------------- */

/** One row from `GET /api/artifacts` (`{ artifacts: [...] }`). Only the fields
 *  this app reads are typed; a row carries more (tags, folder, pinned, sharing,
 *  version info) the Library ignores. */
export interface LibraryArtifact {
  slug: string
  name: string
  kind?: string
  source?: string
  description?: string
  created_at?: string
  updated_at?: string
  session_key?: string
  session_title?: string
}

/** The `GET /api/artifacts` envelope. */
export interface ArtifactsPage {
  artifacts: LibraryArtifact[]
}

/** One row from `GET /api/artifacts/session-docs` (`{ docs: [...] }`): a
 *  non-code document file a session wrote. */
export interface SessionDoc {
  path: string
  name: string
  updated_at?: string
  session_key?: string
  session_title?: string
  message_ts?: string
  /** True when this file already backs a materialized artifact — then it is
   *  surfaced as that artifact, not a second time as a loose output file. */
  saved?: boolean
  slug?: string
}

/** Every session key a project owns: each goal's lead plus every sub-team lead
 *  and worker under it (live goals carry a full rollup; an archived goal carries
 *  only its lead). De-duplicated, stable order. This is the per-goal membership
 *  the Library attributes artifacts and output files by — reused from the goals
 *  already built for the project, never re-derived from the raw session list. */
export function projectSessionKeys(goals: Project[]): string[] {
  const keys: string[] = []
  const add = (k: string | undefined) => {
    const v = (k || '').trim()
    if (v && !keys.includes(v)) keys.push(v)
  }
  for (const goal of goals) {
    add(goal.lead.slot.key)
    for (const sub of goal.subTeams) {
      add(sub.lead.slot.key)
      for (const w of sub.workers) add(w.slot.key)
    }
    for (const w of goal.workers) add(w.slot.key)
  }
  return keys
}

/** PRs de-duplicated across every goal in a project, by URL. Each `Project`
 *  already de-dupes its own members' change links into `prs`; this unions them
 *  across the project's goals so the Library shows one chip per distinct PR. */
export function dedupeProjectPrs(goals: Project[]): SourceLink[] {
  const seen = new Map<string, SourceLink>()
  for (const goal of goals) {
    for (const l of goal.prs) if (!seen.has(l.url)) seen.set(l.url, l)
  }
  return [...seen.values()]
}

/** The output FILES a project owns: session-docs whose session belongs to the
 *  project, that are NOT already saved as an artifact (a saved doc is shown as
 *  its artifact instead, so it is not double-listed), de-duplicated by path and
 *  newest first. `ownedKeys` is `projectSessionKeys(goals)`. */
export function projectOutputFiles(docs: SessionDoc[], ownedKeys: string[]): SessionDoc[] {
  const owned = new Set(ownedKeys)
  const byPath = new Map<string, SessionDoc>()
  for (const d of docs) {
    if (d.saved) continue // surfaced as its artifact, not a loose file
    const key = (d.session_key || '').trim()
    if (!owned.has(key)) continue
    const path = (d.path || '').trim()
    if (!path) continue
    const prev = byPath.get(path)
    // Newest write of a path wins (session-docs is already newest-first within
    // one session, but merging several sessions can reorder).
    if (!prev || (d.updated_at || '') > (prev.updated_at || '')) byPath.set(path, d)
  }
  return [...byPath.values()].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
}

/** The ARTIFACTS a project owns, newest-updated first. The `chat_folder` query
 *  already scopes the listing to the project's folder subtree server-side, so
 *  this only sorts (and defensively drops a row with no slug). Kept a function
 *  so the ordering is one tested place. */
export function projectArtifacts(artifacts: LibraryArtifact[]): LibraryArtifact[] {
  return artifacts
    .filter(a => (a.slug || '').trim() !== '')
    .slice()
    .sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
}

/* ---------------------------------------------------------------------------
 * Projects = folders.
 *
 * A project is a sidebar FOLDER (GET /api/chat/folders). The folder carries the
 * project's working directory (`project_dir`), its default agent, read-only
 * instruction directories (`steering_dirs`, which this app never writes), and
 * — optionally, once core ships multi-repo — an `extra_repos` list. The app
 * degrades to the single `project_dir` when `extra_repos` is absent, so it
 * works against today's core and the one sibling item C is adding WITHOUT the
 * app waiting on, or editing, that core change.
 * ------------------------------------------------------------------------- */

/** The default agent a new project is created with. */
export const DEFAULT_PROJECT_AGENT = TEAM_LEAD_AGENT

/**
 * A chat folder, mirroring the GET /api/chat/folders row shape on origin/main.
 * Only the fields this app reads are typed; the folder carries more (color,
 * icon, order, hidden, tags, owner_app, history counts) that the app ignores.
 */
export interface Folder {
  id: string
  name: string
  parent_id?: string | null
  /** The project's working directory. Absent/empty on a folder not yet linked
   *  to one — the project page then shows a Set-directory prompt. */
  project_dir?: string
  /** Additional repositories. OPTIONAL: core does not ship this field yet
   *  (sibling item C adds multi-repo). Absent -> the header shows only
   *  `project_dir`. Read defensively so a non-array value degrades too. */
  extra_repos?: string[]
  /** The agent new chats in this folder start with. */
  default_agent?: string
  /** Read-only instruction directories. The app DISPLAYS these and links to the
   *  folder's settings; it never writes them — core refuses an app principal
   *  (`_refuse_principal_steering_dirs`), by design. */
  steering_dirs?: string[]
}

export interface FolderProject {
  folder: Folder
  /** Every repo the project spans: `project_dir` first, then `extra_repos`,
   *  de-duplicated. Empty when the folder has no `project_dir` set. */
  repos: string[]
  /** The default agent, falling back to the team-lead default for display. */
  defaultAgent: string
  /** Instruction directories shown read-only in the header. */
  instructions: string[]
  /** True when no working directory is set — the header shows a Set-directory
   *  prompt and NEVER guesses a path. */
  needsDir: boolean
  /** The project's GOALS: each is a root `kirocrew-team-lead` session, with its
   *  sub-team/worker rollup grouped UNDER it. Live goals (`archived: false`)
   *  come from the slot list and carry their agents, loop and status; archived
   *  goals (`archived: true`) are history team-lead sessions with no live slot,
   *  shown dimmed and openable. A live goal is attached by `folder_id` (or a
   *  matching working directory when the goal has no folder); an archived goal
   *  is attached by `folder_id` only. Live goals first (worst status first),
   *  then archived goals newest first. */
  goals: Project[]
  /** Worst-first status across the project's LIVE goals, for the list dot.
   *  Archived goals are idle by construction and never raise it. */
  status: Status
  /** Most recent activity across all the project's goals. */
  updated: string
}

/** Read `extra_repos` defensively: a non-array (older core, corrupt row) reads
 *  as none, never throws. */
function extraReposOf(folder: Folder): string[] {
  const raw = folder.extra_repos
  return Array.isArray(raw) ? raw.filter(r => typeof r === 'string' && r.trim() !== '') : []
}

/** Every repo a folder spans, `project_dir` first, de-duplicated by exact path. */
export function folderRepos(folder: Folder): string[] {
  const out: string[] = []
  const add = (p: string | undefined) => {
    const v = (p ?? '').trim()
    if (v && !out.includes(v)) out.push(v)
  }
  add(folder.project_dir)
  for (const r of extraReposOf(folder)) add(r)
  return out
}

/** The display basename of a repo path (last path segment). Exported so the
 *  header and the list render a repo the same way. */
export function repoName(path: string): string {
  return basename(path)
}

/** The whole subtree of folder ids rooted at `rootId` (inclusive), so a team
 *  filed in a nested sub-folder still attaches to its top-level project.
 *  Cycle-guarded like the session walk. */
function folderSubtreeIds(folders: Folder[], rootId: string): Set<string> {
  const childrenOf = new Map<string, string[]>()
  for (const f of folders) {
    const parent = f.parent_id && f.parent_id !== f.id ? f.parent_id : ''
    if (!parent) continue
    const list = childrenOf.get(parent) ?? []
    list.push(f.id)
    childrenOf.set(parent, list)
  }
  const out = new Set<string>([rootId])
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop() as string
    for (const child of childrenOf.get(id) ?? []) {
      if (!out.has(child)) {
        out.add(child)
        stack.push(child)
      }
    }
  }
  return out
}

/**
 * Build the project list from the folder tree. Top-level folders (no parent)
 * are projects; nested folders are sub-team organisation the Projects LIST
 * does not surface as separate projects. Each project attaches the team
 * rollups (from `slots`) whose sessions are filed in the folder's subtree, or
 * whose lead working directory matches one of the project's repos. Sorted
 * needs-you first, then by most recent activity, then name — the folder's own
 * `order` governs the sidebar, not this app page.
 */
export function buildFolderProjects(
  folders: Folder[],
  slots: Slot[] = [],
  loops: Loop[] = [],
  sessions: ArchivedSession[] = [],
): FolderProject[] {
  const tops = folders.filter(f => !(f.parent_id && f.parent_id !== f.id))
  const allTeams = buildProjects(slots, loops)
  // Every live session key, so an archived goal that is actually open in a slot
  // is not listed a second time as history.
  const liveKeys = new Set(slots.map(s => s.key))

  const result = tops.map<FolderProject>(folder => {
    const repos = folderRepos(folder)
    const repoSet = new Set(repos)
    const instructions = Array.isArray(folder.steering_dirs)
      ? folder.steering_dirs.filter(s => typeof s === 'string' && s.trim() !== '')
      : []
    const subtree = folderSubtreeIds(folders, folder.id)
    const liveGoals = allTeams.filter(team => {
      const lead = team.lead.slot
      // A session filed into a folder belongs to THAT folder's project. The
      // working-directory match is only a fallback for a session with no
      // folder — otherwise two folders sharing one project_dir would both
      // attract every team sitting in that directory.
      if (lead.folder_id) return subtree.has(lead.folder_id)
      const leadProject = (lead.project || '').trim()
      return leadProject !== '' && repoSet.has(leadProject)
    })
    const archivedGoals = archivedGoalsIn(sessions, subtree, liveKeys)
    // Live goals first (worst status first, then most recent), then archived
    // goals newest first — a running goal is what the person acts on.
    const goals = [...liveGoals, ...archivedGoals]
    // The list dot and sort key read LIVE goals only: an archived goal is idle
    // by construction, so it would never raise the dot, and letting a long-dead
    // history row set `updated` would sink an active project down the list.
    const status = liveGoals.reduce<Status>((acc, t) => worst(acc, t.status), 'idle')
    const updated = liveGoals.map(t => t.updated).sort().pop() ?? ''
    return {
      folder,
      repos,
      defaultAgent: (folder.default_agent || '').trim() || DEFAULT_PROJECT_AGENT,
      instructions,
      needsDir: repos.length === 0,
      goals,
      status,
      updated,
    }
  })

  return result.sort(
    (a, b) =>
      STATUS_RANK[b.status] - STATUS_RANK[a.status] ||
      b.updated.localeCompare(a.updated) ||
      a.folder.name.localeCompare(b.folder.name),
  )
}
