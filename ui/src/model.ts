/**
 * Pure grouping logic: turns the flat session list into projects.
 *
 * A goal is a root LEAD session: a `kirocrew-team-lead` or any conductor agent
 * (`kirocrew-conductor`, `kirocrew-ledger-conductor`, `crew-manager-conductor`,
 * ...) with no lead above it. Everything it created (directly or transitively,
 * via the slot's `parent` lineage edge, falling back to `created_by`) belongs
 * to it. The rollup is flattened to two levels: a direct child that is itself a
 * lead, or that created sessions of its own, becomes a sub-team (its lead plus
 * all its descendants as workers); any other direct child is a worker of the
 * goal itself. The sessions TREE (`Project.tree`) keeps the full depth, so a
 * sub-conductor two levels down still reads as nested under its own parent.
 */

export const TEAM_LEAD_AGENT = 'kirocrew-team-lead'

/** True for an agent that leads a team: the team lead, or any conductor
 *  (an agent id ending in `conductor`, e.g. `kirocrew-conductor`,
 *  `kirocrew-pipeline-conductor`, `crew-manager-conductor`). Workers, default
 *  chats and every other agent are not leads. */
export function isLeadAgent(agent: string | undefined): boolean {
  const a = (agent || '').trim()
  return a === TEAM_LEAD_AGENT || /(^|[-_])conductor$/.test(a)
}

/** The name the embedded chat's placeholder addresses: the session's own
 *  agent from its slot row (`agent`, which for a crewmate chat is the
 *  crewmate's name). The slot rows the app reads carry no separate display
 *  name, so there is nothing better to prefer. '' when the row names none, so
 *  the caller passes no placeholder and the host's default shows. */
export function chatAgentName(slot: Pick<Slot, 'agent'> | null | undefined): string {
  return (slot?.agent || '').trim()
}

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
  /** The lineage edge the host attaches to every slot row (`_attach_slot_parents`):
   *  `key` is the creator's row key IN THIS PAYLOAD, already resolved to the
   *  nearest LIVE ancestor when the creator itself closed (`ancestor: true`),
   *  null when nobody running opened it. The chat sidebar nests on this; the
   *  app does too, falling back to `created_by` when it is null or absent (a
   *  frame sent before the host's lineage projection is seeded). */
  parent?: { slot?: string; key?: string | null; ancestor?: boolean } | null
  running?: boolean
  pending_approval?: boolean
  needs_input?: boolean
  interrupted?: boolean
  /** The host's `waiting_for_input`: the turn is over and the session's last
   *  conversational message is the ASSISTANT's (no approval or options
   *  pending). The only signal the slot row gives that `last_message` is the
   *  agent's own words rather than the person's prompt. */
  waiting_for_input?: boolean
  /** An assistant message offering options is the latest turn; its text,
   *  options stripped, is `prompt_preview`. */
  has_options?: boolean
  prompt_preview?: string
  /** What a pending tool approval asks for (`slot_projection`); display only.
   *  `tool_kind` is the ACP kind (execute, edit, read, fetch, ...) or `spawn`. */
  pending_approval_info?: { tool?: string; tool_kind?: string; tool_purpose?: string } | null
  last_ts?: string
  last_activity_ts?: string
  last_message?: string
  project?: string
  /** The folder this session is filed into, when any. Used to attach a
   *  project's agent activity to its folder. */
  folder_id?: string
  source_links?: SourceLink[]
  /** True when this session mirrors to / is driven by a Slack channel. From the
   *  `/api/chat/slots` payload (`state.serialize_slot` sets `slack_linked`);
   *  read defensively so a payload without it degrades to not-linked. */
  slack_linked?: boolean
  /** The visible Slack channel the session is linked to, when `slack_linked`.
   *  Display only — a redacted channel name/id the host already computed. */
  slack_channel?: string
  /** The session's approval posture, from the same slot row the dashboard's
   *  ApprovalModePicker reads (`slotApprovalMode`): the person's Trust flag, a
   *  live app-armed scoped grant (blank once it lapses), and Reads. */
  trust?: boolean
  trust_scope?: string
  trust_reads?: boolean
}

