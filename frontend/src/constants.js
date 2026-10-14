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

// Where people make an official report (the City of Rochester Hills' Report a Concern page).
export const OFFICIAL_REPORT_URL =
  'https://rochesterhills.maps.arcgis.com/apps/instant/reporter/index.html?appid=fa2a4da97b254606a231c14d7647b79b'
