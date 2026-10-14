import { STATUS_LABELS } from '../constants.js'
import { statusMeta } from '../utils.js'

export default function StatusBadge({ status }) {
  const { slug, glyph } = statusMeta(status)
  return (
    <span className={`badge badge--${slug}`}>
      <span aria-hidden="true">{glyph}</span>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
