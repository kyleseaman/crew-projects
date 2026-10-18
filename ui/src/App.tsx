import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppApi, useAppEvents, useAppInfo, useChatLauncher, useNavigate, fmtRelative } from '@kirocrew/app-sdk'
import { Badge, Btn, Clickable, EmptyState, ErrorNotice, PageHeader, SearchInput, Skeleton } from '@kirocrew/app-sdk/ui'
import {
  BellRing,
  BookText,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderGit2,
  FolderKanban,
  GitPullRequest,
  Hash,
  Inbox,
  Library,
  PauseCircle,
  Package,
  Plus,
  Radar,
  RefreshCw,
  Satellite,
  Settings,
  Users,
  X,
} from 'lucide-react'
import {
  buildFolderProjects,
  buildInbox,
  buildSubscriptions,
  schedulesState,
  type ProjectSchedule,
  type ProjectSchedulesPage,
  type SchedulesState,
  dedupeProjectPrs,
  loopText,
  projectArtifacts,
  projectOutputFiles,
  projectSessionKeys,
  repoName,
  DEFAULT_PROJECT_AGENT,
  TEAM_LEAD_AGENT,
  type ArchivedSession,
  type ArtifactsPage,
  type Folder,
  type FolderProject,
  type InboxItem,
  type InboxKind,
  type LibraryArtifact,
  type Loop,
  type Member,
  type Project,
  type SessionDoc,
  type SessionsPage,
  type Slot,
  type SourceLink,
  type Status,
  type Subscription,
  type SubscriptionKind,
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
    : p.repos.length > 1
      // First repo plus a count, so the goals count after it never gets cut off.
      ? `${repoName(p.repos[0])} ${t.moreRepos(p.repos.length - 1)}`
      : p.repos.map(repoName).join('')
  const prs = dedupeProjectPrs(p.goals)
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

/** One artifact row in the Library. Opens the artifact in the host companion
 *  via openChat with the artifact slug — the app never materializes or mutates
 *  it, only links to it. */
function ArtifactRow({ a, onOpen }: { a: LibraryArtifact; onOpen: (slug: string) => void }) {
  const meta = [a.kind, a.session_title ? t.libraryBy(a.session_title) : '']
    .filter(Boolean)
    .join(' · ')
  return (
    <Clickable className="tp-lib-row" onClick={() => onOpen(a.slug)} aria-label={`${t.openArtifact}: ${a.name}`}>
      <Package size={14} className="tp-lib-ico" aria-hidden="true" />
      <div className="tp-lib-main">
        <span className="tp-lib-name">{a.name}</span>
        {meta && <span className="tp-muted tp-ellipsis">{meta}</span>}
      </div>
      {a.updated_at && <span className="tp-muted tp-nowrap">{when(a.updated_at)}</span>}
    </Clickable>
  )
}

/** One output-file row in the Library. A plain file the project's sessions
 *  produced (not saved as an artifact); read-only — the app shows it, never
 *  opens or materializes it. */
function FileRow({ d }: { d: SessionDoc }) {
  const meta = d.session_title ? t.libraryBy(d.session_title) : ''
  return (
    <div className="tp-lib-row tp-lib-row-static">
      <FileText size={14} className="tp-lib-ico" aria-hidden="true" />
      <div className="tp-lib-main">
        <span className="tp-lib-name" title={d.path}>{d.name}</span>
        {meta && <span className="tp-muted tp-ellipsis">{meta}</span>}
      </div>
      {d.updated_at && <span className="tp-muted tp-nowrap">{when(d.updated_at)}</span>}
    </div>
  )
}

/** The project's Library: artifacts and output files produced across its
 *  sessions, plus de-duplicated PRs. Artifacts/files come from the host via
 *  `chat_folder`-scoped and all-sessions queries respectively, filtered to the
 *  project's own sessions; the PRs come from the goals the project already
 *  carries. When the project has no folder (so the folder-scoped artifact
 *  listing can't be queried), the files view degrades to an unavailable state
 *  and the PRs still show. */
function LibrarySection({
  prs,
  artifacts,
  files,
  filesAvailable,
  loading,
  error,
  onOpenArtifact,
}: {
  prs: SourceLink[]
  artifacts: LibraryArtifact[]
  files: SessionDoc[]
  filesAvailable: boolean
  loading: boolean
  error: string
  onOpenArtifact: (slug: string) => void
}) {
  const hasAnything = prs.length > 0 || artifacts.length > 0 || files.length > 0

  return (
    <section className="tp-library" aria-label={t.library}>
      <div className="tp-lib-head">
        <Library size={14} aria-hidden="true" />
        <h3 className="tp-h3">{t.library}</h3>
        <span className="tp-muted">{t.librarySubtitle}</span>
      </div>

      {/* Files view: artifacts + output files. Unavailable when the project has
          no folder to scope the listing to; the host error degrades the same
          way, with the deduped PRs still shown below. */}
      {!filesAvailable ? (
        <div className="tp-lib-unavail" role="note">
          <strong className="tp-lib-unavail-title">{t.libraryFilesUnavailable}</strong>
          <p className="tp-muted">{t.libraryFilesUnavailableBody}</p>
        </div>
      ) : error ? (
        <div className="tp-lib-unavail" role="note">
          <strong className="tp-lib-unavail-title">{t.libraryLoadError}</strong>
          <p className="tp-muted">{error}</p>
        </div>
      ) : loading ? (
        <div className="tp-lib-loading"><Skeleton className="tp-lib-skel" /><Skeleton className="tp-lib-skel" /></div>
      ) : (
        <>
          <div className="tp-lib-group">
            <div className="tp-lib-grouphead">
              <Package size={12} aria-hidden="true" /> {t.libraryArtifacts}
              <span className="tp-muted">{t.libraryArtifactsCount(artifacts.length)}</span>
            </div>
            {artifacts.length === 0 ? (
              <p className="tp-muted tp-lib-empty">{t.libraryNoArtifacts}</p>
            ) : (
              <div className="tp-lib-list" role="list">
                {artifacts.map(a => <ArtifactRow key={a.slug} a={a} onOpen={onOpenArtifact} />)}
              </div>
            )}
          </div>

          <div className="tp-lib-group">
            <div className="tp-lib-grouphead">
              <FileText size={12} aria-hidden="true" /> {t.libraryFiles}
              <span className="tp-muted">{t.libraryFilesCount(files.length)}</span>
            </div>
            {files.length === 0 ? (
              <p className="tp-muted tp-lib-empty">{t.libraryNoFiles}</p>
            ) : (
              <div className="tp-lib-list" role="list">
                {files.map(d => <FileRow key={d.path} d={d} />)}
              </div>
            )}
          </div>
        </>
      )}

      {/* PRs always show — they come from the project's own sessions, so they
          survive the files-unavailable degrade. */}
      <div className="tp-lib-group">
        <div className="tp-lib-grouphead">
          <GitPullRequest size={12} aria-hidden="true" /> {t.libraryPrs}
          <span className="tp-muted">{t.libraryPrsCount(prs.length)}</span>
        </div>
        {prs.length === 0 ? (
          <p className="tp-muted tp-lib-empty">{t.libraryNoPrs}</p>
        ) : (
          <div className="tp-chips tp-lib-prs">
            {prs.map(l => <PrChip key={l.url} link={l} />)}
          </div>
        )}
      </div>

      {filesAvailable && !loading && !error && !hasAnything && (
        <p className="tp-muted tp-lib-empty">{t.libraryEmpty}</p>
      )}
    </section>
  )
}

/** The icon for each subscription kind. Status color lives on the icon only
 *  (no edge bars): a monitor and a channel link are informational, so both use
 *  the muted token — these are "what is watching", not "what needs you". */
const SUB_KIND_ICON: Record<SubscriptionKind, typeof Radar> = {
  monitor: Radar,
  slack: Hash,
}

/** One subscription row: a watcher armed on a project session. Opens the owning
 *  session on click — the app only shows the watch, it never arms or edits it. */
function SubscriptionRow({ sub, onOpen }: { sub: Subscription; onOpen: (key: string) => void }) {
  const Icon = SUB_KIND_ICON[sub.kind]
  const meta =
    sub.kind === 'monitor' ? t.subMonitorMeta(sub.detail, sub.progress) : t.subSlackMeta(sub.detail)
  return (
    <Clickable
      className="tp-subs-row"
      onClick={() => onOpen(sub.slotKey)}
      aria-label={t.subscriptionOpen(sub.sessionTitle || t.untitled)}
    >
      <Icon size={15} className="tp-sub-ico" aria-hidden="true" />
      <div className="tp-sub-main">
        <span className="tp-sub-name">{sub.sessionTitle || t.untitled}</span>
        {meta && <span className="tp-muted tp-ellipsis">{meta}</span>}
      </div>
      {sub.kind === 'monitor' && sub.nextFire && (
        <span className="tp-muted tp-nowrap">
          {t.subNextFire} {when(sub.nextFire)}
        </span>
      )}
    </Clickable>
  )
}

/** The project's Subscriptions panel: the ACTIVE monitor loops and Slack links
 *  on its sessions, plus an honest "schedules unavailable" note (the app cannot
 *  read the person's crons). "Add subscription" opens an UNSENT draft in the
 *  lead session — the agent sets the watch up with its own tools; the app
 *  creates no cron, loop or link itself. When nothing is watching and no lead
 *  exists to draft into, the panel shows a calm empty state. */
/** One cron schedule on a project session. Opens the owning session, where
 *  the person (or its agent) manages the job; the app never edits crons. */
function ScheduleRow({ job, onOpen }: { job: ProjectSchedule; onOpen: (key: string) => void }) {
  const paused = !job.enabled
  const owner = job.session_key ?? ''
  const meta = [
    job.schedule,
    job.next_run && !paused ? t.subScheduleNext(fmtRelative(job.next_run * 1000)) : '',
    job.last_status ? t.subScheduleLast(job.last_status) : '',
  ].filter(Boolean).join(' · ')
  const body = (
    <>
      <CalendarClock size={14} className="tp-sub-ico" aria-hidden="true" />
      <div className="tp-sub-main">
        <span className="tp-sub-name">{job.name}</span>
        <span className="tp-muted tp-ellipsis">{meta}</span>
      </div>
      {paused && <Badge variant="muted">{t.subSchedulePaused}</Badge>}
    </>
  )
  // A job whose owning session is gone still lists, but has nothing to open.
  return owner ? (
    <Clickable className="tp-subs-row" onClick={() => onOpen(owner)} aria-label={`${t.open}: ${job.name}`}>
      {body}
    </Clickable>
  ) : (
    <div className="tp-subs-row tp-subs-row-static" role="listitem">{body}</div>
  )
}

function SubscriptionsSection({
  subs,
  schedules,
  canAdd,
  onOpen,
  onAdd,
}: {
  subs: Subscription[]
  schedules: SchedulesState
  canAdd: boolean
  onOpen: (key: string) => void
  onAdd: () => void
}) {
  const monitors = subs.filter(s => s.kind === 'monitor')
  const slack = subs.filter(s => s.kind === 'slack')
  const scheduleRows = schedules.kind === 'ready' ? schedules.schedules : []
  const nothing = subs.length === 0 && scheduleRows.length === 0

  return (
    <section className="tp-subs" aria-label={t.subscriptions}>
      <div className="tp-subs-head">
        <Satellite size={14} aria-hidden="true" />
        <h3 className="tp-h3">{t.subscriptions}</h3>
        <span className="tp-muted tp-subs-sub">{t.subscriptionsSubtitle}</span>
        {canAdd && (
          <Btn onClick={onAdd}>
            <Plus size={13} className="lucide-inline" aria-hidden="true" /> {t.addSubscription}
          </Btn>
        )}
      </div>

      {nothing ? (
        <div className="tp-subs-empty" role="note">
          <span className="tp-subs-empty-title">{t.subscriptionsEmpty}</span>
          <span className="tp-muted">{t.subscriptionsEmptyHint}</span>
        </div>
      ) : (
        <>
          {monitors.length > 0 && (
            <div className="tp-subs-group">
              <div className="tp-subs-grouphead">
                <Radar size={12} aria-hidden="true" /> {t.subMonitors}
                <span className="tp-muted">{t.subMonitorsCount(monitors.length)}</span>
              </div>
              <div className="tp-subs-list" role="list">
                {monitors.map(s => (
                  <SubscriptionRow key={`m-${s.slotKey}`} sub={s} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}
          {slack.length > 0 && (
            <div className="tp-subs-group">
              <div className="tp-subs-grouphead">
                <Hash size={12} aria-hidden="true" /> {t.subSlack}
                <span className="tp-muted">{t.subSlackCount(slack.length)}</span>
              </div>
              <div className="tp-subs-list" role="list">
                {slack.map(s => (
                  <SubscriptionRow key={`s-${s.slotKey}`} sub={s} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Schedules come from core's reduced, read-only /api/project-schedules
          route. On a gateway without it (or without the grant) the group keeps
          an honest unavailable note rather than an empty "no schedules". */}
      <div className="tp-subs-group">
        <div className="tp-subs-grouphead">
          <CalendarClock size={12} aria-hidden="true" /> {t.subSchedules}
          {schedules.kind === 'ready' && (
            <span className="tp-muted">{t.subSchedulesCount(scheduleRows.length)}</span>
          )}
        </div>
        {schedules.kind === 'unavailable' && (
          <div className="tp-subs-unavail" role="note">
            <strong className="tp-subs-unavail-title">{t.subSchedulesUnavailable}</strong>
            <p className="tp-muted">{t.subSchedulesUnavailableBody}</p>
          </div>
        )}
        {schedules.kind === 'ready' && scheduleRows.length === 0 && !nothing && (
          <p className="tp-muted tp-subs-none">{t.subSchedulesNone}</p>
        )}
        {scheduleRows.length > 0 && (
          <div className="tp-subs-list" role="list">
            {scheduleRows.map(j => <ScheduleRow key={j.id} job={j} onOpen={onOpen} />)}
          </div>
        )}
      </div>
    </section>
  )
}

/** The project page: the folder header (repos, default agent, read-only
 *  instructions + a settings link, or a Set-directory prompt), then every
 *  team rollup attached to the project, and the project's Library. */
function ProjectPage({
  p,
  loops,
  library,
  subscriptions,
  schedules,
  onOpen,
  onOpenArtifact,
  onNewGoal,
  onSettings,
  onAddSubscription,
}: {
  p: FolderProject
  loops: Loop[]
  library: LibraryData
  subscriptions: Subscription[]
  schedules: SchedulesState
  onOpen: (key: string) => void
  onOpenArtifact: (slug: string) => void
  onNewGoal: (p: FolderProject) => void
  onSettings: (p: FolderProject) => void
  onAddSubscription: (p: FolderProject) => void
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

      <SubscriptionsSection
        subs={subscriptions}
        schedules={schedules}
        // Add-subscription drafts into the project's lead session, so it needs a
        // live lead to open. A project with only archived goals (no live lead)
        // has no session to seed the draft into, so the button is hidden there.
        canAdd={liveGoals.length > 0}
        onOpen={onOpen}
        onAdd={() => onAddSubscription(p)}
      />

      <LibrarySection
        prs={library.prs}
        artifacts={library.artifacts}
        files={library.files}
        filesAvailable={library.filesAvailable}
        loading={library.loading}
        error={library.error}
        onOpenArtifact={onOpenArtifact}
      />
    </div>
  )
}

/** Everything the Library section needs for one project, derived in the
 *  top-level component from the host queries. */
interface LibraryData {
  prs: SourceLink[]
  artifacts: LibraryArtifact[]
  files: SessionDoc[]
  /** False when the project has no folder id to scope the artifact listing to
   *  — the files view then shows its unavailable state. */
  filesAvailable: boolean
  loading: boolean
  error: string
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

/** The icon and badge variant for each inbox kind. A pending approval and a
 *  needs-input both use the warm `warn` token (a decision the person owes); a
 *  stalled session uses the `err` token (something stopped). */
const INBOX_KIND: Record<InboxKind, { Icon: typeof BellRing; variant: 'warn' | 'err' }> = {
  approval: { Icon: BellRing, variant: 'warn' },
  needs_input: { Icon: CircleHelp, variant: 'warn' },
  stalled: { Icon: PauseCircle, variant: 'err' },
}

/** One row in the Waiting-on-you inbox: the project it belongs to, the session
 *  and what it waits for, opening that session on click. */
function InboxRow({ item, onOpen }: { item: InboxItem; onOpen: (key: string) => void }) {
  const { Icon, variant } = INBOX_KIND[item.kind]
  return (
    <Clickable
      className={`tp-inbox-row tp-inbox-${item.kind}`}
      onClick={() => onOpen(item.slotKey)}
      aria-label={t.inboxOpen(item.projectName, item.sessionTitle || t.untitled)}
    >
      <Icon size={15} className="tp-inbox-ico" aria-hidden="true" />
      <div className="tp-inbox-main">
        <div className="tp-row-top">
          <span className="tp-inbox-session">{item.sessionTitle || t.untitled}</span>
          <Badge variant={variant}>{t.inboxBadge[item.kind]}</Badge>
        </div>
        <div className="tp-muted tp-ellipsis">
          {item.projectName} · {t.inboxWaiting[item.kind]}
        </div>
        {item.lastMessage && <div className="tp-muted tp-ellipsis tp-inbox-msg">{item.lastMessage}</div>}
      </div>
      {item.updated && <span className="tp-muted tp-nowrap">{when(item.updated)}</span>}
    </Clickable>
  )
}

/** The Waiting-on-you inbox: a cross-project roll-up of every session that
 *  needs the person, rendered at the TOP of the page. Compact when empty (a
 *  calm one-line note, not an error, and it does not push the page down). */
function InboxBar({ items, onOpen }: { items: InboxItem[]; onOpen: (key: string) => void }) {
  if (items.length === 0) {
    return (
      <section className="tp-inbox tp-inbox-empty" aria-label={t.inboxTitle}>
        <CheckCircle2 size={15} className="tp-inbox-empty-ico" aria-hidden="true" />
        <div className="tp-inbox-empty-body">
          <span className="tp-inbox-empty-title">{t.inboxEmpty}</span>
          <span className="tp-muted">{t.inboxEmptyHint}</span>
        </div>
      </section>
    )
  }
  return (
    <section className="tp-inbox" aria-label={t.inboxTitle}>
      <div className="tp-inbox-head">
        <Inbox size={15} aria-hidden="true" />
        <h2 className="tp-inbox-title">{t.inboxTitle}</h2>
        <span className="tp-muted">{t.inboxCount(items.length)}</span>
      </div>
      <div className="tp-inbox-list" role="list">
        {items.map(item => (
          <div role="listitem" key={item.slotKey}>
            <InboxRow item={item} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ProjectHub() {
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
    queryKey: ['project-hub', 'folders'],
    queryFn: () => api.get<Folder[]>('/api/chat/folders'),
    refetchInterval: visible ? POLL_MS : false,
  })
  const slotsQ = useQuery({
    queryKey: ['project-hub', 'slots'],
    queryFn: () => api.get<Slot[]>('/api/chat/slots'),
    refetchInterval: visible ? POLL_MS : false,
  })
  const loopsQ = useQuery({
    queryKey: ['project-hub', 'loops'],
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
    queryKey: ['project-hub', 'sessions'],
    queryFn: () => api.get<SessionsPage>('/api/sessions?limit=200'),
    refetchInterval: visible ? POLL_MS * 4 : false,
  })
  // Output files across EVERY session (the host's session-docs firehose; no
  // ?session scope). Filtered to the selected project's own sessions in the
  // client via projectSessionKeys — the endpoint has no folder scope, so one
  // unscoped fetch + a client filter is cheaper than one call per session.
  // Polled on the slow cadence: a document file changes only when an agent
  // writes one, not every turn.
  const docsQ = useQuery({
    queryKey: ['project-hub', 'session-docs'],
    queryFn: () => api.get<{ docs: SessionDoc[] }>('/api/artifacts/session-docs'),
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
      void qc.invalidateQueries({ queryKey: ['project-hub', 'folders'] })
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
  // The Waiting-on-you inbox rolls up EVERY project (not the filtered list) —
  // what needs you must not be hidden by a search filter. Built from the same
  // projects, so a session enters it exactly once.
  const inbox = useMemo(() => buildInbox(projects), [projects])

  // Library artifacts for the CURRENT project: the host resolves the folder
  // subtree server-side from ?chat_folder, returning every artifact its chats
  // (open or archived) touched. Keyed by the folder id so switching projects
  // refetches; disabled when there is no project selected. A project with a
  // folder id always has one here (projects ARE folders), so the only
  // unavailable path is a defensive empty id.
  const currentFolderId = current?.folder.id ?? ''
  const artifactsQ = useQuery({
    queryKey: ['project-hub', 'artifacts', currentFolderId],
    queryFn: () =>
      api.get<ArtifactsPage>(`/api/artifacts?chat_folder=${encodeURIComponent(currentFolderId)}`),
    enabled: visible && currentFolderId !== '',
    refetchInterval: visible ? POLL_MS * 4 : false,
  })

  const library: LibraryData = useMemo(() => {
    if (!current) {
      return { prs: [], artifacts: [], files: [], filesAvailable: false, loading: false, error: '' }
    }
    const ownedKeys = projectSessionKeys(current.goals)
    const prs = dedupeProjectPrs(current.goals)
    const filesAvailable = currentFolderId !== ''
    const allDocs = Array.isArray(docsQ.data?.docs) ? (docsQ.data as { docs: SessionDoc[] }).docs : []
    const allArtifacts = Array.isArray(artifactsQ.data?.artifacts)
      ? (artifactsQ.data as ArtifactsPage).artifacts
      : []
    const err = artifactsQ.error || docsQ.error
    return {
      prs,
      artifacts: projectArtifacts(allArtifacts),
      files: projectOutputFiles(allDocs, ownedKeys),
      filesAvailable,
      loading: filesAvailable && (artifactsQ.isLoading || docsQ.isLoading),
      error: err ? String((err as Error).message || err) : '',
    }
  }, [current, currentFolderId, artifactsQ.data, artifactsQ.error, artifactsQ.isLoading, docsQ.data, docsQ.error, docsQ.isLoading])

  // Subscriptions for the CURRENT project: the active monitor loops and
  // Slack-linked sessions among the project's own sessions. Joined from data
  // the app already holds — the loop list (/api/autonudge) and the slot list
  // (/api/chat/slots, which carries slack_linked/slack_channel) — so it needs
  // no new fetch. Crons are not joined: the app cannot read the person's crons
  // (/api/crons scopes a GET to the calling app's own jobs), so the panel shows
  // an honest unavailable row for schedules rather than a faked or empty list.
  const slotsByKey = useMemo(() => {
    const m = new Map<string, Slot>()
    for (const s of Array.isArray(slotsQ.data) ? slotsQ.data : []) m.set(s.key, s)
    return m
  }, [slotsQ.data])
  const subscriptions = useMemo(
    () => (current ? buildSubscriptions(current.goals, slotsByKey, loops) : []),
    [current, slotsByKey, loops],
  )

  // Cron schedules for the CURRENT project from core's reduced, read-only
  // /api/project-schedules/{folder_id}. A gateway without the route (404) or an
  // install without the grant (403) errors, which schedulesState maps to the
  // honest unavailable note. No retry: an absent route will not appear.
  const schedulesQ = useQuery({
    queryKey: ['project-hub', 'schedules', currentFolderId],
    queryFn: () =>
      api.get<ProjectSchedulesPage>(`/api/project-schedules/${encodeURIComponent(currentFolderId)}`),
    enabled: visible && currentFolderId !== '',
    refetchInterval: visible ? POLL_MS * 6 : false,
    retry: false,
  })
  const schedules = useMemo(
    () => schedulesState(schedulesQ.data, schedulesQ.error, schedulesQ.isLoading),
    [schedulesQ.data, schedulesQ.error, schedulesQ.isLoading],
  )

  const openSession = (slotKey: string) => openChat({ slotKey })
  // Open an artifact at the host's read-only detail page (/artifacts/<slug>).
  // The app only LINKS to it — it never materializes, mutates or re-files it,
  // and sends no message.
  const openArtifact = (slug: string) => navigate(`/artifacts/${encodeURIComponent(slug)}`)

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
      void qc.invalidateQueries({ queryKey: ['project-hub', 'slots'] })
      // Land the person in the freshly-created, still-empty session. autoSend
      // is irrelevant with no message — the draft is the empty composer.
      openChat({ slotKey: slot?.key, agent: p.defaultAgent || TEAM_LEAD_AGENT, autoSend: false })
    },
  })
  const openNewGoal = (p: FolderProject) => newGoal.mutate(p)

  // Add subscription: open an UNSENT draft in the project's LEAD session,
  // pre-filled with a prompt the person edits and sends. The app arms NOTHING
  // itself — it never creates a cron, a monitor or a channel link; the agent
  // sets the watch up with its own tools once the person sends the turn. The
  // lead is the project's most-recent live goal lead (the one the person most
  // likely means); openChat with autoSend:false drops the draft into its
  // composer without sending. Hidden by the UI when the project has no live
  // lead, so `lead` is always present here.
  const addSubscription = (p: FolderProject) => {
    const lead = p.goals.find(g => !g.archived)?.lead.slot
    if (!lead?.key) return
    openChat({
      slotKey: lead.key,
      agent: lead.agent || p.defaultAgent || TEAM_LEAD_AGENT,
      message: t.addSubscriptionDraft,
      autoSend: false,
    })
  }
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
          <>
          <InboxBar items={inbox} onOpen={openSession} />
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
                  library={library}
                  subscriptions={subscriptions}
                  schedules={schedules}
                  onOpen={openSession}
                  onOpenArtifact={openArtifact}
                  onNewGoal={openNewGoal}
                  onSettings={openSettings}
                  onAddSubscription={addSubscription}
                />
              ) : (
                <p className="tp-muted">{t.selectProjectHint}</p>
              )}
            </main>
          </div>
          </>
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
