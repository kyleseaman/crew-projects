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
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  leadTranscriptFor,
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

/** Harness-only flag: `?empty=1` serves the no-waiting slot list so the Overview's
 *  no-Needs-you state can be screenshotted. Never a real API concern. */
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

/** Harness-only: the host's global YOLO flag as `GET /api/status` reports it.
 *  `?yolo=1` starts with YOLO on; `window.__stubSetYolo(bool)` flips it later,
 *  the way a person turning YOLO on in the dashboard would. `?nostatus=1` makes
 *  the read fail like an install whose /api/status entry is still withheld. */
let stubYolo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('yolo') === '1'
if (typeof window !== 'undefined') {
  ;(window as Window & { __stubSetYolo?: (on: boolean) => void }).__stubSetYolo = on => { stubYolo = on }
}
function noStatusMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('nostatus') === '1'
}

/** Harness-only: `?chips=1` gives every embedded chat a latest assistant turn
 *  offering reply options, so the host's follow-up chip rows (FollowUpBar)
 *  draw above the composer. */
function chipsMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('chips') === '1'
}
/** Enough options to wrap onto two rows at 1440 and more at 320. */
export const STUB_FOLLOW_UP_OPTIONS = [
  'Ship the lap-split fix now',
  'Show me the failing parser test',
  'Rebase onto main first',
  'Hold until GPS drift is triaged',
  'Open the CI run',
]

/** Harness-only: `?hold=slots,folders,...` keeps those reads pending so each
 *  loading state can be screenshotted; `window.__stubRelease(name | 'all')`
 *  lets them answer, to capture the loaded state replacing the skeleton.
 *  Names: folders, slots, loops, sessions, artifacts, docs, schedules, status. */
const HOLD_ROUTES: Record<string, (r: string) => boolean> = {
  folders: r => r === '/api/chat/folders',
  slots: r => r === '/api/chat/slots',
  loops: r => r === '/api/autonudge',
  sessions: r => r === '/api/sessions',
  artifacts: r => r === '/api/artifacts',
  docs: r => r === '/api/artifacts/session-docs',
  schedules: r => r.startsWith('/api/project-schedules/'),
  status: r => r === '/api/status',
}
const holding = new Set(
  typeof window === 'undefined'
    ? []
    : (new URLSearchParams(window.location.search).get('hold') || '').split(',').map(s => s.trim()).filter(Boolean),
)
const waiters: { name: string; go: () => void }[] = []
if (typeof window !== 'undefined') {
  ;(window as Window & { __stubRelease?: (name: string) => void }).__stubRelease = name => {
    for (const n of name === 'all' ? [...holding] : [name]) holding.delete(n)
    for (const w of waiters.splice(0)) {
      if (holding.has(w.name)) waiters.push(w)
      else w.go()
    }
  }
}
function held(path: string): Promise<void> {
  const r = route(path)
  const name = [...holding].find(n => HOLD_ROUTES[n]?.(r))
  if (!name) return Promise.resolve()
  return new Promise(go => waiters.push({ name, go }))
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
    case '/api/status':
      if (noStatusMode()) throw Object.assign(new Error('API 403: {"code":"forbidden"}'), { status: 403 })
      return { yolo: stubYolo, disabled_approval_modes: [] } as unknown as T
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
    await held(path)
    return resolve<T>(path)
  },
  async get<T>(path: string) {
    await held(path)
    return resolve<T>(path)
  },
  async post<T>(path: string, body?: unknown) {
    // eslint-disable-next-line no-console
    console.info('[sdk-stub] POST', path, body)
    if (route(path) === '/api/chat/mode') {
      // Mirror the host's slot-scoped mode write (slot_approval.api_chat_mode):
      // an app may set normal / trust_reads / trust on ONE named slot; YOLO and
      // an unnamed slot are refused. The fixture row is updated so the app's
      // next slot read shows the new posture, as the host's would.
      const b = (body as { mode?: string; slot?: string }) || {}
      if (b.mode === 'yolo') throw Object.assign(new Error('API 403: {"code":"app_yolo_denied"}'), { status: 403 })
      const row = slotsFixture.find(s => s.key === b.slot) as Slot | undefined
      if (!row) throw Object.assign(new Error('API 404: {"code":"slot_not_found"}'), { status: 404, body: '{"code":"slot_not_found"}' })
      row.trust = b.mode === 'trust'
      row.trust_reads = b.mode === 'trust_reads'
      row.trust_scope = ''
      return { ok: true, mode: b.mode } as unknown as T
    }
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
    name: 'project-hub',
    version: '0.1.0',
    permissions: { api: STUB_API_PERMISSIONS, events: ['slots'] },
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

/** Mirrors app.json's permissions.api (kept in sync by hand; the harness
 *  ChatEmbed below reads it the way the host's does to decide whether the
 *  attach control shows). */
export const STUB_API_PERMISSIONS = [
  '/api/chat', '/api/chat/slots', '/api/chat/folders', '/api/autonudge', '/api/sessions',
  '/api/artifacts', '/api/project-schedules', '/api/upload/file', '/api/slash-commands', '/api/file-search',
  '/api/status',
]

/** The `meta` a send with attachments carries (host ChatEmbedSendMeta). */
export interface ChatEmbedSendMeta {
  files?: string[]
}

/** Mirrors website/src/app-sdk/ChatEmbed.tsx's ChatEmbedProps on origin/main. */
export interface ChatEmbedProps {
  slotKey: string
  agent?: string
  placeholder?: string
  frameless?: boolean
  startAtBottom?: boolean
  onSend?: (message: string, meta?: ChatEmbedSendMeta) => Promise<unknown> | void
  aboveComposer?: ReactNode
  composerMaxHeight?: number
  onFileOpen?: (path: string, opts?: { line?: number; endLine?: number }) => void
  onArtifactOpen?: (slug: string) => void
}

/** useLayoutEffect in the browser, useEffect under server rendering (tests). */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** The host composer's default auto-grow cap (useComposerDraft's maxHeight). */
export const HOST_COMPOSER_MAX_HEIGHT = 240

