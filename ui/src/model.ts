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
  /** The team rollups (lead + its agents) whose sessions are filed in this
   *  folder, or whose working directory matches one of the project's repos.
   *  The project page renders these under the header. */
  teams: Project[]
  /** Worst-first status across the project's teams, for the list dot. */
  status: Status
  /** Most recent activity across the project's teams. */
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
export function buildFolderProjects(folders: Folder[], slots: Slot[] = [], loops: Loop[] = []): FolderProject[] {
  const tops = folders.filter(f => !(f.parent_id && f.parent_id !== f.id))
  const allTeams = buildProjects(slots, loops)

  const result = tops.map<FolderProject>(folder => {
    const repos = folderRepos(folder)
    const repoSet = new Set(repos)
    const instructions = Array.isArray(folder.steering_dirs)
      ? folder.steering_dirs.filter(s => typeof s === 'string' && s.trim() !== '')
      : []
    const subtree = folderSubtreeIds(folders, folder.id)
    const teams = allTeams.filter(team => {
      const lead = team.lead.slot
      // A session filed into a folder belongs to THAT folder's project. The
      // working-directory match is only a fallback for a session with no
      // folder — otherwise two folders sharing one project_dir would both
      // attract every team sitting in that directory.
      if (lead.folder_id) return subtree.has(lead.folder_id)
      const leadProject = (lead.project || '').trim()
      return leadProject !== '' && repoSet.has(leadProject)
    })
    const status = teams.reduce<Status>((acc, t) => worst(acc, t.status), 'idle')
    const updated = teams.map(t => t.updated).sort().pop() ?? ''
    return {
      folder,
      repos,
      defaultAgent: (folder.default_agent || '').trim() || DEFAULT_PROJECT_AGENT,
      instructions,
      needsDir: repos.length === 0,
      teams,
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
