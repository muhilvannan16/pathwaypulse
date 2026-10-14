// Shared values that must match the backend data contract (Muhil's FastAPI
// models). If you change a value here, change it in the Python code too.

export const CATEGORIES = [
  'damaged_path',
  'blocked_path',
  'accessibility_barrier',
  'missing_connection',
]

export const CATEGORY_LABELS = {
  damaged_path: 'Damaged pathway surface',
  blocked_path: 'Blocked pathway',
  accessibility_barrier: 'Accessibility barrier',
  missing_connection: 'Missing pathway or sidewalk connection',
}

export const STATUSES = [
  'Pending Review',
  'Verified',
  'Submitted to Agency',
  'Resolved',
]

// The status values are already human-readable, but we keep a label map so
// the display text can change later without changing the stored value.
export const STATUS_LABELS = {
  'Pending Review': 'Pending Review',
  Verified: 'Verified',
  'Submitted to Agency': 'Submitted to Agency',
  Resolved: 'Resolved',
}

// Rochester Hills, Michigan (approximate city center).
export const ROCHESTER_HILLS_CENTER = [42.658, -83.15]
export const DEFAULT_ZOOM = 12

// General city website. TODO (Muhil): replace with the exact official
// reporting page after checking it yourself.
export const OFFICIAL_SITE_URL = 'https://www.rochesterhills.org'