export interface Loop {
  /** The loop's own id (origin/main `NudgeLoop.id`). */
  id?: string
  slot_key: string
  active: boolean
  cycle_count?: number
  max_cycles?: number
  /** Seconds between fires (`NudgeLoop.idle_secs`, the cadence). */
  idle_secs?: number
  /** Epoch seconds of the next scheduled fire (`NudgeLoop.next_due_ts`); 0 when
   *  none is scheduled (just-fired, or a legacy row). */
  next_due_ts?: number
  /** Epoch seconds this loop last delivered (`NudgeLoop.last_fire_ts`); 0 when
   *  it never has. */
  last_fire_ts?: number
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
  /** The LEAD's own status: its slot flags, with an idle lead whose loop is
   *  active reading as working (it is between patrol cycles). This is what
   *  every display labelled as the lead or the goal shows — never the rollup,
   *  so one interrupted worker deep in the tree cannot paint the lead red. */
  leadStatus: Status
  /** Worst status over the lead AND every session under it. Only for genuine
   *  rollups: ordering goals, the project's list dot, counts. */
  rollupStatus: Status
  /** The sessions UNDER the lead (never the lead itself) that need the person
   *  or are stalled, named, so a display can show them beside the lead's own
   *  status instead of folding them into it. */
  subAttention: SubAttention
  prs: SourceLink[]
  repo: string
  updated: string
  /** True when this goal is an ARCHIVED (history) team-lead session with no
   *  live slot — it has no agents, loop or live status; the UI shows it as a
   *  dimmed, openable goal rather than a running team. A live goal built from
   *  the slot list is false. */
  archived: boolean
  /** Every session under the lead at its real depth (a sub-conductor's own
   *  sessions nested under it). Absent on a goal built without one; then
   *  `sessionTree` falls back to the two-level rollup. */
  tree?: SessionNode[]
}

/** Sessions under a goal's lead that want the person, by kind, each list most
 *  recent first. `needsYou` is a pending approval or a question; `stalled` an
 *  interrupted turn awaiting a resume. */
export interface SubAttention {
  needsYou: Member[]
  stalled: Member[]
}

export const NO_SUB_ATTENTION: SubAttention = { needsYou: [], stalled: [] }

/** Collect the needs-you / stalled sessions among `members` (the lead's
 *  descendants), de-duplicated by key, most recent first. */
export function subAttentionOf(members: Member[]): SubAttention {
  const seen = new Set<string>()
  const out: SubAttention = { needsYou: [], stalled: [] }
  for (const m of members) {
    if (!m.slot.key || seen.has(m.slot.key)) continue
    seen.add(m.slot.key)
    if (m.status === 'needs_you') out.needsYou.push(m)
    else if (m.status === 'stalled') out.stalled.push(m)
  }
  const recent = (a: Member, b: Member) => updatedAt(b.slot).localeCompare(updatedAt(a.slot))
  out.needsYou.sort(recent)
  out.stalled.sort(recent)
  return out
}

/** A lead's own status: its slot, with an idle lead on an active loop reading
 *  as working. */
