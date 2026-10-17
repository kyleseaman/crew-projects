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

/** The host provides these theme tokens at runtime; the app reads them via
 *  var(--...). Here we set a dark palette on :root so the standalone harness
 *  matches the installed dark-cockpit look. */
const THEME_TOKENS: Record<string, string> = {
  '--bg': '#0f1115',
  '--bg-hover': '#1a1d23',
  '--bg-elevated': '#171a20',
  '--card': '#15181e',
  '--card-fg': '#e6e8eb',
  '--text': '#e6e8eb',
  '--text-strong': '#f5f6f8',
  '--muted': '#8b929c',
  '--muted-strong': '#aeb4bd',
  '--border': '#272b33',
  '--border-strong': '#3a3f49',
  '--accent': '#5b8cff',
  '--accent-fg': '#0b0d11',
  '--info': '#5b8cff',
  '--warn': '#e0a53a',
  '--danger': '#e05a5a',
  '--ok': '#4bbf7b',
}

function applyTheme(): void {
  const root = document.documentElement
  for (const [k, v] of Object.entries(THEME_TOKENS)) root.style.setProperty(k, v)
  document.body.style.margin = '0'
  document.body.style.background = 'var(--bg)'
  document.body.style.color = 'var(--text)'
  document.body.style.font = '14px system-ui, -apple-system, sans-serif'
  // The skeleton pulse the stub references; harmless in the real host too.
  const style = document.createElement('style')
  style.textContent = '@keyframes tp-skel-pulse{0%,100%{opacity:.5}50%{opacity:.9}}'
  document.head.appendChild(style)
}

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

applyTheme()

const el = document.getElementById('root')
if (!el) throw new Error('harness: #root not found')

createRoot(el).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      {/* The host page is a flex column that gives the app its height; mirror
          that so the app's flex:1 layout fills the viewport. */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <App />
      </div>
    </QueryClientProvider>
  </React.StrictMode>,
)
