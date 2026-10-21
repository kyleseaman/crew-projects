/**
 * The Overview tab's numbers, derived from data the app already reads (the
 * slot list, folders, sessions and autonudge loops, already folded into a
 * `FolderProject` by model.ts). Pure, so every count is tested without a DOM.
 * No task-ledger data is read here: the board stays dormant.
 *
 * Needs you lists every live session waiting on the person (a goal's lead
 * and every session under it). The summary line and the Goals rows count
 * GOALS by their lead's own status. Archived goals are history rows with no
 * live state, so they never count. Chats that belong to no goal never appear.
 */
import {
  dedupeProjectPrs,
  goalActivity,
  goalMembers,
  type FolderProject,
  type InboxKind,
  type Member,
  type Project,
  type Slot,
  type SourceLink,
  type Status,
} from './model'

/** One "Needs you" row: a session waiting on the person, and the goal it
 *  belongs to (so a click can select that goal and open the session). */
export interface OverviewNeed {
  slotKey: string
  goalKey: string
  title: string
  kind: InboxKind
  /** A short plain description of what it waits for (`needHint`). */
  hint: string
  /** Last activity; empty when unknown. */
  updated: string
}

/** The one summary line at the top of the tab (0.9.3, replacing the four
 *  "Right now" tiles). `goals`, `working` and `idle` count GOALS by their
 *  lead's own status (`Project.leadStatus`), never every chat; `needYou` is
 *  how many rows Needs you lists. A goal whose lead itself waits or stalled
 *  is in neither working nor idle: it is one of the Needs you rows. */
export interface OverviewSummary {
  goals: number
  working: number
  idle: number
  needYou: number
}

export interface OverviewGoal {
  key: string
  title: string
  /** The LEAD's own status (never the rollup). */
  leadStatus: Status
  /** The first sentence of the lead's latest ASSISTANT message, or '' when
   *  the slot row cannot say the latest message is the lead's (`leadQuote`). */
  quote: string
  /** Every chat in the goal: the lead and each session under it. */
  chats: number
  /** Pull requests the goal's sessions mention, de-duplicated. */
  prs: number
  activity: string
}

/** PRs grouped by what the app can actually read off each link. A link whose
 *  merge state and checks the host did not report lands in `unknown` rather
 *  than being guessed into Open. */
export interface PrGroups {
  failing: SourceLink[]
  open: SourceLink[]
  merged: SourceLink[]
  closed: SourceLink[]
  unknown: SourceLink[]
}

export type RecentKind = 'finished' | 'working' | 'approval'

export interface RecentEvent {
  slotKey: string
  goalKey: string
  title: string
  kind: RecentKind
  ts: string
}

export interface Overview {
  needs: OverviewNeed[]
  summary: OverviewSummary
  goals: OverviewGoal[]
  prs: PrGroups
  prTotal: number
  recent: RecentEvent[]
}

/** How many Recent rows to show. */
export const RECENT_LIMIT = 5

const NEED_RANK: Record<InboxKind, number> = { approval: 3, needs_input: 2, stalled: 1 }

const ts = (m: Member) => m.slot.last_activity_ts || m.slot.last_ts || ''

/** What a pending tool approval asks to do, in plain words, from the ACP
 *  tool kind the slot row carries. */
const TOOL_KIND_HINT: Record<string, string> = {
  execute: 'run a shell command',
  edit: 'edit a file',
  delete: 'delete a file',
  move: 'move a file',
  read: 'read a file',
  search: 'search files',
  fetch: 'fetch a web page',
  spawn: 'start a sub-agent',
}

/** The Needs you row's hint. An approval names the tool kind when the slot
 *  exposes one (`pending_approval_info.tool_kind`), else says it waits. */
export function needHint(s: Slot, kind: InboxKind): string {
  if (kind === 'approval') {
    const k = (s.pending_approval_info?.tool_kind || '').trim().toLowerCase()
    return TOOL_KIND_HINT[k] ?? 'waiting for your approval'
  }
  if (kind === 'needs_input') return 'waiting for your answer'
  return 'needs a resume'
}

/** The first sentence of `text` (up to the first . ! or ? that ends a word),
 *  whitespace collapsed. The host already caps `last_message` at 80
 *  characters with an ellipsis; a first sentence past that keeps it. */