export function leadStatusOf(lead: Slot, loop: Loop | null): Status {
  const own = slotStatus(lead)
  return own === 'idle' && loop?.active ? 'working' : own
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

/** The key of the row `s` nests under in `byKey`, or null for a root. The
 *  host's lineage edge (`parent.key`) wins, since it already resolved a closed
 *  creator to its nearest live ancestor; `created_by` covers a frame without it.
 *  A self-edge or a key naming no row in the payload is no edge. */
export function parentKeyOf(s: Slot, byKey: Map<string, Slot>): string | null {
  const viaLineage = (s.parent?.key || '').trim()
  if (viaLineage && viaLineage !== s.key && byKey.has(viaLineage)) return viaLineage
  const viaCreator = (s.created_by || '').trim()
  if (viaCreator && viaCreator !== s.key && byKey.has(viaCreator)) return viaCreator
  return null
}

export function buildProjects(slots: Slot[], loops: Loop[]): Project[] {
  const byKey = new Map(slots.map(s => [s.key, s]))
  const parentOf = new Map<string, string>()
  const children = new Map<string, Slot[]>()
  for (const s of slots) {
    const parent = parentKeyOf(s, byKey)
    if (!parent) continue
    parentOf.set(s.key, parent)
    const list = children.get(parent) ?? []
    list.push(s)
    children.set(parent, list)
  }

  // Descendants with a visited set, so a corrupt lineage cycle cannot hang.
  const descendants = (key: string, seen: Set<string>): Slot[] => {
    const out: Slot[] = []
    for (const c of children.get(key) ?? []) {
      if (seen.has(c.key)) continue
      seen.add(c.key)
      out.push(c, ...descendants(c.key, seen))
    }
    return out
  }

  // A lead is a goal unless another LEAD sits above it: a conductor a team lead
  // dispatched nests in that lead's tree, while a conductor opened from a plain
  // chat (a non-lead parent) is still a goal of its own rather than vanishing.
  const hasLeadAncestor = (s: Slot): boolean => {
    const seen = new Set([s.key])
    let cursor = parentOf.get(s.key)
    while (cursor && !seen.has(cursor)) {
      seen.add(cursor)
      if (isLeadAgent(byKey.get(cursor)?.agent)) return true
      cursor = parentOf.get(cursor)
    }
    return false
  }
  const isRootLead = (s: Slot) => isLeadAgent(s.agent) && !hasLeadAncestor(s)

  const byRecent = (a: Member, b: Member) => updatedAt(b.slot).localeCompare(updatedAt(a.slot))
  const member = (s: Slot): Member => ({ slot: s, status: slotStatus(s) })

  // The full-depth sessions tree under `key`: leads and sessions with their own
  // children first (as sub-leads), then plain workers, each most recent first.
  const treeUnder = (key: string, seen: Set<string>): SessionNode[] => {
    const nodes: SessionNode[] = []
    for (const c of children.get(key) ?? []) {
      if (seen.has(c.key)) continue
      seen.add(c.key)
      const below = treeUnder(c.key, seen)
      const role = isLeadAgent(c.agent) || below.length > 0 ? 'sub-lead' : 'worker'
      nodes.push({ member: member(c), role, children: below })
    }
    const rank = (n: SessionNode) => (n.role === 'sub-lead' ? 1 : 0)
    return nodes.sort((a, b) => rank(b) - rank(a) || byRecent(a.member, b.member))
  }

  const projects: Project[] = []
  for (const lead of slots.filter(isRootLead)) {
    const seen = new Set([lead.key])
    const subTeams: SubTeam[] = []
    const workers: Member[] = []
    for (const child of children.get(lead.key) ?? []) {
      if (seen.has(child.key)) continue
      seen.add(child.key)
      const below = descendants(child.key, seen)
      if (below.length || isLeadAgent(child.agent)) {
        subTeams.push({ lead: member(child), workers: below.map(member).sort(byRecent) })
      } else workers.push(member(child))
    }
    workers.sort(byRecent)
    subTeams.sort((a, b) => byRecent(a.lead, b.lead))

    const all = [member(lead), ...subTeams.flatMap(t => [t.lead, ...t.workers]), ...workers]
    const loop = loopFor(lead.key, loops)
    const leadStatus = leadStatusOf(lead, loop)
    // The rollup is for ordering and the project dot only, never a lead label.
    const rollupStatus = all.slice(1).reduce<Status>((acc, m) => worst(acc, m.status), leadStatus)

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
      leadStatus,
      rollupStatus,
      subAttention: subAttentionOf(all.slice(1)),
      prs: [...prs.values()],
      repo: basename(lead.project),
      updated: all.map(m => updatedAt(m.slot)).sort().pop() ?? '',
      archived: false,
      tree: treeUnder(lead.key, new Set([lead.key])),
    })
  }

  // Projects needing attention first, then most recently updated.
  return projects.sort(
    (a, b) => STATUS_RANK[b.rollupStatus] - STATUS_RANK[a.rollupStatus] || b.updated.localeCompare(a.updated),
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
 * A project's goals are its root lead sessions (`isLeadAgent`). The LIVE ones
 * come from `/api/chat/slots` (above). The ARCHIVED ones are history sessions
 * with no open slot: `GET /api/sessions` lists every session file, each row
 * carrying `key`, `title`, `agent`, `folder_id` and `modified` (see core
 * `history_search.list_sessions`). An archived goal is a history row whose
 * agent is a lead (team lead or conductor), filed in the project's folder, that no live slot
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
    leadStatus: 'idle',
    rollupStatus: 'idle',
    subAttention: NO_SUB_ATTENTION,
    prs: [],
    repo: '',
    updated: archivedUpdatedAt(s),
    archived: true,
  }
}

/**
 * The archived lead goals of a project, newest first. An archived goal is
 * a history row that:
 *   - is a lead session (`isLeadAgent`: the team lead or a conductor),
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
    if (!isLeadAgent(s.agent)) continue
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

/* Every chat and folder the app CREATES starts on the team lead, whatever the
 * folder's own `default_agent` says: a folder another surface set up (e.g.
 * Slack Code's auto folders, default `kirocrew-conductor`) must not turn a new
 * goal into a conductor chat. The host's slot create honours the body's
 * `agent` and does not consult the folder default, so naming it here is what
 * decides. Existing chats and folders are never re-written. These builders are
 * the only bodies App.tsx sends on its create paths (pinned in create.test.ts). */

/** POST /api/chat/folders body for New project. */
export function newProjectRequest(name: string, directories: readonly string[]): Record<string, unknown> {
  const [first, ...rest] = directories
  const body: Record<string, unknown> = { name, default_agent: TEAM_LEAD_AGENT }
  if (first) body.project_dir = first
  if (rest.length) body.extra_repos = rest
  return body
}

/** POST /api/chat/slots body for New goal: a fresh team-lead chat filed into
 *  the project's folder at birth. */
export function newGoalRequest(p: Pick<FolderProject, 'folder'>): { agent: string; folder_id: string } {
  return { agent: TEAM_LEAD_AGENT, folder_id: p.folder.id }
}

