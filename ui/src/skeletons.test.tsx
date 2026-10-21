import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import ProjectHub, { SubscriptionsSection } from './App'
import { PageSkeleton } from './Skeletons'
import { STATUS_QUERY_KEY } from './TrustControl'
import { autonudgeFixture, foldersFixture, sessionsPageFixture, slotsFixture } from './dev/fixtures'
import { t } from './strings'

// Pins 0.9.3's loading placeholders. Before: while folders + slots loaded the
// page drew three full-width 56px bars in place of the three-column grid (so
// everything jumped when data landed), in the host's --bg-hover, which in the
// light palettes is #f0f0f0 on a #fafafa page — invisible. The loops read was
// not awaited, so every lead first painted Idle and then flipped to Working;
// Subscriptions said "nothing is watching" while schedules were still out;
// and the approval-mode picker said Unknown before the host had answered.

const noop = () => {}
const html = (el: JSX.Element, qc = new QueryClient()) =>
  renderToStaticMarkup(<QueryClientProvider client={qc}>{el}</QueryClientProvider>)
const strip = (m: string) => m.replace(/<style>[\s\S]*?<\/style>/, '')

const seeded = (keys: ('folders' | 'slots' | 'loops' | 'sessions' | 'status')[]) => {
  const qc = new QueryClient()
  const data = {
    folders: foldersFixture,
    slots: slotsFixture,
    loops: autonudgeFixture,
    sessions: sessionsPageFixture,
    status: { yolo: false, disabled_approval_modes: [] },
  }
  for (const k of keys) qc.setQueryData(k === 'status' ? STATUS_QUERY_KEY : ['project-hub', k], data[k])
  return qc
}

/** The page's column skeleton: what the grid holds, in order. */
const columns = (m: string) =>
  [...m.matchAll(/<(aside|section) class="(tp-list|tp-center|tp-side)"/g)].map(x => x[2])

