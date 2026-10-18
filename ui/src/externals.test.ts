import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Guards the failure that broke the installed app: the bundle imported icons
// from the host's lucide-react stub, which only re-exports a subset. Every
// module the built bundle imports must be one the host shares, and lucide must
// not be among them (it is bundled).
const HOST_SHARED = new Set([
  'react', 'react-dom', 'react/jsx-runtime',
  '@kirocrew/app-sdk', '@kirocrew/app-sdk/ui', '@tanstack/react-query',
])

describe('built bundle', () => {
  const dist = new URL('../dist/index.mjs', import.meta.url)
  it.skipIf(!existsSync(dist))('imports only host-shared modules, never lucide-react', () => {
    const src = readFileSync(dist, 'utf8')
    const specifiers = [...src.matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)].map(m => m[1])
    expect(specifiers.filter(s => !HOST_SHARED.has(s))).toEqual([])
  })
})
