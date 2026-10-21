import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { MENU_MODES, MODE_PATH, STATUS_PATH, TRUST_MODES, hostYolo, modeRequest, policyDisabledModes, shownMode, slotOwnMode, trustErrorKind } from './trust'
import { STATUS_QUERY_KEY, TrustControl } from './TrustControl'
import { CenterColumn } from './Workspace'
import { buildFolderProjects, chatAgentName, type Folder, type FolderProject, type Slot } from './model'
import { css } from './styles'
import { t } from './strings'

// Pins 0.9.0/0.9.1's composer fixes: the approval-mode picker under the embedded
// composer (item 1), and the composer row CSS that stops the always-on
// scrollbar and puts the paperclip inside the input's box (owner's "scroll is
// off" report).

const app = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8'))
const html = (el: JSX.Element, client = new QueryClient()) =>
  renderToStaticMarkup(<QueryClientProvider client={client}>{el}</QueryClientProvider>)
/** A client whose host status read has answered with `status`. */
const withStatus = (status: unknown) => {
  const c = new QueryClient()
  c.setQueryData(STATUS_QUERY_KEY, status)
  return c
}
const NORMAL = { trust: false, trust_reads: false, trust_scope: '' }

describe('approval mode (trust.ts)', () => {
  it('reads the slot row the way the dashboard picker does', () => {
    expect(slotOwnMode(NORMAL)).toBe('normal')
    expect(slotOwnMode({ ...NORMAL, trust_reads: true })).toBe('trust_reads')
    expect(slotOwnMode({ ...NORMAL, trust: true })).toBe('trust')
    // A live app-armed scoped grant reads as Trust, and outranks Reads.
    expect(slotOwnMode({ ...NORMAL, trust_scope: 'until 17:00', trust_reads: true })).toBe('trust')
    // No mode fields at all: no answer, never a default Normal.
    expect(slotOwnMode({})).toBeNull()
    expect(slotOwnMode(null)).toBeNull()
  })

  it('lists the dashboard\'s four modes but SETS only Normal, Reads and Trust: the host refuses YOLO from an app', () => {
    expect(MENU_MODES).toEqual(['normal', 'trust_reads', 'trust', 'yolo'])
    expect(TRUST_MODES).toEqual(['normal', 'trust_reads', 'trust'])
    expect(TRUST_MODES as readonly string[]).not.toContain('yolo')
  })

  it('shows the real mode: YOLO over any slot mode, Unknown when the host has not said', () => {
    expect(shownMode({ ...NORMAL, trust: true }, true)).toBe('yolo')
    expect(shownMode(NORMAL, true)).toBe('yolo')
    expect(shownMode({ ...NORMAL, trust_reads: true }, false)).toBe('trust_reads')
    expect(shownMode(NORMAL, false)).toBe('normal')
    // The YOLO read has not answered: never a guessed Normal.
    expect(shownMode(NORMAL, null)).toBe('unknown')
    // A slot row with no mode fields at all: Unknown, not Normal.
    expect(shownMode({}, false)).toBe('unknown')
    expect(shownMode(null, false)).toBe('unknown')
  })

  it('reads YOLO and policy locks only from the host status read', () => {
    expect(STATUS_PATH).toBe('/api/status')
    expect(app.permissions.api).toContain('/api/status')
    expect(hostYolo({ yolo: true })).toBe(true)
    expect(hostYolo({ yolo: false })).toBe(false)
    expect(hostYolo({})).toBeNull()
    expect(hostYolo({ yolo: 'yes' })).toBeNull()
    expect(hostYolo(undefined)).toBeNull()
    expect([...policyDisabledModes({ disabled_approval_modes: ['yolo', 'trust', 'normal', 3] })]).toEqual(['yolo', 'trust'])
  })

  it('always names the slot (an unnamed slot is the all-slots request the host refuses)', () => {
    expect(modeRequest('lead-1', 'trust')).toEqual({ mode: 'trust', slot: 'lead-1' })
  })

  it('writes through the host route the app already holds the api grant for, with the session grant', () => {
    expect(MODE_PATH).toBe('/api/chat/mode')
    const granted = (app.permissions.api as string[]).some(p => MODE_PATH === p || MODE_PATH.startsWith(`${p}/`))
    expect(granted).toBe(true)
    expect(app.permissions.sessionApproval).toBe(true)
    expect(app.version).toBe('0.9.4')
  })

  it('says why a pick was refused', () => {
    const err = (status: number, code: string) => ({ status, body: JSON.stringify({ code }), message: `API ${status}` })
    expect(trustErrorKind(err(403, 'session_approval_not_granted'))).toBe('not_granted')
    expect(trustErrorKind(err(404, 'slot_not_found'))).toBe('not_allowed')
    expect(trustErrorKind(err(400, 'slot_required'))).toBe('not_allowed')
    expect(trustErrorKind(err(403, 'mode_disabled_by_policy'))).toBe('policy')
    expect(trustErrorKind(new Error('network'))).toBe('other')
  })
})

