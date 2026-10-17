import { describe, expect, it } from 'vitest'
import {
  archivedGoalsIn,
  buildFolderProjects,
  buildProjects,
  folderRepos,
  loopText,
  repoName,
  type ArchivedSession,
  type Folder,
  type Slot,
} from './model'

const lead = (key: string, extra: Partial<Slot> = {}): Slot => ({ key, agent: 'kirocrew-team-lead', title: key, ...extra })
const kid = (key: string, parent: string, extra: Partial<Slot> = {}): Slot => ({ key, agent: 'kirocrew-worker', created_by: parent, title: key, ...extra })

describe('buildProjects', () => {
  it('flattens conductor → worker chains into one sub-team', () => {
    const slots = [
      lead('L', { project: '/Users/x/trackout-turbo' }),
      kid('C', 'L', { agent: 'kirocrew-conductor' }),
      kid('W1', 'C'),
      kid('W2', 'W1'), // a grandchild still lands in the same sub-team
      kid('W3', 'L', { running: true }),
    ]
    const [p] = buildProjects(slots, [])
    expect(p.lead.slot.key).toBe('L')
    expect(p.repo).toBe('trackout-turbo')
    expect(p.subTeams).toHaveLength(1)
    expect(p.subTeams[0].lead.slot.key).toBe('C')
    expect(p.subTeams[0].workers.map(w => w.slot.key).sort()).toEqual(['W1', 'W2'])
    expect(p.workers.map(w => w.slot.key)).toEqual(['W3'])
    expect(p.memberCount).toBe(4)
    expect(p.activeCount).toBe(1)
    expect(p.status).toBe('working')
  })

  it('treats a team lead created by another lead as a sub-team, not a second project', () => {
    const slots = [lead('L'), lead('L2', { created_by: 'L' }), kid('W', 'L2')]
    const projects = buildProjects(slots, [])
    expect(projects).toHaveLength(1)
    expect(projects[0].subTeams[0].lead.slot.key).toBe('L2')
  })

  it('ignores non-lead sessions and dangling parents', () => {
    const slots = [{ key: 'chat', agent: 'kirocrew' }, lead('L', { created_by: 'gone' })]
    const projects = buildProjects(slots, [])
    expect(projects.map(p => p.lead.slot.key)).toEqual(['L'])
  })

  it('survives a created_by cycle', () => {
    const slots = [lead('L'), kid('A', 'L'), kid('B', 'A'), { ...kid('A2', 'B'), key: 'A2' }]
    slots[1] = { ...slots[1], created_by: 'L' }
    slots.push({ key: 'X', created_by: 'Y' }, { key: 'Y', created_by: 'X' })
    expect(() => buildProjects(slots, [])).not.toThrow()
  })

  it('surfaces needs-you above working and dedupes PRs', () => {
    const pr = { url: 'https://github.com/o/r/pull/1', number: 1 }
    const slots = [
      lead('L', { source_links: [pr] }),
      kid('A', 'L', { running: true, source_links: [pr] }),
      kid('B', 'L', { pending_approval: true }),
    ]
    const [p] = buildProjects(slots, [])
    expect(p.status).toBe('needs_you')
    expect(p.prs).toHaveLength(1)
  })

  it('marks an idle lead with an active loop as working and reads its cycle', () => {
    const loops = [{ slot_key: 'L', active: true, cycle_count: 1, max_cycles: 300 }]
    const [p] = buildProjects([lead('L')], loops)
    expect(p.status).toBe('working')
    expect(loopText(p.loop)).toBe('1/300')
  })
})

const folder = (id: string, extra: Partial<Folder> = {}): Folder => ({ id, name: id, parent_id: null, ...extra })

