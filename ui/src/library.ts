/**
 * Library fetch helpers, pure so they are tested without a DOM.
 *
 * Why these exist: 0.7's Library drew two grey placeholder blocks until BOTH
 * the artifact listing and the output-file scan had answered. The scan
 * (`GET /api/artifacts/session-docs`) reads every session's history on the
 * host (about 13 s over ~530 sessions here), retried three times on failure
 * and refetched every 20 s, so on a large install the placeholders could sit
 * there indefinitely and the artifacts never showed either. Now each group
 * reports its own state, and the scan gives up after a bounded wait.
 */

/** How long the Library waits for the output-file scan before saying it did
 *  not finish. Generous: the scan is slow, not broken. */
export const DOCS_TIMEOUT_MS = 45_000

export interface GroupState {
  loading: boolean
  error: string
}

/** One Library group's state from its own query. Rows already received keep
 *  showing through a later failed refresh (no error then); a first load that
 *  failed reports the error; a first load in flight is loading. */
export function groupState(data: unknown, error: unknown, isLoading: boolean): GroupState {
  if (data !== undefined && data !== null) return { loading: false, error: '' }
  if (error) return { loading: false, error: String((error as Error)?.message || error) || 'error' }
  return { loading: isLoading, error: '' }
}

/** A signal that aborts when `parent` does OR after `ms`, whichever is first.
 *  Built by hand: `AbortSignal.any` is not in every browser the host runs in. */
export function withTimeout(parent: AbortSignal | undefined, ms: number): AbortSignal {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(new Error(`timed out after ${Math.round(ms / 1000)} s`)), ms)
  const done = () => clearTimeout(timer)
  ctl.signal.addEventListener('abort', done, { once: true })
  if (parent) {
    if (parent.aborted) ctl.abort(parent.reason)
    else parent.addEventListener('abort', () => ctl.abort(parent.reason), { once: true })
  }
  return ctl.signal
}
