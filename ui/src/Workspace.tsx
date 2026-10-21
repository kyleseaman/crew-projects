/**
 * The project's three-column workspace (columns 2 and 3; the project list in
 * App.tsx is column 1):
 *
 *   MIDDLE  the selected goal's lead chat (the host ChatEmbed), full height, or
 *           one of the goal's sessions opened in its place.
 *   RIGHT   a tabbed side panel (Layout.tsx's SidePanel): Overview (the
 *           project summary, Overview.tsx; the default), Work (a goal picker,
 *           then the selected goal's task board or full sessions tree),
 *           Project, Subscriptions and Library, each filling the column with
 *           its own scroll. It collapses, and the middle header
 *           then carries the toggle that reopens it.
 *
 * Selection lives in `workspaceReducer` (model.ts) so the switching rules are
 * pure and tested without a DOM.
 */
import { useEffect, useId, useMemo, useReducer, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatEmbed } from '@kirocrew/app-sdk'
import { Badge, Btn } from '@kirocrew/app-sdk/ui'
import { Archive, ArrowLeft, BellRing, FolderKanban, MessageSquare, Plus } from 'lucide-react'
import { TrustControl } from './TrustControl'
import { SubAttentionChips, subAttentionText } from './SubAttention'
import {
  buildTaskBoard,
  chatAgentName,
  ledgerHasData,
  middleTarget,
  resolveGoal,
  selectedGoalKey,
  sessionTone,
  sessionTree,
  slotStatus,
  workspaceReducer,
  TEAM_LEAD_AGENT,
  type BoardSource,
  type FolderProject,
  type LedgerRead,
  type Member,
  type NeedsYouRow,
  type Project,
  type SessionNode,
  type SessionTone,
  type Slot,
  type TaskBoard,
  type TaskRow,
  type WorkspaceState,
} from './model'
import { LoopLine, POLL_MS, STATUS_VARIANT, when } from './parts'
import { OverviewPane } from './Overview'
import { PanelToggle, SidePanel } from './Layout'
import type { SideTab } from './layout'
import { t } from './strings'

const SESSION_TONE_VARIANT: Record<SessionTone, 'ok' | 'err' | 'warn' | 'aim' | 'muted'> = {
  done: 'ok',
  working: 'aim',
  needs_approval: 'warn',
  needs_you: 'warn',
  stalled: 'err',
  idle: 'muted',
}

/** The small header chip that replaced the dashed Set-directory banner. It
 *  opens the same Set-directory action (folder settings). */
export function DirChip({ onSet }: { onSet: () => void }) {
  return (
    <button type="button" className="tp-dirchip" onClick={onSet} aria-label={t.dirChipLabel} title={t.setDirectoryBody}>
      {t.dirChip} · <span className="tp-dirchip-act">{t.dirChipSet}</span>
    </button>
  )
}

/** The middle column: a header naming what the chat is bound to, then the
 *  host ChatEmbed filling the rest (own scroll, opens at the latest message,
 *  composer pinned at the bottom). Keyed by slot so a switch remounts it at the
 *  bottom of the new transcript.
 *
 *  The ChatEmbed IS the host's chat-core composer: tool approvals render in
 *  its transcript with Approve / Reject / Trust (the slot approve endpoint,
 *  covered by the app's chat grant), and its attach control, paste and drop
 *  stage files through the composer upload. The host shows the attach control
 *  and the / and @ pickers only when app.json declares the upload,
 *  slash-commands and file-search paths (pinned in workspace.test.tsx).
 *
 *  Under the composer the app draws the approval-mode picker the embed lacks
 *  (TrustControl, trust.ts), and its CSS moves the input's border onto the
 *  composer row (styles.ts, `.tp-cbody>:first-child>div:has(>textarea)`). */
