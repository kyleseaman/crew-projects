import { describe, expect, it } from 'vitest'
import {
  archivedGoalsIn,
  buildFolderProjects,
  buildProjects,
  isLeadAgent,
  projectSessionKeys,
  sessionTree,
  type ArchivedSession,
  type Folder,
  type SessionNode,
  type Slot,
} from './model'

// Regression: "I'm not seeing all conductor/team-lead sessions."
//
// The fixtures below mirror the owner's REAL sidebar on 2026-10-19 (keys,
// agents, folder nesting and lineage copied from the persisted slot metadata),
// in the exact shape `GET /api/chat/slots` and `GET /api/chat/folders` return:
// each slot row carries `agent`, `folder_id`, `created_by` and the host's
// lineage edge `parent: { slot, key }` (`_attach_slot_parents`); each folder
// carries `parent_id`, and conductors file their workers into nested
// `<goal>/kirocrew-conductor/<team>/kirocrew-worker` subfolders.

const F = {
  slack: '62e1ebb7c6ca',
  slackWorker: 'ce158a6cffd9',
  slackConductor: '72921b07a88b',
  slackRuntime: 'd64e5f636776',
  slackRuntimeWorker: '1c4fb3e8d67c',
  crewProjects: 'a82224f5f902',
  crewProjectsWorker: '450a7a595d9c',
  dev: 'c9ad086e8ef6',
  devWorker: '791e202a059a',
}

const folders: Folder[] = [
  { id: F.slack, name: 'Slack Code', parent_id: null, project_dir: '' },
  { id: F.slackWorker, name: 'kirocrew-worker', parent_id: F.slack },
  { id: F.slackConductor, name: 'kirocrew-conductor', parent_id: F.slack },
  { id: F.slackRuntime, name: 'Code channels runtime', parent_id: F.slackConductor },
  { id: F.slackRuntimeWorker, name: 'kirocrew-worker', parent_id: F.slackRuntime },
  { id: F.crewProjects, name: 'Crew Projects App', parent_id: null },
  { id: F.crewProjectsWorker, name: 'kirocrew-worker', parent_id: F.crewProjects },
  { id: F.dev, name: 'Dev', parent_id: null },
  { id: F.devWorker, name: 'kirocrew-worker', parent_id: F.dev },
]

/** A slot row as the host serializes it: lineage edge resolved to a live key. */
const row = (key: string, agent: string, folder_id: string, creator?: string, extra: Partial<Slot> = {}): Slot => ({
  key,
  title: key,
  agent,
  folder_id,
  created_by: creator ?? '',
  parent: creator ? { slot: creator, key: creator } : null,
  ...extra,
})

const slackCode: Slot[] = [
  row('chat-318-1792182783', 'kirocrew-team-lead', F.slack),
  // A conductor the team lead dispatched, filed in a nested conductor folder.
  row('chat-321-1792184915', 'kirocrew-conductor', F.slackRuntime, 'chat-318-1792182783'),
  // Sub-conductors that conductor dispatched — themselves conductors, two
  // levels below the goal, filed in the runtime's worker subfolder.
  row('chat-323-1792185103', 'kirocrew-conductor', F.slackRuntimeWorker, 'chat-321-1792184915'),
  row('chat-324-1792185104', 'kirocrew-conductor', F.slackRuntimeWorker, 'chat-321-1792184915'),
  row('chat-325-1792189883', 'kirocrew-conductor', F.slackRuntimeWorker, 'chat-321-1792184915'),
  row('chat-326-1792189883', 'kirocrew-conductor', F.slackRuntimeWorker, 'chat-321-1792184915'),
  row('chat-327-1792203933', 'kirocrew-conductor', F.slackRuntimeWorker, 'chat-321-1792184915'),
  row('chat-341-1792360833', 'kirocrew-worker', F.slackRuntimeWorker, 'chat-321-1792184915'),
  // The team lead's own workers, some in the project root, some in a subfolder.
  row('chat-319-1792184914', 'kirocrew-worker', F.slackWorker, 'chat-318-1792182783'),
  row('chat-320-1792184914', 'kirocrew-worker', F.slackWorker, 'chat-318-1792182783'),
  row('chat-338-1792360574', 'kirocrew-worker', F.slack, 'chat-318-1792182783'),
  row('chat-340-1792360735', 'kirocrew-worker', F.slack, 'chat-318-1792182783'),
  row('chat-343-1792361367', 'kirocrew-worker', F.slack, 'chat-318-1792182783'),
  row('chat-363-1792412186', 'kirocrew-worker', F.slack, 'chat-318-1792182783'),
]

