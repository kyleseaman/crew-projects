import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppApi, useAppEvents, useAppInfo, useChatLauncher, useNavigate, fmtRelative } from '@kirocrew/app-sdk'
import { Badge, Btn, Clickable, EmptyState, ErrorNotice, PageHeader, SearchInput, Skeleton } from '@kirocrew/app-sdk/ui'
import {
  BookText,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  FolderKanban,
  GitPullRequest,
  Plus,
  RefreshCw,
  Settings,
  Users,
  X,
} from 'lucide-react'
import {
  buildFolderProjects,
  loopText,
  repoName,
  DEFAULT_PROJECT_AGENT,
  TEAM_LEAD_AGENT,
  type ArchivedSession,
  type Folder,
  type FolderProject,
  type Loop,
  type Member,
  type Project,
  type SessionsPage,
  type Slot,
  type SourceLink,
  type Status,
} from './model'
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

/** One project row in the sidebar list. A project is a folder. */
function ProjectRow({ p, selected, onSelect }: { p: FolderProject; selected: boolean; onSelect: () => void }) {
  const liveGoals = p.goals.filter(g => !g.archived)
  const reposLabel = p.needsDir
    ? t.setDirectoryTitle
    : p.repos.map(repoName).join(' · ')
  const prs = dedupePrs(p.goals)
  return (
    <Clickable
      className={`tp-prow ${selected ? 'tp-prow-sel' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="tp-row-top">
        <StatusDot status={p.status} />
        <span className="tp-title">{p.folder.name}</span>
        {p.updated && <span className="tp-muted tp-nowrap">{when(p.updated)}</span>}
      </div>
      <div className="tp-muted tp-ellipsis tp-indent">
        {[reposLabel, p.goals.length ? t.goalsCount(liveGoals.length, p.goals.length) : '']
          .filter(Boolean)
          .join(' · ')}
      </div>
      {prs.length > 0 && (
        <div className="tp-chips tp-indent">
          {prs.slice(0, 3).map(l => <PrChip key={l.url} link={l} />)}
          {prs.length > 3 && <span className="tp-muted">+{prs.length - 3}</span>}
        </div>
      )}
    </Clickable>
  )
}

/** PRs de-duplicated across every team in a project. */
function dedupePrs(teams: Project[]): SourceLink[] {
  const seen = new Map<string, SourceLink>()
  for (const team of teams) for (const l of team.prs) if (!seen.has(l.url)) seen.set(l.url, l)
  return [...seen.values()]
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

/** One goal inside a project: a team-lead session and everything it
 *  dispatched, grouped at most two levels deep. An ARCHIVED goal (a history
 *  team-lead session with no live slot) renders dimmed, with no rollup — just
 *  the lead and an Open button. */
function GoalCard({ goal, loops, onOpen }: { goal: Project; loops: Loop[]; onOpen: (key: string) => void }) {
  const [workersOpen, setWorkersOpen] = useState(true)
  const s = goal.lead.slot
  const subLoop = (key: string) => loops.find(l => l.slot_key === key && l.active) ?? null

  if (goal.archived) {
    return (
      <div className="tp-team tp-team-archived">
        <div className="tp-lead">
          <div className="tp-lead-body">
            <div className="tp-muted tp-row-top tp-wrap">
              <Badge variant="muted">{t.archivedGoal}</Badge>
              <span>{t.lead} · {TEAM_LEAD_AGENT}</span>
              {s.last_activity_ts && <span>· {when(s.last_activity_ts)}</span>}
            </div>
            <h3 className="tp-h3 tp-h3-archived">{s.title || t.untitled}</h3>
          </div>
          <Btn onClick={() => onOpen(s.key)}>{t.openGoal}</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="tp-team">
      <div className="tp-lead">
        <div className="tp-lead-body">
          <div className="tp-muted">{t.lead} · {TEAM_LEAD_AGENT} · {when(s.last_activity_ts || s.last_ts || '')}</div>
          <h3 className="tp-h3">{s.title || t.untitled}</h3>
          <div className="tp-muted tp-row-top tp-wrap">
            <Badge variant={STATUS_VARIANT[goal.status]}>{t.status[goal.status]}</Badge>
            <LoopLine loop={goal.loop} />
            {goal.memberCount > 0 && <span>{t.agents(goal.memberCount)} · {t.active(goal.activeCount)}</span>}
          </div>
          {s.last_message && <p className="tp-last tp-clamp">{s.last_message}</p>}
        </div>
        <Btn primary onClick={() => onOpen(s.key)}>{t.openLead}</Btn>
      </div>

      {goal.memberCount === 0 ? (
        <p className="tp-muted tp-pad">{t.noAgents}</p>
      ) : (
        <div className="tp-table" role="list">
          <div className="tp-thead" aria-hidden="true">
            <span>{t.task}</span><span>{t.step}</span><span>{t.prs}</span><span>{t.updated}</span>
          </div>
          {goal.subTeams.map(sub => (
            <div key={sub.lead.slot.key} role="listitem">
              <div className="tp-group">
                <Users size={12} aria-hidden="true" />
                {t.subTeam} · {sub.lead.slot.title || t.untitled}
                <span className="tp-muted">
                  <LoopLine loop={subLoop(sub.lead.slot.key)} />
                </span>
              </div>
              <MemberRow m={sub.lead} role={t.subLead} onOpen={onOpen} />
              {sub.workers.map(w => <MemberRow key={w.slot.key} m={w} role={t.worker} indent onOpen={onOpen} />)}
            </div>
          ))}
          {goal.workers.length > 0 && (
            <div role="listitem">
              <Clickable className="tp-group tp-group-btn" onClick={() => setWorkersOpen(o => !o)} aria-expanded={workersOpen}>
                {workersOpen ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
                {t.workers} · {goal.workers.length}
                <span className="tp-muted">{t.active(goal.workers.filter(w => w.status !== 'idle').length)}</span>
              </Clickable>
              {workersOpen && goal.workers.map(w => <MemberRow key={w.slot.key} m={w} role={t.worker} onOpen={onOpen} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** The project page: the folder header (repos, default agent, read-only
 *  instructions + a settings link, or a Set-directory prompt), then every
 *  team rollup attached to the project. */
function ProjectPage({
  p,
  loops,
  onOpen,
  onNewGoal,
  onSettings,
}: {
  p: FolderProject
  loops: Loop[]
  onOpen: (key: string) => void
  onNewGoal: (p: FolderProject) => void
  onSettings: (p: FolderProject) => void
}) {
  const liveGoals = p.goals.filter(g => !g.archived)
  const archivedGoals = p.goals.filter(g => g.archived)
  return (
    <div className="tp-detail">
      <header className="tp-phead">
        <div className="tp-phead-top">
          <div className="tp-phead-title">
            <FolderKanban size={18} aria-hidden="true" />
            <h2 className="tp-h2">{p.folder.name}</h2>
          </div>
          <div className="tp-phead-actions">
            <Btn onClick={() => onSettings(p)}>
              <Settings size={13} className="lucide-inline" aria-hidden="true" /> {t.folderSettings}
            </Btn>
            <Btn primary onClick={() => onNewGoal(p)}>
              <Plus size={13} className="lucide-inline" aria-hidden="true" /> {t.newGoal}
            </Btn>
          </div>
        </div>

        {p.needsDir ? (
          <div className="tp-setdir" role="note">
            <div className="tp-setdir-body">
              <strong className="tp-setdir-title">{t.setDirectoryTitle}</strong>
              <p className="tp-muted">{t.setDirectoryBody}</p>
            </div>
            <Btn onClick={() => onSettings(p)}>{t.setDirectory}</Btn>
          </div>
        ) : (
          <dl className="tp-meta">
            <div className="tp-meta-item">
              <dt className="tp-meta-label">
                <FolderGit2 size={12} aria-hidden="true" /> {p.repos.length === 1 ? t.oneRepo : t.nRepos(p.repos.length)}
              </dt>
              <dd className="tp-meta-val tp-chips">
                {p.repos.map(r => (
                  <span key={r} className="tp-chip tp-repo" title={r}>{repoName(r)}</span>
                ))}
              </dd>
            </div>
            <div className="tp-meta-item">
              <dt className="tp-meta-label"><Users size={12} aria-hidden="true" /> {t.defaultAgentHeader}</dt>
              <dd className="tp-meta-val"><span className="tp-chip">{p.defaultAgent}</span></dd>
            </div>
            <div className="tp-meta-item tp-meta-wide">
              <dt className="tp-meta-label">
                <BookText size={12} aria-hidden="true" /> {t.instructions}
                <span className="tp-muted tp-ro">· {t.instructionsReadOnly}</span>
              </dt>
              <dd className="tp-meta-val">
                {p.instructions.length === 0 ? (
                  <span className="tp-muted">{t.noInstructions}</span>
                ) : (
                  <ul className="tp-instr">
                    {p.instructions.map(d => <li key={d} className="tp-chip tp-instr-item" title={d}>{d}</li>)}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        )}
      </header>

      {p.goals.length === 0 ? (
        <div className="tp-nogoals tp-pad">
          <p className="tp-muted">{t.noGoals}</p>
          <Btn primary onClick={() => onNewGoal(p)}>
            <Plus size={13} className="lucide-inline" aria-hidden="true" /> {t.newGoal}
          </Btn>
        </div>
      ) : (
        <div className="tp-teams">
          {liveGoals.length > 0 && (
            <div className="tp-goals-section">
              <div className="tp-section-head">{t.liveGoals} · {liveGoals.length}</div>
              {liveGoals.map(goal => (
                <GoalCard key={goal.lead.slot.key} goal={goal} loops={loops} onOpen={onOpen} />
              ))}
            </div>
          )}
          {archivedGoals.length > 0 && (
            <div className="tp-goals-section">
              <div className="tp-section-head">{t.archivedGoals} · {archivedGoals.length}</div>
              {archivedGoals.map(goal => (
                <GoalCard key={goal.lead.slot.key} goal={goal} loops={loops} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface NewProjectResult {
  name: string
  directories: string[]
}

/** The New-project dialog: a name, ONE OR MORE directories, and a fixed
 *  default agent (kirocrew-team-lead). It NEVER guesses a directory — every
 *  path is typed by the person. */
function NewProjectDialog({
  busy,
  error,
  onCancel,
  onCreate,
}: {
  busy: boolean
  error: string
  onCancel: () => void
  onCreate: (r: NewProjectResult) => void
}) {
  const [name, setName] = useState('')
  const [dirs, setDirs] = useState<string[]>([''])
  const [localError, setLocalError] = useState('')

  const setDir = (i: number, v: string) => setDirs(ds => ds.map((d, j) => (j === i ? v : d)))
  const addDir = () => setDirs(ds => [...ds, ''])
  const removeDir = (i: number) => setDirs(ds => (ds.length === 1 ? ds : ds.filter((_, j) => j !== i)))

  const submit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setLocalError(t.nameRequired)
      return
    }
    setLocalError('')
    const directories = dirs.map(d => d.trim()).filter(Boolean)
    onCreate({ name: trimmedName, directories })
  }

  return (
    <div className="tp-overlay" role="dialog" aria-modal="true" aria-label={t.newProjectTitle}>
      <div className="tp-dialog">
        <div className="tp-dialog-head">
          <h2 className="tp-h2">{t.newProjectTitle}</h2>
          <Clickable className="tp-iconbtn" onClick={onCancel} aria-label={t.cancel}>
            <X size={16} aria-hidden="true" />
          </Clickable>
        </div>

        <label className="tp-field">
          <span className="tp-field-label">{t.projectName}</span>
          <SearchInput
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.projectNamePlaceholder}
            aria-label={t.projectName}
            autoFocus
          />
        </label>

        <div className="tp-field">
          <span className="tp-field-label">{t.directories}</span>
          <span className="tp-muted">{t.directoriesHint}</span>
          {dirs.map((d, i) => (
            <div className="tp-dir-row" key={i}>
              <SearchInput
                value={d}
                onChange={e => setDir(i, e.target.value)}
                placeholder={t.directoryPlaceholder}
                aria-label={`${t.directories} ${i + 1}`}
              />
              {dirs.length > 1 && (
                <Clickable className="tp-iconbtn" onClick={() => removeDir(i)} aria-label={t.removeDirectory}>
                  <X size={14} aria-hidden="true" />
                </Clickable>
              )}
            </div>
          ))}
          <Btn onClick={addDir}><Plus size={13} className="lucide-inline" aria-hidden="true" /> {t.addDirectory}</Btn>
        </div>

        <div className="tp-field">
          <span className="tp-field-label">{t.defaultAgentLabel}</span>
          <span className="tp-chip tp-agent-fixed">{DEFAULT_PROJECT_AGENT}</span>
          <span className="tp-muted">{t.defaultAgentHint(DEFAULT_PROJECT_AGENT)}</span>
        </div>

        {(localError || error) && (
          <p className="tp-form-error" role="alert">{localError || error}</p>
        )}

        <div className="tp-dialog-foot">
          <Btn onClick={onCancel}>{t.cancel}</Btn>
          <Btn primary onClick={submit} disabled={busy}>{busy ? t.creating : t.createProject}</Btn>
        </div>
      </div>
    </div>
  )
}

export default function TeamProjects() {
  const api = useAppApi()
  const qc = useQueryClient()
  const { active } = useAppInfo()
  const { openChat } = useChatLauncher()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const visible = active !== false

  const foldersQ = useQuery({
    queryKey: ['team-projects', 'folders'],
    queryFn: () => api.get<Folder[]>('/api/chat/folders'),
    refetchInterval: visible ? POLL_MS : false,
  })
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
  // Archived goals: GET /api/sessions lists every session file; a team-lead row
  // with no live slot is an archived goal. Fetched at the list cap (200) — the
  // page needs only the team-lead rows, which are few, and never paginates
  // (an older archived goal past 200 rows is an acceptable omission for a
  // read-only overview). Polled slower than the live surfaces: history changes
  // only when a session is archived or deleted, not every turn.
  const sessionsQ = useQuery({
    queryKey: ['team-projects', 'sessions'],
    queryFn: () => api.get<SessionsPage>('/api/sessions?limit=200'),
    refetchInterval: visible ? POLL_MS * 4 : false,
  })
  // A slots push is a cheap hint to refresh sooner than the poll.
  useAppEvents('slots', () => {
    void slotsQ.refetch()
    void foldersQ.refetch()
    void sessionsQ.refetch()
  })

  const createProject = useMutation({
    mutationFn: async ({ name, directories }: NewProjectResult) => {
      // Core stores ONE project_dir; additional directories ride in the
      // optional `extra_repos` field that sibling item C is adding to core.
      // Today's core ignores the extra field and keeps the first directory as
      // project_dir — the app degrades cleanly either way. The default agent is
      // always the team lead; the app never writes steering_dirs.
      const [first, ...rest] = directories
      const body: Record<string, unknown> = { name, default_agent: TEAM_LEAD_AGENT }
      if (first) body.project_dir = first
      if (rest.length) body.extra_repos = rest
      return api.post<Folder>('/api/chat/folders', body)
    },
    onSuccess: created => {
      setCreating(false)
      setCreateError('')
      if (created?.id) setSelected(created.id)
      void qc.invalidateQueries({ queryKey: ['team-projects', 'folders'] })
    },
    onError: (e: unknown) => {
      setCreateError(String((e as Error)?.message || e) || t.createProjectError)
    },
  })

  const loops = loopsQ.data?.loops ?? []
  const sessions: ArchivedSession[] = Array.isArray(sessionsQ.data?.sessions)
    ? (sessionsQ.data as SessionsPage).sessions
    : []
  const projects = useMemo(
    () =>
      buildFolderProjects(
        Array.isArray(foldersQ.data) ? foldersQ.data : [],
        Array.isArray(slotsQ.data) ? slotsQ.data : [],
        loops,
        sessions,
      ),
    [foldersQ.data, slotsQ.data, loops, sessions],
  )
  const shown = useMemo(() => {
    const q = filter.trim().toLocaleLowerCase()
    if (!q) return projects
    return projects.filter(p =>
      [p.folder.name, ...p.repos, p.defaultAgent, ...p.goals.map(goal => goal.lead.slot.title)]
        .some(v => (v || '').toLocaleLowerCase().includes(q)),
    )
  }, [projects, filter])
  const current = shown.find(p => p.folder.id === selected) ?? shown[0] ?? null

  const openSession = (slotKey: string) => openChat({ slotKey })

  // New goal: an UNSENT draft team-lead session filed in the project's folder.
  // openChat alone cannot do this — ChatLaunchOptions carries no folder — so we
  // create the slot through POST /api/chat/slots, which files it into the
  // folder AT BIRTH (core `api_chat_slot_create` reads `folder_id`) without
  // sending anything, then navigate into that slot. The person types and sends
  // the first turn themselves, which is exactly an unsent draft bound to the
  // team lead and sitting in the project. The app never re-files an existing
  // session: this is a brand-new slot it is creating.
  const newGoal = useMutation({
    mutationFn: (p: FolderProject) =>
      api.post<Slot>('/api/chat/slots', {
        agent: p.defaultAgent || TEAM_LEAD_AGENT,
        folder_id: p.folder.id,
      }),
    onSuccess: (slot, p) => {
      void qc.invalidateQueries({ queryKey: ['team-projects', 'slots'] })
      // Land the person in the freshly-created, still-empty session. autoSend
      // is irrelevant with no message — the draft is the empty composer.
      openChat({ slotKey: slot?.key, agent: p.defaultAgent || TEAM_LEAD_AGENT, autoSend: false })
    },
  })
  const openNewGoal = (p: FolderProject) => newGoal.mutate(p)
  // Folder settings — including the directory and the read-only instruction
  // dirs — live in the native chat sidebar, not an app-routable surface. The
  // app only READS folders here, so it hands the person off to the chat page
  // (where the folder and its settings dialog live) rather than editing the
  // folder itself; it must never write steering_dirs.
  const openSettings = (_p: FolderProject) => navigate('/chat')

  const loadError = foldersQ.error || slotsQ.error
  const loading = foldersQ.isLoading || slotsQ.isLoading

  return (
    <>
      <style>{css}</style>
      <PageHeader
        title={t.projects}
        subtitle={t.projectsSubtitle}
        actions={
          <Btn primary onClick={() => { setCreateError(''); setCreating(true) }}>
            <Plus size={14} className="lucide-inline" aria-hidden="true" /> {t.newProjectTitle}
          </Btn>
        }
      />
      <div className="tp-root">
        {loadError ? (
          <ErrorNotice title={t.foldersLoadError} message={String((loadError as Error).message || loadError)} askAgent />
        ) : loading ? (
          <div className="tp-loading"><Skeleton className="tp-skel" /><Skeleton className="tp-skel" /><Skeleton className="tp-skel" /></div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={28} />}
            title={t.projectsEmptyTitle}
            subtitle={t.projectsEmptyBody}
            action={<Btn primary onClick={() => { setCreateError(''); setCreating(true) }}>{t.newProjectTitle}</Btn>}
          />
        ) : (
          <div className="tp-split">
            <aside className="tp-list" aria-label={t.projects}>
              <SearchInput value={filter} onChange={e => setFilter(e.target.value)} placeholder={t.searchProjects} aria-label={t.searchProjects} />
              {shown.length === 0 && <p className="tp-muted tp-pad">{t.noProjectMatch}</p>}
              {shown.map(p => (
                <ProjectRow
                  key={p.folder.id}
                  p={p}
                  selected={current?.folder.id === p.folder.id}
                  onSelect={() => setSelected(p.folder.id)}
                />
              ))}
            </aside>
            <main className="tp-main">
              {current ? (
                <ProjectPage
                  key={current.folder.id}
                  p={current}
                  loops={loops}
                  onOpen={openSession}
                  onNewGoal={openNewGoal}
                  onSettings={openSettings}
                />
              ) : (
                <p className="tp-muted">{t.selectProjectHint}</p>
              )}
            </main>
          </div>
        )}
      </div>

      {creating && (
        <NewProjectDialog
          busy={createProject.isPending}
          error={createError}
          onCancel={() => { setCreating(false); setCreateError('') }}
          onCreate={r => createProject.mutate(r)}
        />
      )}
    </>
  )
}
