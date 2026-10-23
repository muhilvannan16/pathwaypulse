import { CATEGORIES, CATEGORY_LABELS, STATUSES, STATUS_LABELS } from '../constants.js'

// `statuses` is the list offered in the "Review status" dropdown. The page
// passes only the statuses that can actually appear in the loaded data.
export default function FilterBar({ filters, onChange, onClear, disabled, statuses = STATUSES }) {
  const hasFilters = filters.category !== '' || filters.status !== ''
  return (
    <form
      className="filters"
      aria-label="Filter reports"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="field">
        <label htmlFor="filter-category">Issue category</label>
        <select
          id="filter-category"
          value={filters.category}
          disabled={disabled}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-status">Review status</label>
        <select
          id="filter-status"
          value={filters.status}
          disabled={disabled}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={onClear}
        disabled={disabled || !hasFilters}
      >
        Clear filters
      </button>
    </form>
  )
}
