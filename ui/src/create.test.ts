import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildFolderProjects, newGoalLaunch, newGoalRequest, newProjectRequest, TEAM_LEAD_AGENT, type Folder } from './model'

// 0.9.1: every chat and folder the app creates starts on kirocrew-team-lead,
// even in a folder whose own default agent is a conductor (the owner's report:
// goal chats in a project came up as kirocrew-conductor).

const conductorFolder: Folder = { id: 'f-code', name: 'Code channels', project_dir: '/r', default_agent: 'kirocrew-conductor' }
const project = buildFolderProjects([conductorFolder], [], [], [])[0]

describe('create paths pin the team lead', () => {
  it('New project: the folder is created with default_agent kirocrew-team-lead', () => {
    expect(TEAM_LEAD_AGENT).toBe('kirocrew-team-lead')
    expect(newProjectRequest('P', ['/a', '/b'])).toEqual({ name: 'P', default_agent: 'kirocrew-team-lead', project_dir: '/a', extra_repos: ['/b'] })
    expect(newProjectRequest('P', [])).toEqual({ name: 'P', default_agent: 'kirocrew-team-lead' })
  })

  it('New goal: the slot is created on the team lead even when the folder defaults to a conductor', () => {
    expect(project.defaultAgent).toBe('kirocrew-conductor')
    expect(newGoalRequest(project)).toEqual({ agent: 'kirocrew-team-lead', folder_id: 'f-code' })
  })

  it('New goal: the chat it opens is launched on the team lead too', () => {
    expect(newGoalLaunch('chat-1')).toEqual({ slotKey: 'chat-1', agent: 'kirocrew-team-lead', autoSend: false })
  })

  it('App.tsx sends only these bodies, and never feeds the folder default into a new chat', () => {
    const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    expect(app).toContain("api.post<Folder>('/api/chat/folders', newProjectRequest(name, directories))")
    expect(app).toContain("api.post<Slot>('/api/chat/slots', newGoalRequest(p))")
    expect(app).toContain('openChat(newGoalLaunch(slot?.key))')
    // No create body or launch takes its agent from the folder's default.
    expect(app).not.toMatch(/agent:\s*[^,\n}]*defaultAgent/)
  })

  it('there is no other create call anywhere in the app', () => {
    const dir = new URL('./', import.meta.url)
    const sources = readdirSync(dir).filter(f => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
    const creates: string[] = []
    for (const f of sources) {
      const src = readFileSync(new URL(f, dir), 'utf8')
      for (const m of src.matchAll(/api\.(post|put)[^(]*\(\s*['"`](\/api\/chat(?:\/slots|\/folders)?)['"`]/g)) creates.push(`${f}:${m[2]}`)
    }
    expect(creates.sort()).toEqual(['App.tsx:/api/chat/folders', 'App.tsx:/api/chat/slots'])
  })
})