// Projects led by a ROOT conductor (no team lead at all): before the fix these
// projects showed zero goals.
const crewProjects: Slot[] = [
  row('chat-316-1792176321', 'kirocrew-conductor', F.crewProjects),
  row('chat-330-1792300000', 'kirocrew-worker', F.crewProjectsWorker, 'chat-316-1792176321'),
  row('chat-331-1792300001', 'kirocrew-worker', F.crewProjectsWorker, 'chat-316-1792176321'),
]
const dev: Slot[] = [
  row('chat-200-1792000000', 'kirocrew-conductor', F.dev),
  row('chat-201-1792000001', 'kirocrew-conductor', F.dev),
  row('chat-202-1792000002', 'kirocrew-team-lead', F.dev),
  row('chat-203-1792000003', 'kirocrew-worker', F.devWorker, 'chat-200-1792000000'),
  row('chat-204-1792000004', 'kirocrew-worker', F.devWorker, 'chat-201-1792000001'),
  // A plain chat is not a goal.
  row('chat-205-1792000005', 'default', F.dev),
]

const slots = [...slackCode, ...crewProjects, ...dev]
const project = (name: string) => {
  const p = buildFolderProjects(folders, slots, []).find(x => x.folder.name === name)
  if (!p) throw new Error(`no project ${name}`)
  return p
}
const flatten = (nodes: SessionNode[]): string[] => nodes.flatMap(n => [n.member.slot.key, ...flatten(n.children)])
const leadKeysOf = (folderIds: Set<string>) =>
  slots.filter(s => isLeadAgent(s.agent) && folderIds.has(s.folder_id || '')).map(s => s.key).sort()

describe('isLeadAgent', () => {
  it('accepts the team lead and every conductor agent', () => {
    for (const a of [
      'kirocrew-team-lead',
      'kirocrew-conductor',
      'kirocrew-ledger-conductor',
      'kirocrew-pipeline-conductor',
      'kirocrew-security-conductor',
      'crew-manager-conductor',
    ]) expect(isLeadAgent(a), a).toBe(true)
  })
  it('rejects workers, default chats and lookalikes', () => {
    for (const a of ['kirocrew-worker', 'default', 'kirocrew', '', undefined, 'conductor-notes', 'kirocrew-conductors'])
      expect(isLeadAgent(a), String(a)).toBe(false)
  })
})

describe('every lead session in a project folder tree is shown (real sidebar shape)', () => {
  it('Slack Code: one goal; the nested conductor and its sub-conductors sit in its tree', () => {
    const p = project('Slack Code')
    expect(p.goals.map(g => g.lead.slot.key)).toEqual(['chat-318-1792182783'])
    const tree = sessionTree(p.goals[0])
    // Every Slack Code session (all 14) is reachable from the one goal.
    expect([p.goals[0].lead.slot.key, ...flatten(tree)].sort()).toEqual(slackCode.map(s => s.key).sort())
    // The conductor nests under the lead, its sub-conductors under IT — not
    // flattened into plain workers of the goal.
    const conductor = tree.find(n => n.member.slot.key === 'chat-321-1792184915')
    expect(conductor?.role).toBe('sub-lead')
    const subs = conductor!.children.filter(n => n.member.slot.agent === 'kirocrew-conductor')
    expect(subs.map(n => n.member.slot.key).sort()).toEqual([
      'chat-323-1792185103',
      'chat-324-1792185104',
      'chat-325-1792189883',
      'chat-326-1792189883',
      'chat-327-1792203933',
    ])
    for (const s of subs) expect(s.role).toBe('sub-lead')
    // Sub-leads list before plain workers at each level.
    expect(tree[0].member.slot.key).toBe('chat-321-1792184915')
  })

  it('a project led by a root conductor (no team lead) shows that conductor as its goal', () => {
    const p = project('Crew Projects App')
    expect(p.goals.map(g => g.lead.slot.key)).toEqual(['chat-316-1792176321'])
    expect(flatten(sessionTree(p.goals[0])).sort()).toEqual(['chat-330-1792300000', 'chat-331-1792300001'])
  })

  it('Dev: every root conductor AND the team lead are goals; the plain chat is not', () => {
    const p = project('Dev')
    expect(p.goals.map(g => g.lead.slot.key).sort()).toEqual([
      'chat-200-1792000000',
      'chat-201-1792000001',
      'chat-202-1792000002',
    ])
  })

  it('no lead in any project subtree is missing from that project (goal or tree)', () => {
    for (const name of ['Slack Code', 'Crew Projects App', 'Dev']) {
      const p = project(name)
      const subtree = new Set(folders.filter(f => f.id === p.folder.id || isUnder(f.id, p.folder.id)).map(f => f.id))
      const shown = new Set(projectSessionKeys(p.goals))
      for (const k of leadKeysOf(subtree)) expect(shown.has(k), `${name}: ${k}`).toBe(true)
    }
  })

  it('the rollup counts the nested conductor as a sub-team even with no workers of its own', () => {
    const [goal] = buildProjects(
      [row('L', 'kirocrew-team-lead', F.slack), row('C', 'kirocrew-conductor', F.slack, 'L'), row('W', 'kirocrew-worker', F.slack, 'L')],
      [],
    )
    expect(goal.subTeams.map(t => t.lead.slot.key)).toEqual(['C'])
    expect(goal.workers.map(w => w.slot.key)).toEqual(['W'])
  })
})