describe('TrustControl', () => {
  it('names the slot\'s current mode on its trigger, collapsed by default', () => {
    const m = html(<TrustControl slot={{ key: 's', ...NORMAL, trust_reads: true }} />, withStatus({ yolo: false }))
    expect(m).toContain('aria-label="Approval mode: Reads"')
    expect(m).toContain('aria-haspopup="menu"')
    expect(m).toContain('aria-expanded="false"')
    expect(m).not.toContain('role="menu"')
  })

  it('a chat in YOLO renders YOLO, in the warning style, whatever the slot\'s own mode', () => {
    for (const own of [NORMAL, { ...NORMAL, trust: true }, { ...NORMAL, trust_reads: true }]) {
      const m = html(<TrustControl slot={{ key: 's', ...own }} />, withStatus({ yolo: true }))
      expect(m).toContain('aria-label="Approval mode: YOLO"')
      expect(m).toContain('data-mode="yolo"')
      expect(m).toMatch(/class="tp-trust-trigger tp-trust-yolo"/)
      expect(m).not.toMatch(/Approval mode: (Normal|Trust|Reads)"/)
    }
  })

  it('follows a mode changed elsewhere: a new status read or slot row re-renders the picker', () => {
    const client = withStatus({ yolo: false })
    const slot = { key: 's', ...NORMAL }
    expect(html(<TrustControl slot={slot} />, client)).toContain('Approval mode: Normal')
    // YOLO turned on in the dashboard: the next status read says so.
    client.setQueryData(STATUS_QUERY_KEY, { yolo: true })
    expect(html(<TrustControl slot={slot} />, client)).toContain('Approval mode: YOLO')
    // YOLO off again and Reads picked in the dashboard: the next slot row says so.
    client.setQueryData(STATUS_QUERY_KEY, { yolo: false })
    expect(html(<TrustControl slot={{ ...slot, trust_reads: true }} />, client)).toContain('Approval mode: Reads')
  })

  it('refreshes the status read on every slots event and on its own poll', () => {
    const appSrc = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8')
    const handler = appSrc.slice(appSrc.indexOf("useAppEvents('slots'"), appSrc.indexOf('\n  })', appSrc.indexOf("useAppEvents('slots'")))
    expect(handler).toContain('invalidateQueries({ queryKey: STATUS_QUERY_KEY })')
    expect(handler).toContain('slotsQ.refetch()')
    const tc = readFileSync(new URL('./TrustControl.tsx', import.meta.url), 'utf8')
    expect(tc).toMatch(/queryKey: STATUS_QUERY_KEY,\s*queryFn: \(\) => api\.get<HostModeStatus>\(STATUS_PATH\),\s*refetchInterval: active !== false \? POLL_MS : false/)
  })

  it('renders Unknown, not Normal, when the host read failed or the row has no mode; a placeholder while it is out', () => {
    // 0.9.3: no answer yet is a pill-sized placeholder, never a mode.
    const pending = html(<TrustControl slot={{ key: 's', ...NORMAL }} />)
    expect(pending).toContain('data-mode="loading"')
    expect(pending).toContain('class="tp-sk tp-sk-trust"')
    expect(pending).not.toContain('Approval mode: Normal')
    expect(pending).not.toContain('Approval mode: Unknown')
    // An answer with nothing usable in it reads Unknown. (A failed read does
    // too: the harness's ?nostatus=1 view, trust-control-unknown, asserts it.)
    const noStatus = html(<TrustControl slot={{ key: 's', ...NORMAL }} />, withStatus(null))
    expect(noStatus).toContain('aria-label="Approval mode: Unknown"')
    expect(noStatus).not.toContain('Approval mode: Normal')
    const noFields = html(<TrustControl slot={{ key: 's' }} />, withStatus({ yolo: false }))
    expect(noFields).toContain('aria-label="Approval mode: Unknown"')
    const badStatus = html(<TrustControl slot={{ key: 's', ...NORMAL }} />, withStatus({ uptime_secs: 3 }))
    expect(badStatus).toContain('aria-label="Approval mode: Unknown"')
  })

  it('sits under the embedded composer for the lead chat AND for an opened session', () => {
    const SLOTS: Slot[] = [
      { key: 'L', agent: 'kirocrew-team-lead', title: 'Goal', folder_id: 'f1', ...NORMAL, trust: true },
      { key: 'W', agent: 'kirocrew-worker', created_by: 'L', title: 'Worker', ...NORMAL },
    ]
    const FOLDERS: Folder[] = [{ id: 'f1', name: 'Proj', project_dir: '/r' }]
    const p = buildFolderProjects(FOLDERS, SLOTS, [], []).find(x => x.folder.id === 'f1') as FolderProject
    const goal = p.goals[0]
    const noop = () => {}
    const lead = html(<CenterColumn p={p} goal={goal} session={null} onBack={noop} onOpenFull={noop} onNewGoal={noop} onSettings={noop} />, withStatus({ yolo: false }))
    // Order: the embed, then the footer holding the picker, inside .tp-cbody.
    expect(lead).toMatch(/class="tp-cbody"><div data-stub="chat-embed" data-slot="L"[\s\S]*<\/div><div class="tp-cfoot"><div class="tp-trust" data-testid="trust-control"/)
    expect(lead).toContain('aria-label="Approval mode: Trust"')
    const worker = { slot: SLOTS[1], status: 'idle' as const }
    const opened = html(<CenterColumn p={p} goal={goal} session={worker} onBack={noop} onOpenFull={noop} onNewGoal={noop} onSettings={noop} />, withStatus({ yolo: false }))
    expect(opened).toMatch(/data-slot="W"[\s\S]*class="tp-cfoot"[\s\S]*aria-label="Approval mode: Normal"/)
  })
})

describe('embedded composer CSS (the "scroll is off" report)', () => {
  const ROW = '.tp-cbody>:first-child>div:has(>textarea)'
  const rule = (sel: string) => {
    const i = css.indexOf(`${sel}{`)
    return i < 0 ? '' : css.slice(i + sel.length + 1, css.indexOf('}', i))
  }

  it('the textarea is borderless, so the host auto-grow (height = scrollHeight) never leaves it overflowing', () => {
    expect(rule(`${ROW}>textarea`)).toMatch(/(^|;)border:0(;|$)/)
  })

  it('the border sits on the row, so paperclip, text and send share one box like the dashboard composer', () => {
    expect(rule(ROW)).toContain('border:1px solid var(--border)')
    expect(rule(`.tp-cbody>:first-child>div:has(>textarea:focus-visible)`)).toContain('border-color:var(--accent)')
  })

  it('forces no scroll on the composer or the transcript and restyles no host scrollbar', () => {
    expect(css).not.toMatch(/overflow(-y)?:\s*scroll/)
    // The only scrollbar rule the app owns is the side-panel tab strip's.
    const bars = [...css.matchAll(/([^{}]*)::-webkit-scrollbar[^{]*\{/g)].map(m => m[1].trim())
    expect(bars).toEqual(['.tp-tabs'])
    expect(css).not.toMatch(/\.tp-cbody[^{]*\{[^}]*scrollbar-(width|color)/)
  })

  it('keeps the embed a bounded flex child, so its transcript scrolls itself and stays pinned', () => {
    expect(rule('.tp-cbody>:first-child')).toBe('flex:1;min-height:0')
    const ws = readFileSync(new URL('./Workspace.tsx', import.meta.url), 'utf8')
    expect(ws).toMatch(/<ChatEmbed\s+key=\{target\.key\}\s+slotKey=\{target\.key\}\s+frameless\s+startAtBottom/)
  })

  it('0.9.4: the composer row sits 6px under the follow-up chips, the gap between chip rows (gap-1.5), on the chips\' 12px left edge', () => {
    // The host's chip wrapper is `px-3` (12px sides) and its rows `gap-1.5`
    // (6px) with no bottom padding; the row's own top margin is the only gap.
    expect(rule(ROW)).toMatch(/(^|;)margin:6px 12px 0(;|$)/)
    // Still the 0.9.0 box: border on the row, 3px 4px inside it.
    expect(rule(ROW)).toMatch(/(^|;)padding:3px 4px(;|$)/)
  })

  it('0.9.4: the agent-naming placeholder stays on one line, so a long name never grows an empty composer', () => {
    expect(rule(`${ROW}>textarea::placeholder`)).toBe('white-space:nowrap;overflow:hidden;text-overflow:ellipsis')
  })
})

describe('embedded chat placeholder (0.9.4)', () => {
  const SLOTS: Slot[] = [
    { key: 'L', agent: 'kirocrew-team-lead', title: 'Goal', folder_id: 'f1', ...NORMAL },
    { key: 'W', agent: 'fable', created_by: 'L', title: 'Worker', ...NORMAL },
    { key: 'X', agent: '  ', created_by: 'L', title: 'No agent', ...NORMAL },
  ]
  const FOLDERS: Folder[] = [{ id: 'f1', name: 'Proj', project_dir: '/r' }]
  const p = buildFolderProjects(FOLDERS, SLOTS, [], []).find(x => x.folder.id === 'f1') as FolderProject
  const goal = p.goals[0]
  const noop = () => {}
  const col = (session: Slot | null, g = goal) =>
    html(
      <CenterColumn p={p} goal={g} session={session ? { slot: session, status: 'idle' } : null}
        onBack={noop} onOpenFull={noop} onNewGoal={noop} onSettings={noop} />,
      withStatus({ yolo: false }),
    )
  const placeholderOf = (m: string) => m.match(/<textarea[^>]*placeholder="([^"]*)"/)?.[1]

  it('the lead chat names the lead\'s agent, never the old "Message the lead…"', () => {
    const m = col(null)
    expect(placeholderOf(m)).toBe('Message kirocrew-team-lead…')
    expect(m).not.toContain('Message the lead')
  })

  it('a session opened in the middle names ITS agent (a crewmate chat: the crewmate\'s name)', () => {
    const m = col(SLOTS[1])
    expect(placeholderOf(m)).toBe('Message fable…')
    expect(m).not.toContain('Message this session')
  })

  it('no agent name: no placeholder is passed, so the host default ("Message...") shows', () => {
    expect(chatAgentName(SLOTS[2])).toBe('')
    expect(chatAgentName({})).toBe('')
    expect(chatAgentName(null)).toBe('')
    // The harness stub draws the host's default when the prop is absent.
    expect(placeholderOf(col(SLOTS[2]))).toBe('Message...')
    const noAgentLead = { ...goal, lead: { ...goal.lead, slot: { ...goal.lead.slot, agent: undefined } } }
    expect(placeholderOf(col(null, noAgentLead))).toBe('Message...')
  })

  it('the old fixed strings are gone from the catalog', () => {
    expect(t).not.toHaveProperty('leadChatPlaceholder')
    expect(t).not.toHaveProperty('sessionChatPlaceholder')
    expect(t.chatPlaceholder('x')).toBe('Message x…')
  })
})
