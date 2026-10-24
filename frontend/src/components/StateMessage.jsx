import { WAKING_MESSAGE } from '../constants.js'

// One component for every non-happy-path state: loading, error, and the two
// kinds of "empty" (no data at all vs. filters matched nothing).
//   waking   - (loading) the server is slow; show the calm "waking up" note
//   timedOut - (error) the server never answered within the time limit
//   afterReview - (empty) say that new reports appear only after a review
export default function StateMessage({
  kind,
  detail,
  waking,
  timedOut,
  afterReview,
  onRetry,
  onClear,
}) {
  if (kind === 'loading') {
    // role="status" is a polite live region, so the waking-up note is
    // announced to screen readers when it appears.
    return (
      <div className="state" role="status">
        <span className="spinner" aria-hidden="true" />
        <p className="state__title">Loading reports…</p>
        {waking && <p className="state__note">{WAKING_MESSAGE}</p>}
      </div>
    )
  }

  if (kind === 'error' && timedOut) {
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">The test server didn’t respond in time.</p>
        <p>It may still be waking up. Wait a moment, then try again.</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (kind === 'error') {
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">We couldn’t load the reports.</p>
        <p>Check your internet connection and try again.</p>
        {detail && <p className="state__detail">Details: {detail}</p>}
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (kind === 'no-match') {
    return (
      <div className="state" role="status">
        <p className="state__title">No reports match these filters.</p>
        <p>Try a different category or status, or clear the filters.</p>
        <button type="button" className="btn btn--secondary" onClick={onClear}>
          Clear filters
        </button>
      </div>
    )
  }

  // kind === 'empty'
  return (
    <div className="state" role="status">
      <p className="state__title">No reports yet.</p>
      <p>
        {afterReview
          ? 'New reports are checked by a person before they appear here, so a report you just sent will not show up right away.'
          : 'When community members submit observations, they will appear here.'}{' '}
        No reports does not mean a pathway is safe or accessible.
      </p>
    </div>
  )
}
