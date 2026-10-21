import { useMemo, useState, type CSSProperties } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { STATUS_QUERY_KEY } from './TrustControl'
import { useAppApi, useAppEvents, useAppInfo, useChatLauncher, useNavigate, fmtRelative } from '@kirocrew/app-sdk'
import { Badge, Btn, Clickable, EmptyState, ErrorNotice, PageHeader, SearchInput } from '@kirocrew/app-sdk/ui'
import {
  BellRing,
  BookText,
  CalendarClock,
  FileText,
  FolderGit2,
  FolderKanban,
  Hash,
  Library,
  Package,
  Plus,
  Radar,
  Satellite,
  Settings,
  Users,
  X,
} from 'lucide-react'
import {
  buildFolderProjects,
  buildSubscriptions,
  schedulesState,
  type ProjectSchedule,
  type ProjectSchedulesPage,
  type SchedulesState,
  dedupeProjectPrs,
  projectArtifacts,
  projectOutputFiles,
  projectSessionKeys,
  repoName,
  DEFAULT_PROJECT_AGENT,
  newGoalLaunch,
  newGoalRequest,
  newProjectRequest,
  TEAM_LEAD_AGENT,
  type ArchivedSession,
  type ArtifactsPage,
  type BoardSource,
  type Folder,
  type FolderProject,
  type LibraryArtifact,
  type Loop,
  type SessionDoc,
  type SessionsPage,
  type Slot,
  type Subscription,
  type SubscriptionKind,
} from './model'
import { PrChip, POLL_MS, StatusDot, when } from './parts'
import { buildOverview } from './overview'
import { DOCS_TIMEOUT_MS, groupState, withTimeout, type GroupState } from './library'
import { t } from './strings'
import { css } from './styles'
import { Workspace } from './Workspace'
import { ColumnGrabber, usePanelLayout } from './Layout'
import { PageSkeleton, ScheduleRowsSkeleton } from './Skeletons'

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

/** The project's Library: FILES only, the artifacts and output files produced
 *  across its sessions (pull requests are on the Overview tab). Artifacts come
 *  from the folder-scoped artifact listing; output files from the host's
 *  all-sessions session-docs scan, filtered to the project's own sessions.
 *  That scan reads every session's history, so it is slow on a large install
 *  (about 13 s over ~530 sessions); each group therefore shows its own
 *  one-line loading note, its own error, and its rows as soon as they land.
 *  When the project has no folder id, both groups degrade to one
 *  unavailable note. */