export function CenterColumn({
  p,
  goal,
  session,
  onBack,
  onOpenFull,
  onNewGoal,
  onSettings,
  onOpenArtifact,
  onOpenSession,
  panelToggle,
}: {
  p: FolderProject
  goal: Project | null
  session: Member | null
  onBack: () => void
  onOpenFull: (key: string) => void
  onNewGoal: () => void
  onSettings: () => void
  onOpenArtifact?: (slug: string) => void
  /** Open one of the goal's sessions in place of the lead chat (the header's
   *  "N stalled" / "N need you" chips). */
  onOpenSession?: (key: string) => void
  /** The reopen toggle, shown while the side panel is collapsed. */
  panelToggle?: ReactNode
}) {
  const dir = p.needsDir ? <DirChip onSet={onSettings} /> : null

  if (!goal) {
    return (
      <section className="tp-center" aria-label={t.chatColumn}>
        <header className="tp-chead">
          <div className="tp-chead-top">
            <div className="tp-eyebrow"><FolderKanban size={12} aria-hidden="true" /> {p.folder.name}</div>
            {panelToggle && <div className="tp-chead-actions">{panelToggle}</div>}
          </div>
          {dir && <div className="tp-chead-meta">{dir}</div>}
        </header>
        <div className="tp-cempty">
          <MessageSquare size={22} className="tp-cempty-ico" aria-hidden="true" />
          <h2 className="tp-h2">{t.noGoalsMiddleTitle}</h2>
          <p className="tp-muted">{t.noGoalsMiddleBody}</p>
          <Btn onClick={onNewGoal}>
            <Plus size={13} className="lucide-inline" aria-hidden="true" /> {t.newGoal}
          </Btn>
        </div>
      </section>
    )
  }

  const lead = goal.lead.slot
  const target = session ? session.slot : lead
  const tone = session ? sessionTone(session) : null
  const age = when(target.last_activity_ts || target.last_ts || '')
  const agentName = chatAgentName(target)

  return (
    <section className="tp-center" aria-label={t.chatColumn}>
      <header className="tp-chead">
        <div className="tp-chead-top">
          <div className="tp-chead-title">
            <div className="tp-eyebrow tp-ellipsis">
              <FolderKanban size={12} aria-hidden="true" /> {p.folder.name}
              {session && <> › {lead.title || t.untitled}</>}
            </div>
            <h2 className="tp-h2 tp-ellipsis">
              {target.title || t.untitled}
              {session && <span className="tp-h2-agent"> · {target.agent || ''}</span>}
            </h2>
          </div>
          <div className="tp-chead-actions">
            {session && (
              <Btn className="tp-btn-ghost" onClick={onBack}>
                <ArrowLeft size={13} className="lucide-inline" aria-hidden="true" /> {t.backToLead}
              </Btn>
            )}
            <Btn className="tp-btn-ghost" onClick={() => onOpenFull(target.key)}>{t.openInChat}</Btn>
            {panelToggle}
          </div>
        </div>
        <div className="tp-chead-meta tp-muted">
          {session && tone ? (
            <>
              <Badge variant={SESSION_TONE_VARIANT[tone]}>{t.sessionTone[tone]}</Badge>
              {age && <span>{age}</span>}
            </>
          ) : goal.archived ? (
            <>
              <Badge variant="muted">{t.archivedGoal}</Badge>
              <span>{t.lead} · {lead.agent || TEAM_LEAD_AGENT}{age ? ` · ${age}` : ''}</span>
            </>
          ) : (
            <>
              <span>{t.lead} · {lead.agent || TEAM_LEAD_AGENT}{age ? ` · ${age}` : ''}</span>
              {/* The LEAD's own status; sessions under it are the chips. */}
              <Badge variant={STATUS_VARIANT[goal.leadStatus]}>{t.status[goal.leadStatus]}</Badge>
              <SubAttentionChips attention={goal.subAttention} onOpen={onOpenSession ?? (() => {})} />
              <LoopLine loop={goal.loop} />
            </>
          )}
          {dir}
        </div>
      </header>
      {goal.archived && !session ? (
        <div className="tp-cempty">
          <Archive size={22} className="tp-cempty-ico" aria-hidden="true" />
          <p className="tp-muted">{t.archivedGoalBody}</p>
          <Btn onClick={() => onOpenFull(lead.key)}>{t.openGoal}</Btn>
        </div>
      ) : (
        <div className="tp-cbody">
          <ChatEmbed
            key={target.key}
            slotKey={target.key}
            frameless
            startAtBottom
            // Names the chat's agent; with none, no placeholder at all, so
            // the host's own default ("Message...") shows.
            placeholder={agentName ? t.chatPlaceholder(agentName) : undefined}
            onArtifactOpen={onOpenArtifact}
          />
          {/* Under the composer, where the dashboard composer keeps its
              approval-mode picker. The embed has no picker of its own. */}
          <div className="tp-cfoot">
            <TrustControl key={target.key} slot={target} />
          </div>
        </div>
      )}
    </section>
  )
}

/** The Work tab's goal picker: one compact native select (live goals, then
 *  archived ones), so the selected goal's full sessions tree gets the column
 *  instead of a long goal list. Picking a goal switches the middle chat. */
