/**
 * Dev-only stub of `@kirocrew/app-sdk`. The real SDK is provided by the host at
 * runtime and is externalized from the production bundle; this stub lets the
 * dev harness render the real App component standalone. It is wired in ONLY via
 * the dev Vite config's alias (vite.dev.config.ts) — src/App.tsx imports the
 * bare specifier, so nothing here ever reaches dist/index.mjs.
 *
 * The signatures mirror website/src/app-sdk/{index.ts,scopedApi.ts} on
 * origin/main. `useAppApi().get` resolves fixtures by path; everything else is
 * a no-op that logs intent so a reviewer can see what the app asked for.
 */
import { useEffect } from 'react'
import {
  slotsFixture,
  slotsNoWaitingFixture,
  autonudgeFixture,
  foldersFixture,
  sessionsPageFixture,
  sessionDocsPageFixture,
  artifactsForFolder,
  schedulesForFolder,
  type Folder,
} from './fixtures'
import type { Slot } from '../model'

/** Harness-only flag: `?empty=1` serves the no-waiting slot list so the inbox's
 *  calm empty state can be screenshotted. Never a real API concern. */
function inboxEmptyMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('empty') === '1'
}

/** Harness-only flag: `?noschedules=1` makes the schedules route fail like an
 *  older gateway (404), to screenshot the unavailable note. */
function noSchedulesMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('noschedules') === '1'
}

export interface AppApi {
  raw(path: string, init?: RequestInit): Promise<Response>
  request<T = unknown>(path: string, init?: RequestInit): Promise<T>
  get<T = unknown>(path: string, init?: RequestInit): Promise<T>
  post<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T>
  put<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T>
  patch<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T>
  del<T = unknown>(path: string, init?: RequestInit): Promise<T>
}

export interface ChatLaunchOptions {
  agent?: string
  message?: string
  slotKey?: string
  autoSend?: boolean
}

// Strip a query string so "/api/chat/slots?x=1" resolves like "/api/chat/slots".
function route(path: string): string {
  return path.split('?')[0]
}

/** Read a query param off a stub path (no base needed — only the search part). */
function queryParam(path: string, key: string): string {
  const qi = path.indexOf('?')
  if (qi < 0) return ''
  return new URLSearchParams(path.slice(qi + 1)).get(key) ?? ''
}

function resolve<T>(path: string): T {
  const r = route(path)
  if (r.startsWith('/api/project-schedules/')) {
    if (noSchedulesMode()) throw Object.assign(new Error('HTTP 404'), { status: 404 })
    const folderId = decodeURIComponent(r.slice('/api/project-schedules/'.length))
    return { schedules: schedulesForFolder(folderId), folder_id: folderId, server_tz: 'America/New_York' } as unknown as T
  }
  switch (r) {
    case '/api/chat/slots':
      return (inboxEmptyMode() ? slotsNoWaitingFixture : slotsFixture) as unknown as T
    case '/api/autonudge':
      return autonudgeFixture as unknown as T
    case '/api/chat/folders':
      return foldersFixture as unknown as T
    case '/api/sessions':
      return sessionsPageFixture as unknown as T
    case '/api/artifacts':
      // The real host scopes by ?chat_folder (the folder subtree); the stub
      // mimics that on the single folder id so the Library screenshot shows the
      // selected project's artifacts only.
      return { artifacts: artifactsForFolder(queryParam(path, 'chat_folder')) } as unknown as T
    case '/api/artifacts/session-docs':
      // The unscoped firehose; the app filters to the project's own sessions.
      return sessionDocsPageFixture as unknown as T
    default:
      // eslint-disable-next-line no-console
      console.warn(`[sdk-stub] unmocked GET ${path} -> []`)
      return [] as unknown as T
  }
}

