import { CATEGORY_LABELS } from '../constants.js'
import { formatDate } from '../utils.js'
import StatusBadge from './StatusBadge.jsx'

// The reports this visitor sent from this device (see myReports.js).
// A report is only in the public list after it has been verified, so:
//   - found in the public list  -> show its real status and a "Show on map" button
//   - not found                 -> "Not public yet" (still waiting, or it was
//                                  removed during review; we can't tell which)
// All text is rendered as plain text by React, never as HTML.
export default function MyReports({ mine, publicReports, statusKnown, onShow, onRemove }) {
  if (mine.length === 0) return null

  return (
    <section className="my-reports" aria-labelledby="my-reports-heading">
      <h2 id="my-reports-heading" className="section-title">
        My reports
      </h2>
      <p className="hint">
        Reports you sent from this device. This list is saved only in this browser. Reports
        stay hidden from everyone else until they are verified. If one stays “Not public
        yet”, it is either still waiting or was removed during review.
      </p>
      <ul className="my-reports__list">
        {mine.map((item) => {
          const published = publicReports.find((report) => report.id === item.id)
          return (
            <li key={item.id} className="my-reports__item">
              <div className="my-reports__info">
                {published ? (
                  <StatusBadge status={published.status} />
                ) : statusKnown ? (
                  <span className="badge badge--pending">
                    <span aria-hidden="true">…</span>
                    Not public yet
                  </span>
                ) : (
                  <span className="badge badge--unknown">
                    <span aria-hidden="true">?</span>
                    Status unavailable
                  </span>
                )}
                <span className="my-reports__title">{item.title}</span>
                <span className="my-reports__meta">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                  {' · '}
                  <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                </span>
              </div>
              <div className="my-reports__actions">
                {published && (
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={() => onShow(item.id)}
                  >
                    Show on map
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove “${item.title}” from this device`}
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