export function GoalPicker({
  goals,
  selectedKey,
  onSelect,
  onNewGoal,
}: {
  goals: Project[]
  selectedKey: string | null
  onSelect: (key: string) => void
  onNewGoal: () => void
}) {
  const id = useId()
  const live = goals.filter(g => !g.archived)
  const archived = goals.filter(g => g.archived)
  const option = (g: Project) => {
    const extra = g.archived ? '' : subAttentionText(g.subAttention)
    return (
      <option key={g.lead.slot.key} value={g.lead.slot.key}>
        {g.lead.slot.title || t.untitled}
        {g.archived ? ` (${t.workArchivedTag})` : ` · ${t.status[g.leadStatus]}${extra ? ` · ${extra}` : ''}`}
      </option>
    )
  }
  return (
    <section className="tp-sec" aria-label={t.goalsListLabel}>
      <div className="tp-sec-head">
        <label className="tp-sec-title" htmlFor={id}>{t.goalsHeading(live.length)}</label>
        <Btn className="tp-btn-sm" onClick={onNewGoal}>
          <Plus size={12} className="lucide-inline" aria-hidden="true" /> {t.newGoal}
        </Btn>
      </div>
      {goals.length === 0 ? (
        <p className="tp-muted tp-sec-empty">{t.noGoalsYet}</p>
      ) : (
        <select
          id={id}
          className="tp-goal-select"
          value={selectedKey ?? ''}
          onChange={e => e.target.value && onSelect(e.target.value)}
        >
          {/* A session is open in the middle: no goal reads as selected until
              the person picks one (or goes Back to lead). */}
          {selectedKey === null && <option value="">{t.workGoalPicker}…</option>}
          {live.length > 0 && <optgroup label={t.workLiveGroup}>{live.map(option)}</optgroup>}
          {archived.length > 0 && <optgroup label={t.workArchivedGroup}>{archived.map(option)}</optgroup>}
        </select>
      )}
    </section>
  )
}

function SessionLeaf({ node, openKey, onOpen }: { node: SessionNode; openKey: string | null; onOpen: (key: string) => void }) {
  const s = node.member.slot
  const tone = sessionTone(node.member)
  return (
    <li className="tp-tree-item">
      <button
        type="button"
        className="tp-srow"
        aria-current={openKey === s.key ? 'true' : undefined}
        onClick={() => onOpen(s.key)}
        title={s.last_message || undefined}
      >
        <span className="tp-srow-name">{s.title || t.untitled}</span>
        <span className={`tp-srow-tone tp-tone-${tone}`}>{t.sessionTone[tone]}</span>
      </button>
      {node.children.length > 0 && (
        <ul className="tp-tree tp-tree-nested">
          {node.children.map(c => <SessionLeaf key={c.member.slot.key} node={c} openKey={openKey} onOpen={onOpen} />)}
        </ul>
      )}
    </li>
  )
}

/** The goal's sessions as a nested tree (sub-lead → its workers), each with a
 *  colored state. Also used, flat, for "Other sessions" under a task board. */
export function SessionsTree({
  nodes,
  openKey,
  onOpen,
  heading = t.sessionsHeading,
}: {
  nodes: SessionNode[]
  openKey: string | null
  onOpen: (key: string) => void
  heading?: string
}) {
  return (
    <section className="tp-sec" aria-label={heading}>
      <div className="tp-sec-head">
        <h3 className="tp-sec-title">{heading}</h3>
      </div>
      {nodes.length === 0 ? (
        <p className="tp-muted tp-sec-empty">{t.noSessions}</p>
      ) : (
        <ul className="tp-tree">
          {nodes.map(n => <SessionLeaf key={n.member.slot.key} node={n} openKey={openKey} onOpen={onOpen} />)}
        </ul>
      )}
    </section>
  )
}

function NeedsYouItem({ row, onOpen }: { row: NeedsYouRow; onOpen: (key: string) => void }) {
  const line = row.waitsFor === 'approval' ? t.needsApproval : row.summary || t.needsHuman
  const body = (
    <>
      <span className="tp-needs-name">{row.title}</span>
      <span className="tp-needs-line">{line}</span>
    </>
  )
  const key = row.sessionKey
  return (
    <li>
      {key ? (
        <button type="button" className="tp-needs-row" onClick={() => onOpen(key)}>{body}</button>
      ) : (
        <div className="tp-needs-row tp-needs-row-static">{body}</div>
      )}
    </li>
  )
}