describe('folderRepos', () => {
  it('puts project_dir first, then extra_repos, de-duplicated', () => {
    const f = folder('f', {
      project_dir: '/a/trackout',
      extra_repos: ['/a/telemetry', '/a/trackout'],
    })
    expect(folderRepos(f)).toEqual(['/a/trackout', '/a/telemetry'])
  })

  it('degrades to the single project_dir when extra_repos is absent', () => {
    expect(folderRepos(folder('f', { project_dir: '/a/trackout' }))).toEqual(['/a/trackout'])
  })

  it('reads a non-array extra_repos as none rather than throwing', () => {
    const f = { id: 'f', name: 'f', project_dir: '/a/x', extra_repos: 'oops' } as unknown as Folder
    expect(folderRepos(f)).toEqual(['/a/x'])
  })

  it('returns no repos when nothing is set', () => {
    expect(folderRepos(folder('f'))).toEqual([])
  })
})

describe('repoName', () => {
  it('is the last path segment, trailing slashes ignored', () => {
    expect(repoName('/Users/x/Development/trackout-turbo/')).toBe('trackout-turbo')
  })
})

describe('buildFolderProjects', () => {
  it('surfaces only top-level folders as projects, sorted needs-you first', () => {
    const folders = [
      folder('f-a', { project_dir: '/a' }),
      folder('f-b', { project_dir: '/b' }),
      folder('f-a-child', { parent_id: 'f-a' }), // nested: not its own project
    ]
    const slots = [lead('L-b', { project: '/b', folder_id: 'f-b', pending_approval: true }), lead('L-a', { project: '/a', folder_id: 'f-a' })]
    const projects = buildFolderProjects(folders, slots, [])
    expect(projects.map(p => p.folder.id)).toEqual(['f-b', 'f-a'])
    expect(projects[0].status).toBe('needs_you')
  })

  it('attaches a goal filed in a nested sub-folder to its top-level project', () => {
    const folders = [folder('f', { project_dir: '/p' }), folder('f-sub', { parent_id: 'f' })]
    const slots = [lead('L', { folder_id: 'f-sub' }), kid('W', 'L')]
    const [p] = buildFolderProjects(folders, slots, [])
    expect(p.goals).toHaveLength(1)
    expect(p.goals[0].lead.slot.key).toBe('L')
    expect(p.goals[0].archived).toBe(false)
  })

  it('attaches a goal by matching project path when it has no folder_id', () => {
    const folders = [folder('f', { project_dir: '/p/repo' })]
    const slots = [lead('L', { project: '/p/repo' })]
    const [p] = buildFolderProjects(folders, slots, [])
    expect(p.goals.map(g => g.lead.slot.key)).toEqual(['L'])
  })

  it('keeps each goal\'s sub-team/worker grouping scoped to that goal', () => {
    // Two live team-lead goals in one folder, each with its own worker. The
    // grouping must stay per-goal: a goal must not pull in another goal's agents.
    const folders = [folder('f', { project_dir: '/p' })]
    const slots = [
      lead('L1', { folder_id: 'f' }),
      kid('W1', 'L1'),
      lead('L2', { folder_id: 'f' }),
      kid('W2', 'L2'),
    ]
    const [p] = buildFolderProjects(folders, slots, [])
    const g1 = p.goals.find(g => g.lead.slot.key === 'L1')!
    const g2 = p.goals.find(g => g.lead.slot.key === 'L2')!
    expect(g1.workers.map(w => w.slot.key)).toEqual(['W1'])
    expect(g2.workers.map(w => w.slot.key)).toEqual(['W2'])
    expect(g1.memberCount).toBe(1)
    expect(g2.memberCount).toBe(1)
  })

  it('flags a folder with no directory and sets no repos — never a guess', () => {
    const [p] = buildFolderProjects([folder('f')], [], [])
    expect(p.needsDir).toBe(true)
    expect(p.repos).toEqual([])
  })

  it('defaults the agent to the team lead for display when the folder omits one', () => {
    const [p] = buildFolderProjects([folder('f', { project_dir: '/p' })], [], [])
    expect(p.defaultAgent).toBe('kirocrew-team-lead')
    const [q] = buildFolderProjects([folder('g', { project_dir: '/p', default_agent: 'kirocrew' })], [], [])
    expect(q.defaultAgent).toBe('kirocrew')
  })

  it('carries read-only instruction dirs through without the app writing them', () => {
    const [p] = buildFolderProjects([folder('f', { project_dir: '/p', steering_dirs: ['/std', '/org'] })], [], [])
    expect(p.instructions).toEqual(['/std', '/org'])
  })

  it('lists archived team-lead goals after the live ones, newest first', () => {
    const folders = [folder('f', { project_dir: '/p' })]
    const slots = [lead('L-live', { folder_id: 'f' })]
    const sessions: ArchivedSession[] = [
      { key: 'h-old', title: 'Old goal', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 1000 },
      { key: 'h-new', title: 'New goal', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 2000 },
    ]
    const [p] = buildFolderProjects(folders, slots, [], sessions)
    expect(p.goals.map(g => g.lead.slot.key)).toEqual(['L-live', 'h-new', 'h-old'])
    expect(p.goals.map(g => g.archived)).toEqual([false, true, true])
  })

  it('never lets an archived goal raise the project status or updated sort key', () => {
    // A live idle goal and an archived goal: the archived one is idle by
    // construction, so the project stays idle and its updated reflects the live
    // goal, not the (possibly newer) archived row.
    const folders = [folder('f', { project_dir: '/p' })]
    const slots = [lead('L', { folder_id: 'f', last_activity_ts: '2020-01-01T00:00:00Z' })]
    const sessions: ArchivedSession[] = [
      { key: 'h', agent: 'kirocrew-team-lead', folder_id: 'f', modified: Date.now() / 1000 },
    ]
    const [p] = buildFolderProjects(folders, slots, [], sessions)
    expect(p.status).toBe('idle')
    expect(p.updated).toBe('2020-01-01T00:00:00Z')
  })

  it('does not duplicate a goal that is both live and in the history list', () => {
    const folders = [folder('f', { project_dir: '/p' })]
    const slots = [lead('L', { folder_id: 'f' })]
    const sessions: ArchivedSession[] = [
      { key: 'L', title: 'same session', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 1000 },
    ]
    const [p] = buildFolderProjects(folders, slots, [], sessions)
    expect(p.goals).toHaveLength(1)
    expect(p.goals[0].archived).toBe(false)
  })
})