describe('page skeleton', () => {
  it('draws the loaded three-column grid while the first reads are out', () => {
    const m = strip(html(<ProjectHub />))
    expect(m).toContain('data-testid="page-skeleton"')
    expect(m).toContain(`aria-label="${t.loadingProjects}"`)
    expect(m).toMatch(/class="tp-split" style="--tp-col-l:\d+px;--tp-col-r:\d+px"/)
    expect(columns(m)).toEqual(['tp-list', 'tp-center', 'tp-side'])
    // The real tab strip, so the panel does not change shape when it loads.
    expect(m).toContain('role="tablist"')
    // Never the empty state, never the old full-width bars.
    expect(m).not.toContain(t.projectsEmptyTitle)
    expect(m).not.toMatch(/tp-loading|tp-skel"/)
  })

  it('waits for loops too, so a lead never paints Idle then Working', () => {
    expect(html(<ProjectHub />, seeded(['folders', 'slots']))).toContain('data-testid="page-skeleton"')
  })

  it('loaded content REPLACES the skeleton: same grid, no placeholder left', () => {
    const before = strip(html(<ProjectHub />))
    const after = strip(html(<ProjectHub />, seeded(['folders', 'slots', 'loops', 'sessions', 'status'])))
    expect(after).not.toContain('page-skeleton')
    expect(after).not.toContain('tp-sk')
    expect(after).toContain('class="tp-prow ')
    // The same columns, in the same order, at the same widths.
    expect(columns(after)).toEqual(columns(before))
    const vars = (m: string) => /class="tp-split[^"]*" style="([^"]+)"/.exec(m)?.[1]
    expect(vars(after)).toBe(vars(before))
  })

  it('only the approval pill waits on its own read, and it is a placeholder, not Unknown', () => {
    const m = strip(html(<ProjectHub />, seeded(['folders', 'slots', 'loops', 'sessions'])))
    expect(m).not.toContain('page-skeleton')
    expect(m.match(/class="tp-sk[ "]/g)).toHaveLength(1)
    expect(m).toContain('data-mode="loading"')
    expect(m).not.toContain('Approval mode: Unknown')
  })

  it('follows a collapsed side panel: two columns, reopen toggle in the middle header', () => {
    const m = html(<PageSkeleton widths={{ left: 300, right: 340 }} collapsed tab="work" onTab={noop} onToggleCollapsed={noop} />)
    expect(m).toContain('class="tp-split tp-split-collapsed" style="--tp-col-l:300px;--tp-col-r:340px"')
    expect(columns(m)).toEqual(['tp-list', 'tp-center'])
    expect(m).toContain(`aria-label="${t.showPanel}"`)
  })

  it('opens on the persisted tab with that tab\'s own placeholder', () => {
    const m = html(<PageSkeleton widths={{ left: 260, right: 280 }} collapsed={false} tab="library" onTab={noop} onToggleCollapsed={noop} />)
    expect(m).toMatch(/id="tp-tab-library" aria-selected="true"/)
    expect(m).toContain('tp-lib-row')
  })
})

describe('Subscriptions while schedules load', () => {
  const section = (kind: 'loading' | 'ready') =>
    html(
      <SubscriptionsSection
        subs={[]}
        schedules={kind === 'loading' ? { kind } : { kind, schedules: [] }}
        canAdd={false}
        onOpen={noop}
        onAdd={noop}
      />,
    )
  it('shows schedule-row placeholders, never "nothing is watching", until they answer', () => {
    const loading = section('loading')
    expect(loading).not.toContain(t.subscriptionsEmpty)
    expect(loading).toContain(`aria-label="${t.schedulesLoading}"`)
    expect(loading).toContain('tp-subs-row')
    const ready = section('ready')
    expect(ready).toContain(t.subscriptionsEmpty)
    expect(ready).not.toContain('tp-sk')
  })
})

describe('placeholder colour reads in every palette', () => {
  const css = readFileSync(new URL('./styles.ts', import.meta.url), 'utf8')
  const themes = readFileSync(new URL('./dev/host-themes.css', import.meta.url), 'utf8')

  it('is the app\'s own bar, mixed from --text, with its own pulse and reduced motion', () => {
    expect(css).toMatch(/\.tp-sk\{[^}]*background:color-mix\(in srgb,var\(--text\) 12%,transparent\)/)
    expect(css).not.toMatch(/\.tp-sk\{[^}]*--bg-hover/)
    expect(css).toContain('@keyframes tp-sk-pulse')
    expect(css).toMatch(/prefers-reduced-motion:reduce\)\{\.tp-sk\{animation:none\}/)
  })

  // Resolve each palette's tokens (light ones inherit [data-theme="light"]).
  const blocks = [...themes.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  const tokens = (theme: string) => {
    const out: Record<string, string> = {}
    for (const [, sel, body] of blocks) {
      const names = [...sel.matchAll(/data-theme="([^"]+)"/g)].map(x => x[1])
      const applies = names.includes(theme) || (theme.endsWith('-light') && names.includes('light'))
      if (!applies) continue
      for (const [, k, v] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[k] = v.trim()
    }
    return out
  }
  const rgb = (hex: string) => {
    const h = hex.replace('#', '')
    const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6)
    return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16))
  }
  const lum = (c: number[]) => {
    const [r, g, b] = c.map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
  const mix = (fg: number[], bg: number[], p: number) => fg.map((v, i) => Math.round(v * p + bg[i] * (1 - p)))

  const names = [...new Set([...themes.matchAll(/data-theme="([^"]+)"/g)].map(x => x[1]))]
  it.each(names)('%s: a bar is visibly darker/lighter than the card and the page it sits on', name => {
    const tk = tokens(name)
    const text = rgb(tk['--text'])
    for (const surface of ['--card', '--bg']) {
      const bg = rgb(tk[surface])
      // At the pulse's faint end (70% of the 12% mix) the bar still differs.
      expect(ratio(mix(text, bg, 0.12 * 0.7), bg)).toBeGreaterThan(1.1)
    }
    // What 0.9.2 drew: the host box (--bg-hover) pulsing to 50% on the light
    // page reads about 1.04:1, i.e. not at all.
    if (name === 'light') expect(ratio(mix(rgb(tk['--bg-hover']), rgb(tk['--bg']), 0.5), rgb(tk['--bg']))).toBeLessThan(1.05)
  })
})
