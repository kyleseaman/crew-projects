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