describe('lineage edge', () => {
  it('nests on parent.key when the creator closed and the host resolved the nearest live ancestor', () => {
    // C's creator X closed; the host ships parent { slot: X, key: L, ancestor: true }.
    // created_by alone names no live row, so without the lineage edge C would
    // read as a second root goal.
    const s: Slot[] = [
      row('L', 'kirocrew-team-lead', F.slack),
      { ...row('C', 'kirocrew-conductor', F.slack), created_by: 'X', parent: { slot: 'X', key: 'L', ancestor: true } },
    ]
    const goals = buildProjects(s, [])
    expect(goals.map(g => g.lead.slot.key)).toEqual(['L'])
    expect(flatten(sessionTree(goals[0]))).toEqual(['C'])
  })

  it('falls back to created_by on a frame sent before the lineage projection is seeded (parent: null)', () => {
    const s: Slot[] = [
      row('L', 'kirocrew-team-lead', F.slack),
      { ...row('C', 'kirocrew-conductor', F.slack), created_by: 'L', parent: null },
    ]
    expect(buildProjects(s, []).map(g => g.lead.slot.key)).toEqual(['L'])
  })

  it('a conductor opened from a plain (non-lead) chat is still a goal, not dropped', () => {
    const s: Slot[] = [
      row('chat', 'default', F.dev),
      row('C', 'kirocrew-conductor', F.dev, 'chat'),
      row('W', 'kirocrew-worker', F.devWorker, 'C'),
    ]
    const goals = buildProjects(s, [])
    expect(goals.map(g => g.lead.slot.key)).toEqual(['C'])
    expect(flatten(sessionTree(goals[0]))).toEqual(['W'])
  })

  it('survives a lineage cycle between leads', () => {
    const s: Slot[] = [row('A', 'kirocrew-conductor', F.dev, 'B'), row('B', 'kirocrew-conductor', F.dev, 'A')]
    expect(() => buildProjects(s, [])).not.toThrow()
  })
})

describe('archived lead goals', () => {
  it('includes archived conductors as well as archived team leads', () => {
    const sessions: ArchivedSession[] = [
      { key: 'old-lead', agent: 'kirocrew-team-lead', folder_id: F.dev, modified: 100 },
      { key: 'old-cond', agent: 'kirocrew-conductor', folder_id: F.devWorker, modified: 200 },
      { key: 'old-worker', agent: 'kirocrew-worker', folder_id: F.dev, modified: 300 },
    ]
    const goals = archivedGoalsIn(sessions, new Set([F.dev, F.devWorker]), new Set())
    expect(goals.map(g => g.lead.slot.key)).toEqual(['old-cond', 'old-lead'])
  })
})

function isUnder(id: string, root: string): boolean {
  const byId = new Map(folders.map(f => [f.id, f]))
  let cur = byId.get(id)?.parent_id
  while (cur) {
    if (cur === root) return true
    cur = byId.get(cur)?.parent_id
  }
  return false
}