function TaskLeaf({ row, openKey, onOpen }: { row: TaskRow; openKey: string | null; onOpen: (key: string) => void }) {
  const body = (
    <>
      <span className="tp-task-top">
        <span className="tp-task-title">{row.title}</span>
        <span className={`tp-srow-tone tp-tone-${row.tone}`}>{t.taskTone[row.tone]}</span>
      </span>
      {row.summary && <span className="tp-task-sum">{row.summary}</span>}
    </>
  )
  const key = row.sessionKey
  return (
    <li className="tp-tree-item">
      {key ? (
        <button type="button" className="tp-task" aria-current={openKey === key ? 'true' : undefined} onClick={() => onOpen(key)}>
          {body}
        </button>
      ) : (
        <div className="tp-task tp-task-static">{body}</div>
      )}
      {row.children.length > 0 && (
        <ul className="tp-tree tp-tree-nested">
          {row.children.map(c => <TaskLeaf key={c.id} row={c} openKey={openKey} onOpen={onOpen} />)}
        </ul>
      )}
    </li>
  )
}

/** The permanent task board: a warm Needs-you strip, the done count, one row
 *  per task (a sub-conductor's own tasks nested one level under it). */
export function TaskBoardView({ board, openKey, onOpen }: { board: TaskBoard; openKey: string | null; onOpen: (key: string) => void }) {
  return (
    <section className="tp-sec tp-board" aria-label={t.boardHeading}>
      <div className="tp-needs" aria-label={t.needsYouTitle}>
        <div className="tp-needs-title">
          <BellRing size={12} aria-hidden="true" /> {t.needsYouTitle}
          {board.needsYou.length > 0 && <span> · {board.needsYou.length}</span>}
        </div>
        {board.needsYou.length === 0 ? (
          <p className="tp-needs-none">{t.needsYouNone}</p>
        ) : (
          <ul className="tp-needs-list">
            {board.needsYou.map(r => <NeedsYouItem key={r.id} row={r} onOpen={onOpen} />)}
          </ul>
        )}
      </div>
      <div className="tp-sec-head tp-board-head">
        <h3 className="tp-sec-title">{t.boardHeading}</h3>
        <span className="tp-muted tp-board-count">{t.tasksDone(board.done, board.total)}</span>
      </div>
      <ul className="tp-tree tp-tasks">
        {board.rows.map(r => <TaskLeaf key={r.id} row={r} openKey={openKey} onOpen={onOpen} />)}
      </ul>
    </section>
  )
}

const leaf = (m: Member): SessionNode => ({ member: m, role: 'worker', children: [] })

/** The selected goal's work: the task board when its lead has a readable
 *  ledger (plus the sessions bound to no task), else the sessions tree. */
export function GoalTasks({
  goal,
  board,
  openKey,
  onOpen,
}: {
  goal: Project
  board: TaskBoard | null
  openKey: string | null
  onOpen: (key: string) => void
}) {
  if (!board) return <SessionsTree nodes={sessionTree(goal)} openKey={openKey} onOpen={onOpen} />
  return (
    <>
      <TaskBoardView board={board} openKey={openKey} onOpen={onOpen} />
      {board.otherSessions.length > 0 && (
        <SessionsTree heading={t.otherSessions} nodes={board.otherSessions.map(leaf)} openKey={openKey} onOpen={onOpen} />
      )}
    </>
  )
}

interface BoardData {
  lead: LedgerRead
  nested: Map<string, LedgerRead>
}