/** The openChat options that land the person in the goal chat just created. */
export function newGoalLaunch(slotKey: string | undefined): { slotKey: string | undefined; agent: string; autoSend: false } {
  return { slotKey, agent: TEAM_LEAD_AGENT, autoSend: false }
}

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
  /** The project's GOALS: each is a root lead session (team lead or conductor), with its
   *  sub-team/worker rollup grouped UNDER it. Live goals (`archived: false`)
   *  come from the slot list and carry their agents, loop and status; archived
   *  goals (`archived: true`) are history lead sessions with no live slot,
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
    // A genuine rollup: the project's dot counts every session of every goal.
    const status = liveGoals.reduce<Status>((acc, t) => worst(acc, t.rollupStatus), 'idle')
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

/* ---------------------------------------------------------------------------
 * Waiting-on-you inbox.
 *
 * The cross-project roll-up of every session that needs the PERSON: the
 * `needs_you` sessions (pending approval || needs input) and the `stalled`
 * ones (interrupted), across every project. A pending approval is surfaced
 * explicitly as its own kind so the inbox can say WHY a session needs you, not
 * just that it does. `working` and `idle` sessions never enter the inbox —
 * they need no one.
 *
 * The roll-up reuses the projects already built (`buildFolderProjects`), so a
 * session enters the inbox exactly once, attributed to the project that owns
 * it, with no second pass over the raw slot list. An ARCHIVED goal is idle by
 * construction, so it never contributes.
 * ------------------------------------------------------------------------- */

/** Why a session is in the inbox. `approval` is the subset of `needs_you`
 *  waiting on a tool approval; `needs_input` is the rest of `needs_you` (a
 *  question or a decision the agent is blocked on); `stalled` is an interrupted
 *  session awaiting a resume. */
export type InboxKind = 'approval' | 'needs_input' | 'stalled'

/** One row in the Waiting-on-you inbox: a session that needs the person,
 *  carrying enough to name it, say what it waits for, and open it. */
export interface InboxItem {
  /** The owning session's slot key — `openChat({ slotKey })` opens it. */
  slotKey: string
  /** The project (folder) the session belongs to. */
  projectId: string
  projectName: string
  /** The session/goal title; the inbox names the session itself. */
  sessionTitle: string
  /** Which status put it here, for the badge and the "waiting for" line. */
  kind: InboxKind
  /** The session's last activity, so the inbox sorts newest-first and shows a
   *  relative time. Empty when unknown — never guessed. */
  updated: string
  /** The last message, as a one-line hint of what it is waiting on. */
  lastMessage: string
}

/** The inbox rank: a pending approval is the most acute (a tool is blocked
 *  waiting on a yes/no), then other needs-you input, then a stalled session a
 *  resume would move. Higher sorts first. */
const INBOX_RANK: Record<InboxKind, number> = { approval: 3, needs_input: 2, stalled: 1 }

/** Classify a slot already known to need the person into an inbox kind. Returns
 *  null for a slot that needs no one (working/idle); the caller only passes
 *  needs_you/stalled slots, but this stays total so a caller change can't
 *  silently admit a working session. A pending approval wins over needs_input
 *  when both are set — the approval is the blocking ask. */
function inboxKind(s: Slot): InboxKind | null {
  if (s.pending_approval) return 'approval'
  if (s.needs_input) return 'needs_input'
  if (s.interrupted) return 'stalled'
  return null
}

/**
 * Every session that needs the person, across all projects, most-acute and
 * newest first. Walks each project's live goals (lead + sub-team leads +
 * workers), keeps only the `needs_you` and `stalled` members, and attributes
 * each to its project. De-duplicated by slot key (a session appears in exactly
 * one goal, but a defensive guard keeps a corrupt double-listing from showing
 * twice). Sorted by kind (approval › needs_input › stalled), then most recent.
 */
export function buildInbox(projects: FolderProject[]): InboxItem[] {
  const items: InboxItem[] = []
  const seen = new Set<string>()
  const consider = (m: Member, projectId: string, projectName: string) => {
    if (m.status !== 'needs_you' && m.status !== 'stalled') return
    const kind = inboxKind(m.slot)
    if (!kind) return
    const key = m.slot.key
    if (!key || seen.has(key)) return
    seen.add(key)
    items.push({
      slotKey: key,
      projectId,
      projectName,
      sessionTitle: m.slot.title || '',
      kind,
      updated: updatedAt(m.slot),
      lastMessage: m.slot.last_message || '',
    })
  }
  for (const p of projects) {
    for (const goal of p.goals) {
      if (goal.archived) continue // idle by construction — needs no one
      consider(goal.lead, p.folder.id, p.folder.name)
      for (const sub of goal.subTeams) {
        consider(sub.lead, p.folder.id, p.folder.name)
        for (const w of sub.workers) consider(w, p.folder.id, p.folder.name)
      }
      for (const w of goal.workers) consider(w, p.folder.id, p.folder.name)
    }
  }
  return items.sort(
    (a, b) => INBOX_RANK[b.kind] - INBOX_RANK[a.kind] || b.updated.localeCompare(a.updated),
  )
}

