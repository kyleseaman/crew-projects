import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { css } from './styles'

// Guards the failure that shipped in the Subscriptions panel: App used
// `tp-sub-row` while styles.ts defined `.tp-subs-row`, so rows rendered unstyled
// and no test noticed. Every literal tp-* class App renders must have a rule.
const NO_RULE_NEEDED = new Set([
  'tp-cell-task', // layout hook only; the grid on .tp-mrow places it
])

describe('class names', () => {
  it('every tp-* class used in App.tsx has a CSS rule', () => {
    const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    const literals = [...app.matchAll(/className=\{?[`"]([^`"]*)/g)].map(m => m[1])
    const used = new Set(
      literals
        .join(' ')
        .replace(/\$\{[^}]*\}/g, ' ') // drop template interpolations
        .match(/\btp-[a-z0-9_-]+/g) ?? [],
    )
    const defined = new Set([...css.matchAll(/\.(tp-[a-z0-9_-]+)/g)].map(m => m[1]))
    const missing = [...used].filter(c => !c.endsWith('-') && !defined.has(c) && !NO_RULE_NEEDED.has(c))
    expect(missing).toEqual([])
  })
})
