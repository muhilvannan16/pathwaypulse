import { CATEGORY_LABELS } from '../constants.js'
import { formatDate } from '../utils.js'
import StatusBadge from './StatusBadge.jsx'

// One row in the report list. It is a real <button> so keyboard users can
// Tab to it and press Enter/Space. All text is rendered as plain text by
// React, so user-written content can never be interpreted as HTML.
export default function ReportCard({ report, selected, isSample, onSelect }) {
  return (
    <li>
      <button
        type="button"
        id={`report-${report.id}`}
        className={`report-card${selected ? ' report-card--selected' : ''}`}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onSelect(report.id)}
      >
        <span className="report-card__top">
          <StatusBadge status={report.status} />
          {isSample && <span className="sample-tag">Sample</span>}
        </span>
        <span className="report-card__title">{report.title}</span>
        <span className="report-card__meta">
          {CATEGORY_LABELS[report.category] ?? report.category}
          {' · '}
          <time dateTime={report.created_at}>{formatDate(report.created_at)}</time>
        </span>
        <span className="report-card__desc">{report.description}</span>
      </button>
    </li>
  )
}