/* ---------------------------------------------------------------------------
 * Subscriptions — what is watching on a project's behalf.
 *
 * Cursor's "Projects" let a coordinator act on signals without a prompt: watch
 * a channel, run on a schedule, follow PRs. Kiro Crew already has the pieces —
 * monitor loops (`/api/autonudge`), Slack-linked sessions (`/api/chat/slots`),
 * and cron schedules (`/api/crons`). This panel SHOWS what is already armed on
 * the project's own sessions; it never arms anything itself (an "Add
 * subscription" button opens an unsent draft in the lead session, and the
 * agent sets it up with its own tools).
 *
 * A subscription is attributed to a project when its OWNING SESSION belongs to
 * the project — the same `projectSessionKeys` membership the Library uses. So
 * a loop or a Slack link on a session outside the project never appears here.
 *
 * Three kinds, by what the app can actually read:
 *
 *   monitor  — an ACTIVE loop (`/api/autonudge`) on a project session. The
 *              reduced legacy read has no owner gate and no app scope, so every
 *              loop is visible: cadence (`idle_secs`), progress
 *              (`cycle_count`/`max_cycles`) and the next fire (`next_due_ts`)
 *              are all real.
 *   slack    — a session the host reports `slack_linked` for, carrying the
 *              `slack_channel` it is bound to. From the slot list the app
 *              already reads.
 *   schedule — a cron. The `/api/crons` GET is scoped to the CALLING APP's own
 *              jobs (`app_owner_name(created_by) == app`), so a project-hub
 *              token sees only crons IT created — and it creates none. The
 *              person's crons are therefore invisible to the app. Rather than
 *              grant a permission that returns an empty list and read as "no
 *              schedules" (a lie), the schedule kind degrades to an explicit
 *              UNAVAILABLE row. See `cronsAvailable` below.
 * ------------------------------------------------------------------------- */

/** Which kind of watcher a subscription row is. */
export type SubscriptionKind = 'monitor' | 'slack'

/** One subscription row: a watcher armed on one of the project's sessions. */
export interface Subscription {
  /** The owning session's slot key — a row opens it with `openChat({ slotKey })`. */
  slotKey: string
  /** The owning session's title, so the row names what is watching. */
  sessionTitle: string
  kind: SubscriptionKind
  /** A one-line human description of the watch (cadence, channel). */
  detail: string
  /** Monitor only: how far the loop has run, e.g. "7/300" or "7". Empty for a
   *  Slack row. */
  progress: string
  /** Monitor only: epoch-seconds of the next scheduled fire, as an ISO string
   *  for the UI's relative-time helper. Empty when none is scheduled or for a
   *  Slack row — never guessed. */
  nextFire: string
}

/** The loops that belong to a project, keyed for lookup. Internal. */
function activeLoopsByKey(loops: Loop[]): Map<string, Loop> {
  // Prefer the ACTIVE loop for a slot — a subscription is a live watch. A
  // stopped loop is not watching anything, so it is not a subscription.
  const out = new Map<string, Loop>()
  for (const l of loops) {
    if (!l.active) continue
    const key = (l.slot_key || '').trim()
    if (key && !out.has(key)) out.set(key, l)
  }
  return out
}

/** The monitor-loop cadence as a human cell, in whole units. Seconds under a
 *  minute read as seconds, under an hour as minutes, else hours — coarse on
 *  purpose, since a monitor cadence is a round interval. Empty when unknown. */
export function cadenceText(idleSecs: number | undefined): string {
  const s = typeof idleSecs === 'number' && Number.isFinite(idleSecs) ? Math.round(idleSecs) : 0
  if (s <= 0) return ''
  if (s < 60) return `every ${s}s`
  if (s < 3600) {
    const m = Math.round(s / 60)
    return m === 1 ? 'every minute' : `every ${m} min`
  }
  const h = Math.round(s / 3600)
  return h === 1 ? 'every hour' : `every ${h} h`
}

/** An epoch-seconds field (loop `next_due_ts` / `last_fire_ts`) as an ISO
 *  string the UI formats with its relative-time helper. Empty (never a guess)
 *  when the value is absent, non-positive or unparseable. */
function epochToIso(secs: number | undefined): string {
  if (typeof secs !== 'number' || !Number.isFinite(secs) || secs <= 0) return ''
  return new Date(secs * 1000).toISOString()
}

