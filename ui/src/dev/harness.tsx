/**
 * Dev harness entry. Renders the REAL App component (src/App.tsx) against the
 * stub SDK and fixtures so every view can be developed and screenshotted while
 * the installed app stays disabled. This module is the dev Vite entry only; it
 * is never part of the production lib build (dist/index.mjs), whose single
 * entry is src/App.tsx.
 *
 * `@kirocrew/app-sdk` and `@kirocrew/app-sdk/ui` are aliased to the local stubs
 * by vite.dev.config.ts, and `@tanstack/react-query` / `lucide-react` resolve
 * to the real packages installed as dev dependencies.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'
import { boardSourceFixture } from './fixtures'

// The host's real theme tokens (every dashboard theme), so the harness looks
// exactly like the installed app. Pick one with ?theme=<id>, e.g. ?theme=light,
// ?theme=nord-dark; the default is the dashboard default (dark).
import './host-themes.css'
// The host's global rules (preflight, body font/line-height, the global
// scrollbar) and the composer utilities, so the embedded composer meets the
// same cascade as on the real host.
import './host-globals.css'

function applyTheme(): void {
  const root = document.documentElement
  root.dataset.theme = new URLSearchParams(location.search).get('theme') || 'dark'
  document.body.style.margin = '0'
  document.body.style.background = 'var(--bg)'
  document.body.style.color = 'var(--text)'
  // The skeleton pulse the stub references; harmless in the real host too.
  const style = document.createElement('style')
  style.textContent = '@keyframes tp-skel-pulse{0%,100%{opacity:.5}50%{opacity:.9}}'
  document.head.appendChild(style)
}

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

applyTheme()

// `?board=1` hands the app a fixture work-ledger source so the task board can
// be developed and screenshotted; without it the app behaves as on today's
// host (no ledger route for apps) and shows each goal's sessions tree.
const boardSource = new URLSearchParams(location.search).get('board') === '1' ? boardSourceFixture : undefined

const el = document.getElementById('root')
if (!el) throw new Error('harness: #root not found')

createRoot(el).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      {/* The host page is a flex column that gives the app its height; mirror
          that so the app's flex:1 layout fills the viewport. */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <App boardSource={boardSource} />
      </div>
    </QueryClientProvider>
  </React.StrictMode>,
)
