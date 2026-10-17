import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppApi, useAppEvents, useAppInfo, useChatLauncher, fmtRelative } from '@kirocrew/app-sdk'
import { Badge, Btn, Clickable, EmptyState, ErrorNotice, PageHeader, SearchInput, Skeleton } from '@kirocrew/app-sdk/ui'
import { ChevronDown, ChevronRight, FolderKanban, GitPullRequest, Plus, RefreshCw, Users } from 'lucide-react'
import { buildProjects, loopText, TEAM_LEAD_AGENT, type Loop, type Member, type Project, type Slot, type SourceLink, type Status } from './model'
import { t } from './strings'
import { css } from './styles'

const POLL_MS = 5000

const STATUS_VARIANT: Record<Status, 'ok' | 'err' | 'warn' | 'aim' | 'muted'> = {
  needs_you: 'warn',
  stalled: 'err',
  working: 'aim',
  idle: 'muted',
}

function when(ts: string): string {
  return ts ? fmtRelative(ts) : ''
}

function StatusDot({ status }: { status: Status }) {
  return <span className={`tp-dot tp-dot-${status}`} aria-hidden="true" />
}

function PrChip({ link }: { link: SourceLink }) {
  const ci = link.ci ? t.ci[link.ci] : ''
  return (
    <a
      className={`tp-chip ${link.ci ? `tp-ci-${link.ci}` : ''}`}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={ci || link.url}
      onClick={e => e.stopPropagation()}
    >
      <GitPullRequest size={11} aria-hidden="true" />#{link.number}
      {ci && <span className="tp-sr">{ci}</span>}
    </a>
  )
}

function LoopLine({ loop }: { loop: Loop | null }) {
  if (!loop) return null
  const n = loopText(loop)
  return (
    <span className="tp-loop">
      <RefreshCw size={11} aria-hidden="true" />
      {loop.active ? t.loop(n) : t.loopStopped(n)}
    </span>
  )
}