/**
 * The subscriptions a project owns, across every session it owns: the ACTIVE
 * monitor loops on those sessions and the Slack-linked ones. Ordered monitors
 * first (a cadence-driven watch is the strongest signal), then Slack links,
 * each group by session title so the list is stable.
 *
 * `goals` yields the project's session keys (`projectSessionKeys`, live rollup
 * plus archived goal leads); `slotsByKey` resolves each key to its slot for the
 * title and Slack fields; `loops` is the `/api/autonudge` list. A key with no
 * live slot (an archived goal lead) carries neither a loop nor a Slack link, so
 * it contributes nothing — correct, since an archived goal is not watching.
 *
 * Crons are NOT joined here: the app cannot read the person's crons (see the
 * section header). `cronsAvailable` reports that so the UI can show an honest
 * unavailable row instead of a silent gap.
 */
export function buildSubscriptions(
  goals: Project[],
  slotsByKey: Map<string, Slot>,
  loops: Loop[],
): Subscription[] {
  const ownedKeys = projectSessionKeys(goals)
  const owned = new Set(ownedKeys)
  const activeLoops = activeLoopsByKey(loops)

  const monitors: Subscription[] = []
  const slack: Subscription[] = []
  for (const key of ownedKeys) {
    const slot = slotsByKey.get(key)
    const title = slot?.title || ''
    const loop = activeLoops.get(key)
    if (loop) {
      monitors.push({
        slotKey: key,
        sessionTitle: title,
        kind: 'monitor',
        detail: cadenceText(loop.idle_secs),
        progress: loopText(loop),
        nextFire: epochToIso(loop.next_due_ts),
      })
    }
    // Only a LIVE slot can carry a Slack link; an archived goal lead has no slot.
    if (slot && slot.slack_linked) {
      slack.push({
        slotKey: key,
        sessionTitle: title,
        kind: 'slack',
        detail: (slot.slack_channel || '').trim(),
        progress: '',
        nextFire: '',
      })
    }
  }
  // `owned` is referenced so a future caller change that drops a key from the
  // membership set is caught by the type checker rather than silently widening.
  void owned
  const byTitle = (a: Subscription, b: Subscription) =>
    (a.sessionTitle || '').localeCompare(b.sessionTitle || '')
  monitors.sort(byTitle)
  slack.sort(byTitle)
  return [...monitors, ...slack]
}

/** One row of `GET /api/project-schedules/{folder_id}` (Kiro Crew core). A
 *  REDUCED cron record: the route never returns a job's message, script,
 *  command, env or result text, so nothing here can carry a prompt or secret. */
export interface ProjectSchedule {
  id: string
  name: string
  schedule: string
  cron_expr: string | null
  every_secs: number | null
  timezone: string | null
  enabled: boolean
  user_paused: boolean
  /** Epoch seconds of the next fire, or null when none is due. */
  next_run: number | null
  last_status: string | null
  session_key: string | null
}

export interface ProjectSchedulesPage {
  schedules: ProjectSchedule[]
  folder_id: string
  server_tz: string | null
}

/** What the Schedules group can say. `unavailable` covers a gateway that
 *  predates the route (404) or an install that did not grant it (403): the
 *  panel then keeps its honest "can't be listed here" note, never an empty list
 *  that would read as "no schedules". */
export type SchedulesState =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; schedules: ProjectSchedule[] }

export function schedulesState(
  data: unknown,
  error: unknown,
  loading: boolean,
): SchedulesState {
  if (error) return { kind: 'unavailable' }
  if (loading) return { kind: 'loading' }
  const rows = (data as ProjectSchedulesPage | undefined)?.schedules
  if (!Array.isArray(rows)) return { kind: 'unavailable' }
  // Paused (by the person or by repeated failures) sinks below running ones;
  // then soonest first.
  const sorted = [...rows].sort((a, b) => {
    const pa = a.enabled ? 0 : 1
    const pb = b.enabled ? 0 : 1
    if (pa !== pb) return pa - pb
    return (a.next_run ?? Infinity) - (b.next_run ?? Infinity)
  })
  return { kind: 'ready', schedules: sorted }
}

/* ---------------------------------------------------------------------------
 * Three-column workspace: which goal is selected, and what the middle column
 * shows (the goal's lead chat, or one of its sessions opened in place).
 * ------------------------------------------------------------------------- */

/** When a goal was last active: the whole team's latest activity, falling back
 *  to the lead's own timestamps. */
export function goalActivity(g: Project): string {
  return g.updated || g.lead.slot.last_activity_ts || g.lead.slot.last_ts || ''
}

/** The goal selected when the person has not picked one: the most recently
 *  active LIVE goal; with no live goal, the most recent archived one; with no
 *  goals at all, none. Ties keep the project's own goal order. */
export function defaultGoalKey(goals: Project[]): string | null {
  const live = goals.filter(g => !g.archived)
  const pool = live.length ? live : goals
  let best: Project | null = null
  for (const g of pool) if (!best || goalActivity(g) > goalActivity(best)) best = g
  return best ? best.lead.slot.key : null
}

/** The goal to show for a requested key: that goal when it still exists,
 *  otherwise the default goal (a goal that vanished never leaves a blank page). */