export function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const m = /^(.*?[.!?])(\s|$)/.exec(flat)
  return (m ? m[1] : flat).trim()
}

/** The lead's latest assistant words, quoted only when the slot row says the
 *  latest conversational message IS the assistant's: `waiting_for_input`
 *  (turn over, assistant spoke last) for `last_message`, or `has_options`
 *  for `prompt_preview`. Otherwise '' — `last_message` may be the person's
 *  own prompt, and quoting that as the lead would invent. */
export function leadQuote(s: Slot): string {
  if (s.has_options && s.prompt_preview) return firstSentence(s.prompt_preview)
  if (s.waiting_for_input === true && s.last_message) return firstSentence(s.last_message)
  return ''
}

function needKind(m: Member): InboxKind | null {
  const s = m.slot
  if (s.pending_approval) return 'approval'
  if (s.needs_input) return 'needs_input'
  if (s.interrupted) return 'stalled'
  return null
}

/** What a session's latest activity was, read from its slot flags. Sessions
 *  waiting on input or stalled are under Needs you, not here. */
function recentKind(m: Member): RecentKind | null {
  const s = m.slot
  if (s.pending_approval) return 'approval'
  if (s.needs_input || s.interrupted) return null
  if (s.running) return 'working'
  return 'finished'
}

/** Every live session of a goal, the lead first, de-duplicated by key. */
function sessionsOf(goal: Project): Member[] {
  const seen = new Set<string>()
  const out: Member[] = []
  for (const m of [goal.lead, ...goalMembers(goal)]) {
    const k = m.slot.key
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(m)
  }
  return out
}

/** Group links by the state and checks the link itself carries. A merged or
 *  closed PR is never "failing", whatever its last check read. */
export function groupPrs(links: SourceLink[]): PrGroups {
  const g: PrGroups = { failing: [], open: [], merged: [], closed: [], unknown: [] }
  for (const l of links) {
    if (l.kind === 'issue') continue
    if (l.state === 'merged') g.merged.push(l)
    else if (l.state === 'closed') g.closed.push(l)
    else if (l.ci === 'failed') g.failing.push(l)
    else if (l.state === 'open' || l.state === 'draft' || l.ci) g.open.push(l)
    else g.unknown.push(l)
  }
  return g
}

export function buildOverview(p: FolderProject): Overview {
  const live = p.goals.filter(g => !g.archived)
  const needs: OverviewNeed[] = []
  const recent: RecentEvent[] = []
  const seen = new Set<string>()

  for (const goal of live) {
    const goalKey = goal.lead.slot.key
    for (const m of sessionsOf(goal)) {
      const key = m.slot.key
      if (seen.has(key)) continue
      seen.add(key)
      const title = m.slot.title || ''
      const kind = needKind(m)
      if (kind) needs.push({ slotKey: key, goalKey, title, kind, hint: needHint(m.slot, kind), updated: ts(m) })

      const rk = recentKind(m)
      const when = ts(m)
      if (rk && when) recent.push({ slotKey: key, goalKey, title, kind: rk, ts: when })
    }
  }

  needs.sort((a, b) => NEED_RANK[b.kind] - NEED_RANK[a.kind] || b.updated.localeCompare(a.updated))
  recent.sort((a, b) => b.ts.localeCompare(a.ts))

  const goals: OverviewGoal[] = live.map(g => ({
    key: g.lead.slot.key,
    title: g.lead.slot.title || '',
    leadStatus: g.leadStatus,
    quote: leadQuote(g.lead.slot),
    chats: sessionsOf(g).length,
    prs: dedupeProjectPrs([g]).length,
    activity: goalActivity(g),
  }))
  const summary: OverviewSummary = {
    goals: live.length,
    working: live.filter(g => g.leadStatus === 'working').length,
    idle: live.filter(g => g.leadStatus === 'idle').length,
    needYou: needs.length,
  }

  const links = dedupeProjectPrs(live)
  const prs = groupPrs(links)
  const prTotal = prs.failing.length + prs.open.length + prs.merged.length + prs.closed.length + prs.unknown.length

  return { needs, summary, goals, prs, prTotal, recent: recent.slice(0, RECENT_LIMIT) }
}