/** Stand-in for the host's ChatEmbed (website/src/app-sdk/ChatEmbed.tsx): a
 *  scrollable transcript read from fixtures and a compact composer. The real
 *  one polls GET /api/chat/slots/{slot} and sends POST /api/chat; here a send
 *  is logged, appended locally and answered with a canned lead reply so the
 *  harness can show the round trip. Like the host it renders a pending tool
 *  approval inline with Approve / Reject / Trust, and shows the attach control
 *  only when the app declares /api/upload/file. Styled with host tokens only. */
export function ChatEmbed({ slotKey, placeholder, frameless, startAtBottom }: ChatEmbedProps) {
  const [rows, setRows] = useState(() => leadTranscriptFor(slotKey))
  const slot = slotsFixture.find(s => s.key === slotKey)
  const [approval, setApproval] = useState<string | null>(slot?.pending_approval ? 'pending' : null)
  const canAttach = STUB_API_PERMISSIONS.includes('/api/upload/file')
  const [draft, setDraft] = useState('')
  // The host's auto-grow, verbatim from website/src/app-sdk/useComposerDraft.ts
  // `measure`: height = min(scrollHeight, maxHeight), measured with overflow
  // hidden. scrollHeight excludes the border, so on the host's bordered
  // border-box textarea this always leaves the box 2px short (the scrollbar
  // the owner saw); the app's CSS removes that border.
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  useIsoLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    const prevOverflow = el.style.overflow
    const prevScrollTop = el.scrollTop
    el.style.overflow = 'hidden'
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, HOST_COMPOSER_MAX_HEIGHT)}px`
    el.style.overflow = prevOverflow
    el.scrollTop = prevScrollTop
  }, [draft])
  // Mirrors the host's startAtBottom: open at (and follow) the latest message.
  const scroller = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scroller.current
    if (startAtBottom && el) el.scrollTop = el.scrollHeight
  }, [rows, startAtBottom])
  const send = () => {
    const text = draft.trim()
    if (!text) return
    // eslint-disable-next-line no-console
    console.info('[sdk-stub] ChatEmbed POST /api/chat', { slot: slotKey, message: text })
    setRows(r => [...r, { role: 'user', content: text }])
    setDraft('')
    setTimeout(() => setRows(r => [...r, { role: 'assistant', content: 'On it — I will report back here when the next worker lands.' }]), 400)
  }
  return (
    <div
      data-stub="chat-embed"
      data-slot={slotKey}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        ...(frameless ? {} : { border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)' }),
      }}
    >
      <div ref={scroller} className="chat-container" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarGutter: 'stable', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '78%',
              padding: '7px 11px',
              borderRadius: 10,
              fontSize: 13,
              lineHeight: '19px',
              background: m.role === 'user' ? 'var(--bg-hover)' : 'transparent',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}
        {approval && (
          <div
            data-stub="approval"
            style={{ alignSelf: 'stretch', border: '1px solid color-mix(in srgb, var(--warn) 45%, var(--border))', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, background: 'color-mix(in srgb, var(--warn) 8%, transparent)' }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warn)' }}>
              {approval === 'pending' ? 'Approval needed' : approval}
            </div>
            <code style={{ fontSize: 12, color: 'var(--text)' }}>shell · git push --force-with-lease=fix/review:4b1e9c0 origin fix/review</code>
            {approval === 'pending' && (
              <div style={{ display: 'flex', gap: 6 }}>
                {['Approve', 'Trust', 'Reject'].map(label => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      // eslint-disable-next-line no-console
                      console.info('[sdk-stub] ChatEmbed POST /api/chat/slots/{slot}/approve', { slot: slotKey, decision: label.toLowerCase() })
                      setApproval(label === 'Reject' ? 'Rejected' : label === 'Trust' ? 'Trusted' : 'Approved')
                    }}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: label === 'Approve' ? 'var(--accent)' : 'transparent', color: label === 'Approve' ? 'var(--accent-fg, #fff)' : 'var(--text)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* The host's follow-up chips (website/src/components/FollowUpBar.tsx,
          MultilineLayout), with its OWN class strings: the embed's wrapper
          `shrink-0 px-3` (frameless), the wrapping row `flex gap-1.5
          flex-wrap pt-1 items-end`, each chip `followup-chip px-3 py-1.5 ...
          rounded-lg` on a glass pill. host-globals.css defines them. */}
      {chipsMode() && (
        <div className="shrink-0 px-3" data-stub="follow-up">
          <div data-tip-boundary className="flex gap-1.5 flex-wrap pt-1 items-end">
            {STUB_FOLLOW_UP_OPTIONS.map(o => (
              <button
                key={o}
                type="button"
                data-stub="follow-up-chip"
                title={o}
                onClick={() => setDraft(o)}
                className="followup-chip px-3 py-1.5 mc-message-font-chip text-left leading-snug transition-all border border-transparent rounded-lg text-muted"
                style={{ background: 'color-mix(in srgb, var(--text) 6%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--text) 10%, transparent)', cursor: 'pointer' }}
              >
                <span className="block truncate">{o}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* The host's composer row, with the host's OWN class strings
          (ChatEmbed.tsx, frameless): paperclip | bordered textarea | send.
          host-globals.css defines those utilities, so the app's CSS meets the
          same cascade here as on the host. */}
      <div className="flex items-end gap-2 px-3 py-2 shrink-0 ">
        {canAttach && (
          <button
            type="button"
            aria-label="Attach files"
            title="Attach files"
            data-stub="attach"
            className="p-2 rounded-md text-muted"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
            </svg>
          </button>
        )}
        <textarea
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={placeholder || 'Message...'}
          rows={1}
          aria-label="Chat message"
          data-stub="composer-input"
          className="flex-1 min-w-0 min-h-[38px] resize-none overflow-y-auto px-3 py-2 mc-message-font-text bg-bg-elevated border border-border rounded-md text-text outline-hidden focus-visible:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Send"
          disabled={!draft.trim()}
          className="p-2 min-h-0 rounded-md"
          style={{ border: 'none', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', opacity: draft.trim() ? 1 : 0.4 }}
        >
          ➤
        </button>
      </div>
    </div>
  )
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