export function resolveGoal(goals: Project[], key: string | null): Project | null {
  const picked = key ? goals.find(g => g.lead.slot.key === key) : undefined
  if (picked) return picked
  const fallback = defaultGoalKey(goals)
  return goals.find(g => g.lead.slot.key === fallback) ?? null
}

/** Every session under a goal except its lead, flattened (sub-leads, their
 *  workers, then the lead's direct workers). */
export function goalMembers(goal: Project): Member[] {
  return [...goal.subTeams.flatMap(st => [st.lead, ...st.workers]), ...goal.workers]
}

/** What the person has picked: a goal, and optionally one of its sessions
 *  opened in the middle column in place of the lead chat. */
export interface WorkspaceState {
  goalKey: string | null
  sessionKey: string | null
}

export type WorkspaceAction =
  | { type: 'selectGoal'; key: string }
  | { type: 'openSession'; key: string }
  | { type: 'backToLead' }
  /** Open one session of a goal in one step (Overview's Needs you and Recent
   *  rows): the goal is selected and, unless the session IS its lead, that
   *  session replaces the lead chat. */
  | { type: 'openInGoal'; goalKey: string; sessionKey: string }

/** Selecting a goal (even the current one) always resets the middle column to
 *  that goal's lead; opening a session keeps the goal; Back returns to the lead. */
export function workspaceReducer(s: WorkspaceState, a: WorkspaceAction): WorkspaceState {
  switch (a.type) {
    case 'selectGoal':
      return { goalKey: a.key, sessionKey: null }
    case 'openSession':
      return { ...s, sessionKey: a.key }
    case 'backToLead':
      return { ...s, sessionKey: null }
    case 'openInGoal':
      return { goalKey: a.goalKey, sessionKey: a.sessionKey === a.goalKey ? null : a.sessionKey }
  }
}

/** What the middle column draws for a state: the resolved goal and, when a
 *  session of THAT goal is open, that session. A session key that does not
 *  belong to the goal (it closed, or the goal changed) falls back to the lead. */
export function middleTarget(
  goals: Project[],
  s: WorkspaceState,
  extra: Member[] = [],
): { goal: Project | null; session: Member | null } {
  const goal = resolveGoal(goals, s.goalKey)
  if (!goal || !s.sessionKey) return { goal, session: null }
  const session = [...goalMembers(goal), ...extra].find(m => m.slot.key === s.sessionKey) ?? null
  return { goal, session }
}

/** Which goal row the side panel marks selected: the resolved goal while the
 *  middle shows its lead chat, and NONE while one of its sessions is open
 *  there (only that session's row is selected then). `openKey` is the session
 *  the middle actually draws, so a stale session key never deselects. */
export function selectedGoalKey(goalKey: string | null, openKey: string | null): string | null {
  return openKey ? null : goalKey
}

/** The colored state a session row shows, read only from the slot data the
 *  app already has (`/api/chat/slots`): a pending tool approval, a question
 *  waiting on the person, an interrupted turn, a running turn, or idle. `done`
 *  is an idle session whose change has merged (its own source link says so).
 *  Nothing here is read from a transcript. */
export type SessionTone = 'done' | 'working' | 'needs_approval' | 'needs_you' | 'stalled' | 'idle'

export function sessionTone(m: Member): SessionTone {
  if (m.slot.pending_approval) return 'needs_approval'
  if (m.status !== 'idle') return m.status
  const merged = (m.slot.source_links ?? []).some(
    l => (l.kind ?? 'change') === 'change' && l.state === 'merged',
  )
  return merged ? 'done' : 'idle'
}

/** One row of the goal's sessions tree: a sub-lead with its workers nested
 *  one level under it, or a worker of the lead itself. */
export interface SessionNode {
  member: Member
  role: 'sub-lead' | 'worker'
  children: SessionNode[]
}

/** The goal's sessions as a tree. A live goal carries its full-depth tree
 *  (`Project.tree`); otherwise the two-level rollup: sub-teams first (their
 *  workers nested), then the lead's direct workers. */
export function sessionTree(goal: Project): SessionNode[] {
  if (goal.tree) return goal.tree
  const leaf = (m: Member): SessionNode => ({ member: m, role: 'worker', children: [] })
  return [
    ...goal.subTeams.map<SessionNode>(st => ({ member: st.lead, role: 'sub-lead', children: st.workers.map(leaf) })),
    ...goal.workers.map(leaf),
  ]
}

/* ---------------------------------------------------------------------------
 * Task board: a goal lead's WORK LEDGER drawn as a permanent board.
 *
 * DORMANT on today's host. No host route serves a session's work ledger to an
 * app: `/api/work-ledger` is MCP-only and keyed by the caller's own session,
 * `/api/crew-board` and `/api/members/{slug}/dashboard` are owner-only (an app
 * principal is never the owner) and mask `worker_session_key`. So the page only
 * draws a board when a `BoardSource` is supplied; without one it shows the
 * sessions tree above. Nothing here is derived from transcripts.
 * ------------------------------------------------------------------------- */

