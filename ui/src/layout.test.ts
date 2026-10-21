import { describe, expect, it } from 'vitest'
import {
  clampWidths,
  loadLayout,
  parseLayout,
  saveLayout,
  tabFromKey,
  widthFromKey,
  widthFromPointer,
  DEFAULT_LAYOUT,
  KEY_STEP,
  LIMITS,
  MID_MIN,
  STORAGE_KEY,
} from './layout'

// Pins the adjustable layout: column limits, the middle chat's floor, drag and
// keyboard maths, and what survives a reload (widths, collapse, open tab).

const memory = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }
}

describe('column widths', () => {
  it('holds each outer column within its limits', () => {
    expect(clampWidths({ left: 10, right: 9999 })).toEqual({ left: LIMITS.left.min, right: LIMITS.right.max })
  })
  it('never lets the middle chat drop below MID_MIN; the edge not dragged gives first', () => {
    const container = 1100
    const gap = 14
    const w = clampWidths({ left: 400, right: 500 }, { container, gap, prefer: 'left' })
    expect(container - w.left - w.right - 2 * gap).toBeGreaterThanOrEqual(MID_MIN)
    expect(w.left).toBe(400)
    expect(w.right).toBe(container - 400 - 2 * gap - MID_MIN)
  })
  it('stops at both minimums when even they cannot fit', () => {
    expect(clampWidths({ left: 400, right: 500 }, { container: 500, gap: 10 })).toEqual({
      left: LIMITS.left.min,
      right: LIMITS.right.min,
    })
  })
  it('a collapsed side panel frees its width for the projects column', () => {
    const w = clampWidths({ left: 420, right: 560 }, { container: 900, gap: 14, collapsed: true })
    expect(w.left).toBe(420)
    expect(clampWidths({ left: 420, right: 560 }, { container: 900, gap: 14 }).left).toBeLessThan(420)
  })
  it('drag: the pointer x maps to the dragged edge', () => {
    const box = { left: 100, right: 1500 }
    expect(widthFromPointer('left', 400, box, 14)).toBe(293)
    expect(widthFromPointer('right', 1200, box, 14)).toBe(293)
  })
  it('keys: the edge moves the way the arrow points; Shift is three steps', () => {
    const w = { left: 260, right: 280 }
    expect(widthFromKey('left', w, 'ArrowRight', false)?.left).toBe(260 + KEY_STEP)
    expect(widthFromKey('right', w, 'ArrowLeft', true)?.right).toBe(280 + 3 * KEY_STEP)
    expect(widthFromKey('left', w, 'Enter', false)).toBeNull()
  })
})

describe('side panel tabs', () => {
  it('arrows wrap, Home and End jump, other keys do nothing', () => {
    expect(tabFromKey('overview', 'ArrowRight')).toBe('work')
    expect(tabFromKey('work', 'ArrowRight')).toBe('project')
    expect(tabFromKey('overview', 'ArrowLeft')).toBe('library')
    expect(tabFromKey('subscriptions', 'Home')).toBe('overview')
    expect(tabFromKey('overview', 'End')).toBe('library')
    expect(tabFromKey('overview', 'a')).toBeNull()
  })
  it('Overview is first and the default; a stored 0.7 "goals" tab migrates to Work', () => {
    expect(DEFAULT_LAYOUT.tab).toBe('overview')
    expect(parseLayout(JSON.stringify({ tab: 'goals' })).tab).toBe('work')
    expect(parseLayout(JSON.stringify({ left: 300, right: 320, collapsed: true, tab: 'goals' })))
      .toEqual({ left: 300, right: 320, collapsed: true, tab: 'work' })
    expect(parseLayout(JSON.stringify({ tab: 'work' })).tab).toBe('work')
    expect(parseLayout(JSON.stringify({ tab: 'nope' })).tab).toBe('overview')
  })
})

describe('layout persistence', () => {
  it('widths, collapse and the open tab survive a reload', () => {
    const s = memory()
    saveLayout(s, { left: 300, right: 340, collapsed: true, tab: 'library' })
    expect(JSON.parse(s.m.get(STORAGE_KEY) as string)).toEqual({ left: 300, right: 340, collapsed: true, tab: 'library' })
    expect(loadLayout(s)).toEqual({ left: 300, right: 340, collapsed: true, tab: 'library' })
  })
  it('nothing stored, or garbage, reads as the defaults (Overview tab, panel open)', () => {
    expect(loadLayout(memory())).toEqual(DEFAULT_LAYOUT)
    expect(parseLayout('{not json')).toEqual(DEFAULT_LAYOUT)
    expect(parseLayout('null')).toEqual(DEFAULT_LAYOUT)
    expect(DEFAULT_LAYOUT).toMatchObject({ tab: 'overview', collapsed: false })
  })
  it('each bad field falls back alone, and stored widths are re-clamped', () => {
    expect(parseLayout(JSON.stringify({ left: 'x', right: 9999, collapsed: 'yes', tab: 'nope' }))).toEqual({
      left: DEFAULT_LAYOUT.left,
      right: LIMITS.right.max,
      collapsed: false,
      tab: 'overview',
    })
  })
  it('a storage that throws never breaks the page', () => {
    const bad = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('full') },
    }
    expect(loadLayout(bad)).toEqual(DEFAULT_LAYOUT)
    expect(() => saveLayout(bad, DEFAULT_LAYOUT)).not.toThrow()
  })
})