export function LibrarySection({
  artifacts,
  files,
  filesAvailable,
  artifactsState,
  filesState,
  onOpenArtifact,
  compact = false,
}: {
  artifacts: LibraryArtifact[]
  files: SessionDoc[]
  filesAvailable: boolean
  artifactsState: GroupState
  filesState: GroupState
  onOpenArtifact: (slug: string) => void
  /** Inside a tab whose label already names it. */
  compact?: boolean
}) {
  const settled = !artifactsState.loading && !filesState.loading && !artifactsState.error && !filesState.error
  const empty = settled && artifacts.length === 0 && files.length === 0

  return (
    <section className="tp-library" aria-label={t.library}>
      {compact ? (
        <p className="tp-muted tp-fold-sub">{t.librarySubtitle}</p>
      ) : (
        <div className="tp-lib-head">
          <Library size={14} aria-hidden="true" />
          <h3 className="tp-h3">{t.library}</h3>
          <span className="tp-muted">{t.librarySubtitle}</span>
        </div>
      )}

      {!filesAvailable ? (
        <div className="tp-lib-unavail" role="note">
          <strong className="tp-lib-unavail-title">{t.libraryFilesUnavailable}</strong>
          <p className="tp-muted">{t.libraryFilesUnavailableBody}</p>
        </div>
      ) : empty ? (
        <p className="tp-muted tp-lib-empty" role="note">{t.libraryEmpty}</p>
      ) : (
        <>
          <div className="tp-lib-group">
            <div className="tp-lib-grouphead">
              <Package size={12} aria-hidden="true" /> {t.libraryArtifacts}
              {!artifactsState.loading && !artifactsState.error && (
                <span className="tp-muted">{t.libraryArtifactsCount(artifacts.length)}</span>
              )}
            </div>
            {artifactsState.error ? (
              <p className="tp-muted tp-lib-empty" role="note">{t.libraryArtifactsError}</p>
            ) : artifactsState.loading ? (
              <p className="tp-muted tp-lib-empty" role="status">{t.libraryLoadingArtifacts}</p>
            ) : artifacts.length === 0 ? (
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
              {!filesState.loading && !filesState.error && (
                <span className="tp-muted">{t.libraryFilesCount(files.length)}</span>
              )}
            </div>
            {filesState.error ? (
              <p className="tp-muted tp-lib-empty" role="note">{t.libraryFilesError}</p>
            ) : filesState.loading ? (
              <p className="tp-muted tp-lib-empty" role="status">{t.libraryLoadingFiles}</p>
            ) : files.length === 0 ? (
              <p className="tp-muted tp-lib-empty">{t.libraryNoFiles}</p>
            ) : (
              <div className="tp-lib-list" role="list">
                {files.map(d => <FileRow key={d.path} d={d} />)}
              </div>
            )}
          </div>
        </>
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

export function SubscriptionsSection({
  subs,
  schedules,
  canAdd,
  onOpen,
  onAdd,
  compact = false,
}: {
  subs: Subscription[]
  schedules: SchedulesState
  canAdd: boolean
  onOpen: (key: string) => void
  onAdd: () => void
  /** Inside a collapsed side section whose summary already names it. */
  compact?: boolean
}) {
  const monitors = subs.filter(s => s.kind === 'monitor')
  const slack = subs.filter(s => s.kind === 'slack')
  const scheduleRows = schedules.kind === 'ready' ? schedules.schedules : []
  // Never "no subscriptions" while the schedules read is still out: that
  // empty note would show and then vanish when the schedules land.
  const nothing = subs.length === 0 && scheduleRows.length === 0 && schedules.kind !== 'loading'

  return (
    <section className="tp-subs" aria-label={t.subscriptions}>
      <div className="tp-subs-head">
        {!compact && <Satellite size={14} aria-hidden="true" />}
        {!compact && <h3 className="tp-h3">{t.subscriptions}</h3>}
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
        {schedules.kind === 'loading' && (
          <div role="status" aria-label={t.schedulesLoading}><ScheduleRowsSkeleton rows={2} /></div>
        )}
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

/** The side panel's Project, Subscriptions and Library tabs: the folder's
 *  details (repositories, default agent, read-only instructions, Folder
 *  settings), what watches on its behalf, and its Library. Each fills its tab
 *  (Layout.tsx's SidePanel); none is stacked under the goals any more. */
function projectPanes({
  p,
  library,
  subscriptions,
  schedules,
  onOpen,
  onOpenArtifact,
  onSettings,
  onAddSubscription,
}: {
  p: FolderProject
  library: LibraryData
  subscriptions: Subscription[]
  schedules: SchedulesState
  onOpen: (key: string) => void
  onOpenArtifact: (slug: string) => void
  onSettings: () => void
  onAddSubscription: () => void
}) {
  const hasLiveGoal = p.goals.some(g => !g.archived)
  return {
    project: (
      <section className="tp-tabsec" aria-label={t.projectDetails}>
        {!p.needsDir && (
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
            <div className="tp-meta-item">
              <dt className="tp-meta-label">
                <BookText size={12} aria-hidden="true" /> {t.instructions}
              </dt>
              <dd className="tp-meta-val">
                <span className="tp-muted tp-ro">{t.instructionsReadOnly}</span>
                {p.instructions.length === 0 ? (
                  <span className="tp-muted tp-block">{t.noInstructions}</span>
                ) : (
                  <ul className="tp-instr">
                    {p.instructions.map(d => <li key={d} className="tp-chip tp-instr-item" title={d}>{d}</li>)}
                  </ul>
                )}
              </dd>
            </div>
          </dl>
        )}
        {p.needsDir && <p className="tp-muted tp-fold-sub">{t.setDirectoryBody}</p>}
        <Btn className="tp-btn-ghost" onClick={onSettings}>
          <Settings size={13} className="lucide-inline" aria-hidden="true" /> {t.folderSettings}
        </Btn>
      </section>
    ),
    subscriptions: (
      <section className="tp-tabsec" aria-label={t.subscriptions}>
        <SubscriptionsSection
          compact
          subs={subscriptions}
          schedules={schedules}
          // Add-subscription drafts into the project's lead session, so it
          // needs a live lead to open; hidden when every goal is archived.
          canAdd={hasLiveGoal}
          onOpen={onOpen}
          onAdd={onAddSubscription}
        />
      </section>
    ),
    library: (
      <section className="tp-tabsec" aria-label={t.library}>
        <LibrarySection
          compact
          artifacts={library.artifacts}
          files={library.files}
          filesAvailable={library.filesAvailable}
          artifactsState={library.artifactsState}
          filesState={library.filesState}
          onOpenArtifact={onOpenArtifact}
        />
      </section>
    ),
  }
}

/** Everything the Library section needs for one project, derived in the
 *  top-level component from the host queries. */
interface LibraryData {
  artifacts: LibraryArtifact[]
  files: SessionDoc[]
  /** False when the project has no folder id to scope the artifact listing to
   *  — the files view then shows its unavailable state. */
  filesAvailable: boolean
  artifactsState: GroupState
  filesState: GroupState
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

/** The page header's one-line "N need you" chip: the only trace above the
 *  columns of sessions waiting on the person. The rows themselves live in the
 *  Overview tab's Needs you section; the chip takes the person there. Never
 *  more than one line, so the columns below keep the viewport's height. */
export function NeedsChip({ count, onOpen }: { count: number; onOpen: () => void }) {
  if (count <= 0) return null
  return (
    <button type="button" className="tp-needschip" onClick={onOpen} aria-label={t.needsChipLabel(count)}>
      <BellRing size={13} aria-hidden="true" /> {count}<span className="tp-needschip-word">{t.needsChipWord(count)}</span>
    </button>
  )
}

/** `boardSource` reads a goal lead's work ledger for the right column's task
 *  board. The host mounts the app with no props, and today no host route serves
 *  a session's work ledger to an app, so in production it is absent and each
 *  goal shows its sessions tree. The dev harness passes a fixture source. */
export default function ProjectHub({ boardSource }: { boardSource?: BoardSource } = {}) {
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
  const layout = usePanelLayout()

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
  // The host answers it by reading EVERY session's history (about 13 s on a
  // ~530-session install), so it is polled once a minute, never retried in a
  // burst, and given up on after DOCS_TIMEOUT_MS: the Library's files group
  // then says the scan did not finish instead of sitting on a placeholder.
  const docsQ = useQuery({
    queryKey: ['project-hub', 'session-docs'],
    queryFn: ({ signal }) =>
      api.get<{ docs: SessionDoc[] }>('/api/artifacts/session-docs', { signal: withTimeout(signal, DOCS_TIMEOUT_MS) }),
    enabled: visible,
    refetchInterval: visible ? 60_000 : false,
    staleTime: 30_000,
    retry: false,
  })
  // A slots push is a cheap hint to refresh sooner than the poll.
  useAppEvents('slots', () => {
    void slotsQ.refetch()
    void foldersQ.refetch()
    void sessionsQ.refetch()
    // The approval-mode picker's host status read (global YOLO): a mode
    // changed in the dashboard pushes a slots frame, so the picker follows it.
    void qc.invalidateQueries({ queryKey: STATUS_QUERY_KEY })
  })

  const createProject = useMutation({
    mutationFn: async ({ name, directories }: NewProjectResult) => {
      // Core stores ONE project_dir; additional directories ride in the
      // optional `extra_repos` field that sibling item C is adding to core.
      // Today's core ignores the extra field and keeps the first directory as
      // project_dir — the app degrades cleanly either way. The default agent is
      // always the team lead; the app never writes steering_dirs.
      return api.post<Folder>('/api/chat/folders', newProjectRequest(name, directories))
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
  // Sessions waiting on the person, per project, counted by the SAME
  // derivation the Overview tab's Needs you list draws from, so the header
  // chip and the list never disagree. Over EVERY project (not the filtered
  // list): what needs you must not be hidden by a search filter.
  const needsByProject = useMemo(
    () => projects.map(p => ({ id: p.folder.id, n: buildOverview(p).needs.length })).filter(x => x.n > 0),
    [projects],
  )
  const needsTotal = needsByProject.reduce((sum, x) => sum + x.n, 0)

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
    const idle: GroupState = { loading: false, error: '' }
    if (!current) {
      return { artifacts: [], files: [], filesAvailable: false, artifactsState: idle, filesState: idle }
    }
    const ownedKeys = projectSessionKeys(current.goals)
    const filesAvailable = currentFolderId !== ''
    const allDocs = Array.isArray(docsQ.data?.docs) ? (docsQ.data as { docs: SessionDoc[] }).docs : []
    const allArtifacts = Array.isArray(artifactsQ.data?.artifacts)
      ? (artifactsQ.data as ArtifactsPage).artifacts
      : []
    return {
      artifacts: projectArtifacts(allArtifacts),
      files: projectOutputFiles(allDocs, ownedKeys),
      filesAvailable,
      // Each group from its OWN query: rows already received keep showing
      // through a later failed refresh, and a first load that failed says so.
      artifactsState: groupState(artifactsQ.data, artifactsQ.error, artifactsQ.isLoading),
      filesState: groupState(docsQ.data, docsQ.error, docsQ.isLoading),
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
  // The header chip: show the Overview tab of the current project when it has
  // sessions waiting, else of the first project that does, and reopen the
  // side panel if it was collapsed.
  const openNeeds = () => {
    const target = needsByProject.find(x => x.id === current?.folder.id) ?? needsByProject[0]
    if (!target) return
    if (!shown.some(p => p.folder.id === target.id)) setFilter('')
    setSelected(target.id)
    layout.setTab('overview')
    if (layout.prefs.collapsed) layout.toggleCollapsed()
  }
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
      api.post<Slot>('/api/chat/slots', newGoalRequest(p)),
    onSuccess: slot => {
      void qc.invalidateQueries({ queryKey: ['project-hub', 'slots'] })
      // Land the person in the freshly-created, still-empty session. autoSend
      // is irrelevant with no message — the draft is the empty composer.
      openChat(newGoalLaunch(slot?.key))
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
      // An existing lead keeps its own agent; never the folder default.
      agent: lead.agent || TEAM_LEAD_AGENT,
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
  // `isPending` = no answer yet (in flight, paused offline, or retrying). The
  // loops read is in the gate too: without it every lead first paints Idle
  // with no loop line and then flips to Working once loops land. A failed
  // loops read is an answer (no loops), so it never holds the page.
  const loading = foldersQ.isPending || slotsQ.isPending || loopsQ.isPending

  return (
    <>
      <style>{css}</style>
      <PageHeader
        title={t.projects}
        subtitle={t.projectsSubtitle}
        actions={
          <>
          <NeedsChip count={needsTotal} onOpen={openNeeds} />
          <Btn primary onClick={() => { setCreateError(''); setCreating(true) }}>
            <Plus size={14} className="lucide-inline" aria-hidden="true" /> {t.newProjectTitle}
          </Btn>
          </>
        }
      />
      <div className="tp-root">
        {loadError ? (
          <ErrorNotice title={t.foldersLoadError} message={String((loadError as Error).message || loadError)} askAgent />
        ) : loading ? (
          // The loaded grid's own columns, widths and open tab, so the page
          // does not jump when the data arrives.
          <PageSkeleton
            widths={layout.widths}
            collapsed={layout.prefs.collapsed}
            tab={layout.prefs.tab}
            onTab={layout.setTab}
            onToggleCollapsed={layout.toggleCollapsed}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={28} />}
            title={t.projectsEmptyTitle}
            subtitle={t.projectsEmptyBody}
            // Secondary: the page header's "New project" is already the
            // primary in this viewport.
            action={<Btn onClick={() => { setCreateError(''); setCreating(true) }}>{t.newProjectTitle}</Btn>}
          />
        ) : (
          <div
            ref={layout.splitRefCb}
            className={`tp-split${current && layout.prefs.collapsed ? ' tp-split-collapsed' : ''}${layout.dragging ? ' tp-split-resizing' : ''}`}
            style={{ '--tp-col-l': `${layout.widths.left}px`, '--tp-col-r': `${layout.widths.right}px` } as CSSProperties}
          >
            <ColumnGrabber side="left" layout={layout} />
            {current && !layout.prefs.collapsed && <ColumnGrabber side="right" layout={layout} />}
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
            {current ? (
              <Workspace
                key={current.folder.id}
                p={current}
                slotsByKey={slotsByKey}
                boardSource={boardSource}
                visible={visible}
                onOpenFull={openSession}
                onNewGoal={() => openNewGoal(current)}
                onSettings={() => openSettings(current)}
                onOpenArtifact={openArtifact}
                tab={layout.prefs.tab}
                onTab={layout.setTab}
                collapsed={layout.prefs.collapsed}
                onToggleCollapsed={layout.toggleCollapsed}
                panes={projectPanes({
                  p: current,
                  library,
                  subscriptions,
                  schedules,
                  onOpen: openSession,
                  onOpenArtifact: openArtifact,
                  onSettings: () => openSettings(current),
                  onAddSubscription: () => addSubscription(current),
                })}
              />
            ) : (
              <p className="tp-muted tp-pad">{t.selectProjectHint}</p>
            )}
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