function ProjectRow({ p, selected, onSelect }: { p: Project; selected: boolean; onSelect: () => void }) {
  const s = p.lead.slot
  return (
    <Clickable
      className={`tp-prow ${selected ? 'tp-prow-sel' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="tp-row-top">
        <StatusDot status={p.status} />
        <span className="tp-title">{s.title || t.untitled}</span>
        <span className="tp-muted tp-nowrap">{when(p.updated)}</span>
      </div>
      <div className="tp-muted tp-ellipsis tp-indent">
        {[p.loop ? t.loop(loopText(p.loop)) : '', p.repo, p.memberCount ? t.agents(p.memberCount) : '']
          .filter(Boolean)
          .join(' · ')}
      </div>
      {p.prs.length > 0 && (
        <div className="tp-chips tp-indent">
          {p.prs.slice(0, 3).map(l => <PrChip key={l.url} link={l} />)}
          {p.prs.length > 3 && <span className="tp-muted">+{p.prs.length - 3}</span>}
        </div>
      )}
    </Clickable>
  )
}

function MemberRow({ m, role, indent, onOpen }: { m: Member; role: string; indent?: boolean; onOpen: (key: string) => void }) {
  const s = m.slot
  const links = (s.source_links ?? []).filter(l => (l.kind ?? 'change') === 'change')
  return (
    <Clickable className="tp-mrow" onClick={() => onOpen(s.key)} aria-label={`${t.open}: ${s.title || t.untitled}`}>
      <div className={`tp-cell-task ${indent ? 'tp-indent2' : ''}`}>
        <div className="tp-row-top">
          <StatusDot status={m.status} />
          <span className="tp-title tp-weight-normal">{s.title || t.untitled}</span>
        </div>
        <div className="tp-muted tp-indent">{role} · {s.agent || ''}</div>
      </div>
      <div className="tp-cell-step tp-muted tp-clamp">
        {m.status !== 'idle' && <Badge variant={STATUS_VARIANT[m.status]}>{t.status[m.status]}</Badge>}{' '}
        {s.last_message || ''}
      </div>
      <div className="tp-cell-pr tp-chips">{links.map(l => <PrChip key={l.url} link={l} />)}</div>
      <div className="tp-cell-time tp-muted tp-nowrap">{when(s.last_activity_ts || s.last_ts || '')}</div>
    </Clickable>
  )
}

function ProjectDetail({ p, loops, onOpen }: { p: Project; loops: Loop[]; onOpen: (key: string) => void }) {
  const [workersOpen, setWorkersOpen] = useState(true)
  const s = p.lead.slot
  const subLoop = (key: string) => loops.find(l => l.slot_key === key && l.active) ?? null
  return (
    <div className="tp-detail">
      <div className="tp-lead">
        <div className="tp-lead-body">
          <div className="tp-muted">{t.lead} · {TEAM_LEAD_AGENT} · {when(s.last_activity_ts || s.last_ts || '')}</div>
          <h2 className="tp-h2">{s.title || t.untitled}</h2>
          <div className="tp-muted tp-row-top tp-wrap">
            <Badge variant={STATUS_VARIANT[p.status]}>{t.status[p.status]}</Badge>
            <LoopLine loop={p.loop} />
            {p.memberCount > 0 && <span>{t.agents(p.memberCount)} · {t.active(p.activeCount)}</span>}
          </div>
          {s.last_message && <p className="tp-last tp-clamp">{s.last_message}</p>}
          <div className="tp-chips">
            {p.repo && <span className="tp-chip">{p.repo}</span>}
            {p.prs.map(l => <PrChip key={l.url} link={l} />)}
          </div>
        </div>
        <Btn primary onClick={() => onOpen(s.key)}>{t.openLead}</Btn>
      </div>

      {p.memberCount === 0 ? (
        <p className="tp-muted tp-pad">{t.noAgents}</p>
      ) : (
        <div className="tp-table" role="list">
          <div className="tp-thead" aria-hidden="true">
            <span>{t.task}</span><span>{t.step}</span><span>{t.prs}</span><span>{t.updated}</span>
          </div>
          {p.subTeams.map(team => (
            <div key={team.lead.slot.key} role="listitem">
              <div className="tp-group">
                <Users size={12} aria-hidden="true" />
                {t.subTeam} · {team.lead.slot.title || t.untitled}
                <span className="tp-muted">
                  <LoopLine loop={subLoop(team.lead.slot.key)} />
                </span>
              </div>
              <MemberRow m={team.lead} role={t.subLead} onOpen={onOpen} />
              {team.workers.map(w => <MemberRow key={w.slot.key} m={w} role={t.worker} indent onOpen={onOpen} />)}
            </div>
          ))}
          {p.workers.length > 0 && (
            <div role="listitem">
              <Clickable className="tp-group tp-group-btn" onClick={() => setWorkersOpen(o => !o)} aria-expanded={workersOpen}>
                {workersOpen ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
                {t.workers} · {p.workers.length}
                <span className="tp-muted">{t.active(p.workers.filter(w => w.status !== 'idle').length)}</span>
              </Clickable>
              {workersOpen && p.workers.map(w => <MemberRow key={w.slot.key} m={w} role={t.worker} onOpen={onOpen} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TeamProjects() {
  const api = useAppApi()
  const { active } = useAppInfo()
  const { openChat } = useChatLauncher()
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const visible = active !== false

  const slotsQ = useQuery({
    queryKey: ['team-projects', 'slots'],
    queryFn: () => api.get<Slot[]>('/api/chat/slots'),
    refetchInterval: visible ? POLL_MS : false,
  })
  const loopsQ = useQuery({
    queryKey: ['team-projects', 'loops'],
    queryFn: () => api.get<{ enabled: boolean; loops: Loop[] }>('/api/autonudge'),
    refetchInterval: visible ? POLL_MS : false,
  })
  // A slots push is a cheap hint to refresh sooner than the poll.
  useAppEvents('slots', () => { void slotsQ.refetch() })

  const loops = loopsQ.data?.loops ?? []
  const projects = useMemo(
    () => buildProjects(Array.isArray(slotsQ.data) ? slotsQ.data : [], loops),
    [slotsQ.data, loops],
  )
  const shown = useMemo(() => {
    const q = filter.trim().toLocaleLowerCase()
    if (!q) return projects
    return projects.filter(p =>
      [p.lead.slot.title, p.repo, ...p.subTeams.map(s => s.lead.slot.title), ...p.workers.map(w => w.slot.title)]
        .some(v => (v || '').toLocaleLowerCase().includes(q)),
    )
  }, [projects, filter])
  const current = shown.find(p => p.lead.slot.key === selected) ?? shown[0] ?? null

  const openSession = (slotKey: string) => openChat({ slotKey })
  const newProject = () => openChat({ agent: TEAM_LEAD_AGENT, autoSend: false })

  return (
    <>
      <style>{css}</style>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={<Btn primary onClick={newProject}><Plus size={14} className="lucide-inline" aria-hidden="true" /> {t.newProject}</Btn>}
      />
      <div className="tp-root">
        {slotsQ.error ? (
          <ErrorNotice title={t.loadError} message={String((slotsQ.error as Error).message || slotsQ.error)} askAgent />
        ) : slotsQ.isLoading ? (
          <div className="tp-loading"><Skeleton className="tp-skel" /><Skeleton className="tp-skel" /><Skeleton className="tp-skel" /></div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={28} />}
            title={t.emptyTitle}
            subtitle={t.emptyBody}
            action={<Btn primary onClick={newProject}>{t.newProject}</Btn>}
          />
        ) : (
          <div className="tp-split">
            <aside className="tp-list" aria-label={t.title}>
              <SearchInput value={filter} onChange={e => setFilter(e.target.value)} placeholder={t.search} aria-label={t.search} />
              {shown.length === 0 && <p className="tp-muted tp-pad">{t.noMatch}</p>}
              {shown.map(p => (
                <ProjectRow
                  key={p.lead.slot.key}
                  p={p}
                  selected={current?.lead.slot.key === p.lead.slot.key}
                  onSelect={() => setSelected(p.lead.slot.key)}
                />
              ))}
            </aside>
            <main className="tp-main">
              {current ? <ProjectDetail key={current.lead.slot.key} p={current} loops={loops} onOpen={openSession} /> : <p className="tp-muted">{t.selectHint}</p>}
            </main>
          </div>
        )}
      </div>
    </>
  )
}