const api: AppApi = {
  async raw() {
    return new Response('{}', { headers: { 'content-type': 'application/json' } })
  },
  async request<T>(path: string) {
    return resolve<T>(path)
  },
  async get<T>(path: string) {
    return resolve<T>(path)
  },
  async post<T>(path: string, body?: unknown) {
    // eslint-disable-next-line no-console
    console.info('[sdk-stub] POST', path, body)
    if (route(path) === '/api/chat/folders') {
      // Mirror the create response: core echoes back the stored folder. The
      // harness never persists it (the folders fixture is static), so the new
      // id just lets the UI's onSuccess selection path run.
      const b = (body as Record<string, unknown>) || {}
      const created: Folder = {
        id: `f-new-${Math.random().toString(36).slice(2, 8)}`,
        name: String(b.name || 'New project'),
        parent_id: null,
        project_dir: typeof b.project_dir === 'string' ? b.project_dir : '',
        extra_repos: Array.isArray(b.extra_repos) ? (b.extra_repos as string[]) : undefined,
        default_agent: typeof b.default_agent === 'string' ? b.default_agent : '',
        history_count: 0,
      }
      return created as unknown as T
    }
    if (route(path) === '/api/chat/slots') {
      // Mirror the create response: core echoes the new slot. The harness never
      // persists it (fixtures are static); the key just lets openChat navigate.
      const b = (body as Record<string, unknown>) || {}
      const slot = {
        key: `new-goal-${Math.random().toString(36).slice(2, 8)}`,
        agent: typeof b.agent === 'string' ? b.agent : 'kirocrew-team-lead',
        folder_id: typeof b.folder_id === 'string' ? b.folder_id : '',
      }
      return slot as unknown as T
    }
    return {} as T
  },
  async put<T>() {
    return {} as T
  },
  async patch<T>() {
    return {} as T
  },
  async del<T>() {
    return {} as T
  },
}

export function useAppApi(): AppApi {
  return api
}

/** No real socket in the harness; fire once on mount so refresh-on-event paths
 *  are exercised, then stay quiet. */
export function useAppEvents(_event: string, callback: (data: unknown) => void): void {
  useEffect(() => {
    callback(undefined)
  }, [callback])
}

export interface AppInfo {
  name: string
  version: string
  permissions: { api: string[]; events: string[] }
  active?: boolean
}

export function useAppInfo(): AppInfo {
  return {
    name: 'team-projects',
    version: '0.1.0',
    permissions: { api: ['/api/chat/slots', '/api/chat/folders', '/api/autonudge', '/api/sessions', '/api/artifacts'], events: ['slots'] },
    active: true,
  }
}

export function useChatLauncher(): { openChat: (opts?: ChatLaunchOptions) => void } {
  return {
    openChat: (opts: ChatLaunchOptions = {}) => {
      // eslint-disable-next-line no-console
      console.info('[sdk-stub] openChat', opts)
    },
  }
}

/** Host navigation. In the harness it only logs; the real host routes to the
 *  named Kiro Crew path (e.g. `/chat`, where the folder settings live). */
export function useNavigate(): (path: string) => void {
  return (path: string) => {
    // eslint-disable-next-line no-console
    console.info('[sdk-stub] navigate', path)
  }
}

export interface AppTheme {
  mode: 'dark' | 'light'
  accent: string
  colorTheme: string
}

export function useTheme(): AppTheme {
  return { mode: 'dark', accent: 'var(--accent)', colorTheme: 'kiro-dark' }
}

// --- i18n format helpers (mirror website/src/i18n/format). Locale comes from
// the host; the stub uses the browser locale so nothing hardcodes one. -------

export function fmtRelative(ts: string | number | Date): string {
  const then = new Date(ts).getTime()
  if (Number.isNaN(then)) return ''
  const diffS = Math.round((then - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const abs = Math.abs(diffS)
  if (abs < 60) return rtf.format(Math.round(diffS), 'second')
  if (abs < 3600) return rtf.format(Math.round(diffS / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diffS / 3600), 'hour')
  return rtf.format(Math.round(diffS / 86400), 'day')
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat(undefined).format(n)
}

export function fmtDate(ts: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(ts))
}

export function fmtTime(ts: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date(ts))
}

export function fmtDateTime(ts: string | number | Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts))
}

export function compareText(a: string, b: string): number {
  return a.localeCompare(b)
}

// Re-exported fixture types so the harness and later steps share one source.
export type { Folder, Slot }