export function Workspace({
  p,
  slotsByKey,
  boardSource,
  initial,
  visible = true,
  onOpenFull,
  onNewGoal,
  onSettings,
  onOpenArtifact,
  tab = 'overview',
  onTab,
  collapsed = false,
  onToggleCollapsed,
  panes,
}: {
  p: FolderProject
  slotsByKey: Map<string, Slot>
  /** Reads a session's work ledger. Absent on today's host (no app-readable
   *  route), so the right column shows the sessions tree. */
  boardSource?: BoardSource
  initial?: Partial<WorkspaceState>
  visible?: boolean
  onOpenFull: (key: string) => void
  onNewGoal: () => void
  onSettings: () => void
  onOpenArtifact?: (slug: string) => void
  /** The side panel's open tab, collapse state and handlers (persisted by
   *  App's usePanelLayout). */
  tab?: SideTab
  onTab?: (tab: SideTab) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  /** The Project / Subscriptions / Library tab contents. */
  panes?: Partial<Record<Exclude<SideTab, 'overview' | 'work'>, ReactNode>>
}) {
  const [state, dispatch] = useReducer(workspaceReducer, {
    goalKey: initial?.goalKey ?? null,
    sessionKey: initial?.sessionKey ?? null,
  })
  const goal = resolveGoal(p.goals, state.goalKey)
  const goalKey = goal?.lead.slot.key ?? null
  // Pin the resolved goal, so the default selection never jumps to another
  // goal later just because that one became more recently active.
  useEffect(() => {
    if (goalKey && state.goalKey !== goalKey) dispatch({ type: 'selectGoal', key: goalKey })
  }, [goalKey, state.goalKey])

  const boardQ = useQuery({
    queryKey: ['project-hub', 'board', goalKey],
    queryFn: async (): Promise<BoardData | null> => {
      const source = boardSource as BoardSource
      const lead = await source(goalKey as string)
      if (!ledgerHasData(lead)) return null
      const nested = new Map<string, LedgerRead>()
      await Promise.all(
        lead.items.map(async i => {
          const k = (i.worker_session_key || '').trim()
          if (!k) return
          const sub = await source(k).catch(() => null)
          if (ledgerHasData(sub)) nested.set(k, sub)
        }),
      )
      return { lead, nested }
    },
    enabled: Boolean(boardSource) && Boolean(goal) && !goal?.archived && visible,
    refetchInterval: visible ? POLL_MS * 4 : false,
    retry: false,
  })
  const data = boardSource && !goal?.archived && !boardQ.error ? boardQ.data ?? null : null
  const board = useMemo(
    () => (goal && data ? buildTaskBoard(goal, data.lead, slotsByKey, k => data.nested.get(k) ?? null) : null),
    [goal, data, slotsByKey],
  )
  // A task's worker may sit outside the goal's created_by tree; it can still be
  // opened in the middle column because the board bound it to this goal.
  const boardMembers = useMemo<Member[]>(() => {
    if (!board) return []
    const out: Member[] = []
    const walk = (rows: TaskRow[]) => {
      for (const r of rows) {
        const slot = r.sessionKey ? slotsByKey.get(r.sessionKey) : undefined
        if (slot) out.push({ slot, status: slotStatus(slot) })
        walk(r.children)
      }
    }
    walk(board.rows)
    return out
  }, [board, slotsByKey])
  const { session } = middleTarget(p.goals, state, boardMembers)
  const openKey = session?.slot.key ?? null
  const open = (key: string) => dispatch({ type: 'openSession', key })
  const toggle = onToggleCollapsed ?? (() => {})

  const overviewPane = (
    <div className="tp-pane">
      <OverviewPane
        p={p}
        // The chat the middle draws, so its Needs you row stays selected
        // while it is open (and the panel stays on Overview).
        shownKey={openKey ?? goalKey}
        onOpenSession={(gk, sk) => dispatch({ type: 'openInGoal', goalKey: gk, sessionKey: sk })}
        onSelectGoal={key => dispatch({ type: 'selectGoal', key })}
      />
    </div>
  )
  const workPane = (
    <div className="tp-pane">
      <GoalPicker
        goals={p.goals}
        // While a session is open in the middle, only its row reads as
        // selected; Back to lead (sessionKey cleared) restores the goal.
        selectedKey={selectedGoalKey(goalKey, openKey)}
        onSelect={key => dispatch({ type: 'selectGoal', key })}
        onNewGoal={onNewGoal}
      />
      {goal && <GoalTasks goal={goal} board={board} openKey={openKey} onOpen={open} />}
    </div>
  )

  return (
    <>
      <CenterColumn
        p={p}
        goal={goal}
        session={session}
        onBack={() => dispatch({ type: 'backToLead' })}
        onOpenFull={onOpenFull}
        onNewGoal={onNewGoal}
        onSettings={onSettings}
        onOpenArtifact={onOpenArtifact}
        onOpenSession={open}
        panelToggle={collapsed ? <PanelToggle open={false} onToggle={toggle} /> : undefined}
      />
      <div className={`tp-sidewrap${collapsed ? ' tp-sidewrap-collapsed' : ''}`}>
        <SidePanel
          tab={tab}
          onTab={onTab ?? (() => {})}
          onCollapse={toggle}
          panes={{
            overview: overviewPane,
            work: workPane,
            project: <div className="tp-pane">{panes?.project}</div>,
            subscriptions: <div className="tp-pane">{panes?.subscriptions}</div>,
            library: <div className="tp-pane">{panes?.library}</div>,
          }}
        />
      </div>
    </>
  )
}
