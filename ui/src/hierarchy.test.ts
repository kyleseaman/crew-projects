import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Guards the button hierarchy: ONE filled (primary) button per context. The
// page header's "New project" is the page's ONLY primary; the New-project
// dialog's "Create project" is the dialog's. Everything in the three columns
// (New goal, Open in Chat, Back to lead, Folder settings, the directory chip)
// is outlined or ghost, or the page goes back to a row of purple buttons.
const read = (f: string) => readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
const app = read('App.tsx')
const workspace = read('Workspace.tsx')
const src = `${app}\n${workspace}`

/** Each Btn element, opening tag through closing tag. */
const btns = [...src.matchAll(/<Btn\b[^>]*>[\s\S]*?<\/Btn>/g)].map(m => m[0])
const primaryBtns = btns.filter(b => /^<Btn\s+primary\b/.test(b))

describe('button hierarchy', () => {
  it('has exactly two primary buttons: New project (page) and Create project (dialog)', () => {
    expect(primaryBtns).toHaveLength(2)
    expect(primaryBtns.some(b => b.includes('t.newProjectTitle'))).toBe(true)
    expect(primaryBtns.some(b => b.includes('t.createProject'))).toBe(true)
  })

  it('the workspace columns have no primary button at all', () => {
    expect(workspace).not.toMatch(/<Btn\s+primary\b/)
  })

  it('never makes a per-project or per-goal action primary', () => {
    for (const b of primaryBtns) {
      for (const label of ['t.newGoal', 't.folderSettings', 't.openInChat', 't.backToLead', 't.openGoal']) {
        expect(b.includes(label), `${label} must not be primary`).toBe(false)
      }
    }
  })

  it('renders Folder settings, Open in Chat and Back to lead as ghost (tertiary)', () => {
    for (const label of ['t.folderSettings', 't.openInChat', 't.backToLead']) {
      const found = btns.filter(b => b.includes(label))
      expect(found.length, `${label} button exists`).toBeGreaterThan(0)
      for (const b of found) expect(b, label).toContain('tp-btn-ghost')
    }
  })

  it('New goal is outlined (the Btn default), never ghost or primary', () => {
    const found = btns.filter(b => b.includes('t.newGoal'))
    expect(found.length).toBeGreaterThan(0)
    for (const b of found) {
      expect(b).not.toContain('tp-btn-ghost')
      expect(b).not.toMatch(/^<Btn\s+primary\b/)
    }
  })

  it('the lead chat is embedded in-page (ChatEmbed), not a jump away', () => {
    expect(workspace).toMatch(/<ChatEmbed\b[\s\S]*?slotKey=\{target\.key\}/)
    expect(src).not.toContain('t.openLead')
    expect(src).not.toContain('t.chatWithLead')
  })
})
