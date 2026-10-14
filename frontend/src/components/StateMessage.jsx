// One component for every non-happy-path state: loading, error, and the two
// kinds of "empty" (no data at all vs. filters matched nothing).
export default function StateMessage({ kind, detail, onRetry, onClear }) {
  if (kind === 'loading') {
    return (
      <div className="state" role="status">
        <span className="spinner" aria-hidden="true" />
        <p className="state__title">Loading reports…</p>
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
          Try again
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
        When community members submit observations, they will appear here. No
        reports does not mean a pathway is safe or accessible.
      </p>
    </div>
  )
}