describe('archivedGoalsIn', () => {
  const subtree = new Set(['f', 'f-sub'])
  const live = new Set(['L-open'])

  it('keeps only team-lead sessions filed in the subtree with no live slot', () => {
    const sessions: ArchivedSession[] = [
      { key: 'g1', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 2 },
      { key: 'g2', agent: 'kirocrew-team-lead', folder_id: 'f-sub', modified: 3 }, // nested
      { key: 'not-lead', agent: 'kirocrew-worker', folder_id: 'f', modified: 9 }, // wrong agent
      { key: 'elsewhere', agent: 'kirocrew-team-lead', folder_id: 'other', modified: 9 }, // other folder
      { key: 'homeless', agent: 'kirocrew-team-lead', modified: 9 }, // no folder
      { key: 'L-open', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 9 }, // already live
    ]
    const goals = archivedGoalsIn(sessions, subtree, live)
    expect(goals.map(g => g.lead.slot.key)).toEqual(['g2', 'g1']) // newest first
    expect(goals.every(g => g.archived && g.memberCount === 0 && g.loop === null && g.status === 'idle')).toBe(true)
  })

  it('converts the modified epoch-seconds into an ISO updated timestamp', () => {
    const [g] = archivedGoalsIn(
      [{ key: 'g', agent: 'kirocrew-team-lead', folder_id: 'f', modified: 1_700_000_000 }],
      subtree,
      new Set(),
    )
    expect(g.updated).toBe(new Date(1_700_000_000 * 1000).toISOString())
    expect(g.lead.slot.last_activity_ts).toBe(g.updated)
  })

  it('leaves the updated time empty rather than guess when modified is absent', () => {
    const [g] = archivedGoalsIn(
      [{ key: 'g', agent: 'kirocrew-team-lead', folder_id: 'f' }],
      subtree,
      new Set(),
    )
    expect(g.updated).toBe('')
  })
})
