/**
 * The side panel's first tab: a project-at-a-glance summary, top to bottom —
 * a one-line summary (goals by their lead's status, and how many need you),
 * Needs you (left out when nothing waits), Goals, Pull requests (grouped by
 * what each link reports) and Recent activity.
 * Every number comes from `buildOverview` (overview.ts), which reads only the
 * data the app already holds. This is the ONLY place the page lists sessions
 * that wait on the person: the page itself carries just a one-line count chip.
 */
import { BellRing, CircleHelp, PauseCircle } from 'lucide-react'
import type { FolderProject, InboxKind } from './model'
import { buildOverview, type PrGroups } from './overview'
import { PrChip, StatusDot, when } from './parts'
import { t } from './strings'

const NEED_ICON: Record<InboxKind, typeof BellRing> = {
  approval: BellRing,
  needs_input: CircleHelp,
  stalled: PauseCircle,
}

const PR_ORDER: (keyof PrGroups)[] = ['failing', 'open', 'merged', 'closed', 'unknown']
const PR_LABEL: Record<keyof PrGroups, string> = {
  failing: t.ovPrFailing,
  open: t.ovPrOpen,
  merged: t.ovPrMerged,
  closed: t.ovPrClosed,
  unknown: t.ovPrUnknown,
}

export function OverviewPane({
  p,
  shownKey = null,
  onOpenSession,
  onSelectGoal,
}: {
  p: FolderProject
  /** The chat the middle column is drawing right now (an opened session, or
   *  the selected goal's lead), so its Needs you row reads as selected. */
  shownKey?: string | null
  /** Open `sessionKey` (of goal `goalKey`) in the middle column. */
  onOpenSession: (goalKey: string, sessionKey: string) => void
  /** Select a goal, which opens its lead chat in the middle column. */
  onSelectGoal: (goalKey: string) => void
}) {
  const ov = buildOverview(p)
  const prSummary = PR_ORDER.filter(k => ov.prs[k].length > 0)
    .map(k => `${ov.prs[k].length} ${t.ovPrSummary[k]}`)
    .join(' · ')
  const sum = ov.summary

  return (
    <div className="tp-ov" aria-label={t.overviewLabel}>
      {/* One line, replacing 0.8's four tiles: GOALS by their lead's status,
          and how many rows Needs you lists (warning colour; left out at 0). */}
      <p className="tp-ov-summary" aria-label={t.ovSummaryLabel} data-testid="ov-summary">
        <span>{t.ovSumGoals(sum.goals)}</span>
        <span className="tp-ov-summary-sep" aria-hidden="true"> · </span>
        <span>{t.ovSumWorking(sum.working)}</span>
        <span className="tp-ov-summary-sep" aria-hidden="true"> · </span>
        <span>{t.ovSumIdle(sum.idle)}</span>
        {sum.needYou > 0 && (
          <>
            <span className="tp-ov-summary-sep" aria-hidden="true"> · </span>
            <span className="tp-ov-summary-warn">{t.ovSumNeedYou(sum.needYou)}</span>
          </>
        )}
      </p>

      {ov.needs.length > 0 && (
        <section className="tp-ov-sec tp-ov-needs" aria-label={t.ovNeedsYou(ov.needs.length)}>
          <h3 className="tp-ov-head tp-ov-head-warn">
            <BellRing size={12} aria-hidden="true" /> {t.ovNeedsYou(ov.needs.length)}
          </h3>
          <ul className="tp-ov-list tp-ov-needlist">
            {ov.needs.map(n => {
              const Icon = NEED_ICON[n.kind]
              const current = shownKey === n.slotKey
              return (
                <li key={n.slotKey}>
                  <button
                    type="button"
                    className={`tp-ov-need tp-ov-need-${n.kind}`}
                    aria-current={current ? 'true' : undefined}
                    onClick={() => onOpenSession(n.goalKey, n.slotKey)}
                  >
                    <Icon size={13} className="tp-ov-need-ico" aria-hidden="true" />
                    <span className="tp-ov-need-main">
                      {/* Time on the title line, so the hint gets the row's width. */}
                      <span className="tp-ov-need-top">
                        <span className="tp-ov-name">{n.title || t.untitled}</span>
                        {n.updated && <span className="tp-ov-when">{when(n.updated)}</span>}
                      </span>
                      <span className="tp-ov-sub">
                        <span className="tp-ov-need-label">{t.ovNeedLabel[n.kind]}</span> · {n.hint}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="tp-ov-sec" aria-label={t.ovGoals(ov.goals.length)}>
        <h3 className="tp-ov-head">{t.ovGoals(ov.goals.length)}</h3>
        {ov.goals.length === 0 ? (
          <p className="tp-muted tp-ov-empty">{t.ovNoGoals}</p>
        ) : (
          <ul className="tp-ov-list">
            {ov.goals.map(g => {
              const meta = [
                t.ovGoalChats(g.chats),
                t.ovGoalPrs(g.prs),
                g.activity ? t.ovGoalActive(when(g.activity)) : '',
              ].filter(Boolean).join(' · ')
              return (
                <li key={g.key}>
                  <button type="button" className="tp-ov-goal" onClick={() => onSelectGoal(g.key)}>
                    <span className="tp-ov-goal-top">
                      <span className="tp-ov-name">{g.title || t.untitled}</span>
                      <span className="tp-ov-goal-state">
                        <StatusDot status={g.leadStatus} />
                        <span className={`tp-tone-${g.leadStatus}`}>{t.status[g.leadStatus]}</span>
                      </span>
                    </span>
                    {/* Only when the slot row says the latest message is the
                        lead's own; never the person's prompt, never invented. */}
                    {g.quote && (
                      <q className="tp-ov-quote" title={t.ovGoalQuoteLabel}>{g.quote}</q>
                    )}
                    <span className="tp-ov-sub">{meta}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="tp-ov-sec" aria-label={t.ovPrs(ov.prTotal)}>
        <div className="tp-ov-headrow">
          <h3 className="tp-ov-head">{t.ovPrs(ov.prTotal)}</h3>
          {prSummary && <span className="tp-ov-sum">{prSummary}</span>}
        </div>
        {ov.prTotal === 0 ? (
          <p className="tp-muted tp-ov-empty">{t.ovNoPrs}</p>
        ) : (
          PR_ORDER.filter(k => ov.prs[k].length > 0).map(k => (
            <div key={k} className={`tp-ov-prgroup tp-ov-pr-${k}`}>
              <div className="tp-ov-label" title={k === 'unknown' ? t.ovPrUnknownHint : undefined}>{PR_LABEL[k]}</div>
              <div className="tp-chips">
                {ov.prs[k].map(l => <PrChip key={l.url} link={l} />)}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="tp-ov-sec" aria-label={t.ovRecent}>
        <h3 className="tp-ov-head">{t.ovRecent}</h3>
        {ov.recent.length === 0 ? (
          <p className="tp-muted tp-ov-empty">{t.ovNoRecent}</p>
        ) : (
          <ul className="tp-ov-list">
            {ov.recent.map(r => (
              <li key={r.slotKey}>
                <button type="button" className="tp-ov-recent" onClick={() => onOpenSession(r.goalKey, r.slotKey)}>
                  <span className="tp-ov-recent-text">
                    <span className="tp-ov-name">{r.title || t.untitled}</span>{' '}
                    <span className={`tp-ov-sub tp-ov-recent-${r.kind}`}>{t.ovRecentKind[r.kind]}</span>
                  </span>
                  <span className="tp-ov-when">{when(r.ts)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
