// Small helpers shared by several components.

// Each status gets a CSS-friendly slug and a symbol, so status is never shown
// with color alone.
const STATUS_META = {
  'Pending Review': { slug: 'pending', glyph: '…' },
  Verified: { slug: 'verified', glyph: '✓' },
  'Submitted to Agency': { slug: 'submitted', glyph: '→' },
  Resolved: { slug: 'resolved', glyph: '★' },
}

export function statusMeta(status) {
  return STATUS_META[status] ?? { slug: 'unknown', glyph: '?' }
}

export function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Only draw a marker when both coordinates are real numbers in range.
export function isValidCoordinate(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// True on phone/tablet portrait widths, where the map sits above the list.
export function isNarrowLayout() {
  return window.matchMedia('(max-width: 899px)').matches
}
