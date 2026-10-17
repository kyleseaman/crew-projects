import { describe, expect, it } from 'vitest'
import { buildProjects, loopText, type Slot } from './model'

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