/** One work-ledger item, the fields the board reads (WorkItem.to_dict()). */
export interface LedgerItem {
  item_id: string
  title: string
  /** open | accepted | rejected | abandoned */
  state: string
  /** The worker's last report: progress | done | blocked | question. */
  status?: string | null
  /** On blocked/question: approval | needs_human when only a person can move it. */
  reason?: string | null
  summary?: string
  worker_session_key?: string
  stale?: boolean
}

export interface LedgerRead {
  items: LedgerItem[]
}

/** Whether a ledger read is something to draw. The board appears only when a
 *  source answers with at least one item; null, a malformed body or an empty
 *  ledger all keep the sessions tree. */
export function ledgerHasData(read: unknown): read is LedgerRead {
  const items = (read as LedgerRead | null | undefined)?.items
  return Array.isArray(items) && items.length > 0
}

/** Reads a conductor session's ledger; resolves null when it owns none. */
export type BoardSource = (conductorKey: string) => Promise<LedgerRead | null>

export type TaskTone = 'done' | 'working' | 'needs_you' | 'stuck' | 'waiting'

export interface TaskRow {
  id: string
  title: string
  tone: TaskTone
  summary: string
  /** The worker's LIVE session key, when it has one to open. */
  sessionKey: string | null
  /** A worker that is itself a conductor: its own tasks, one level down. */
  children: TaskRow[]
}

export interface NeedsYouRow {
  id: string
  title: string
  waitsFor: 'approval' | 'needs_human'
  summary: string
  sessionKey: string | null
}

export interface TaskBoard {
  rows: TaskRow[]
  needsYou: NeedsYouRow[]
  /** Top-level tasks accepted / top-level tasks on the board. */
  done: number
  total: number
  /** The goal's sessions bound to no task on the board (or a nested one). */
  otherSessions: Member[]
}

const ASKING = new Set(['blocked', 'question'])
const PERSON_REASONS = new Set(['approval', 'needs_human'])

/** Why an item waits on the PERSON, or null. A pending tool approval on the
 *  worker's session counts even when the worker has not reported it. */
export function waitsOnPerson(item: LedgerItem, slot?: Slot): 'approval' | 'needs_human' | null {
  if (item.state !== 'open') return null
  if (ASKING.has(item.status ?? '') && PERSON_REASONS.has(item.reason ?? '')) {
    return item.reason as 'approval' | 'needs_human'
  }
  return slot?.pending_approval ? 'approval' : null
}

/** The colored state one task shows. */
export function taskTone(item: LedgerItem, slot?: Slot): TaskTone {
  if (item.state === 'accepted') return 'done'
  if (item.state === 'rejected' || item.state === 'abandoned') return 'stuck'
  if (waitsOnPerson(item, slot)) return 'needs_you'
  if (item.status === 'blocked' || item.stale || slot?.interrupted) return 'stuck'
  // A worker's 'done' is a claim awaiting the conductor's verdict; a question
  // without a person reason waits on the conductor too.
  if (item.status === 'done' || item.status === 'question') return 'waiting'
  if (slot?.running || item.status === 'progress') return 'working'
  return 'waiting'
}

/** Build the board for a goal from its lead's ledger. `nested` answers a
 *  worker's own ledger (a sub-conductor), drawn one level under its task. */
export function buildTaskBoard(
  goal: Project,
  ledger: LedgerRead,
  slotsByKey: Map<string, Slot>,
  nested: (workerKey: string) => LedgerRead | null = () => null,
): TaskBoard {
  const bound = new Set<string>()
  const needsYou: NeedsYouRow[] = []
  const toRow = (item: LedgerItem, depth: number): TaskRow => {
    const key = (item.worker_session_key || '').trim()
    if (key) bound.add(key)
    const slot = key ? slotsByKey.get(key) : undefined
    const waits = waitsOnPerson(item, slot)
    if (waits) {
      needsYou.push({ id: item.item_id, title: item.title, waitsFor: waits, summary: item.summary || '', sessionKey: slot ? key : null })
    }
    const sub = depth === 0 && key ? nested(key) : null
    return {
      id: item.item_id,
      title: item.title,
      tone: taskTone(item, slot),
      summary: item.summary || '',
      sessionKey: slot ? key : null,
      children: sub ? (sub.items ?? []).map(i => toRow(i, depth + 1)) : [],
    }
  }
  const rows = (ledger.items ?? []).map(i => toRow(i, 0))
  return {
    rows,
    needsYou,
    done: rows.filter(r => r.tone === 'done').length,
    total: rows.length,
    otherSessions: goalMembers(goal).filter(m => !bound.has(m.slot.key)),
  }
}
