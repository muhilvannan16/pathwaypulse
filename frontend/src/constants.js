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

// Text limits. These MIRROR the backend (backend/app/models.py) so the form
// can show friendly errors early. The server is still the one that enforces
// them; if you change a limit in Python, change it here too.
export const TITLE_MIN = 5
export const TITLE_MAX = 100
export const DESCRIPTION_MIN = 10
export const DESCRIPTION_MAX = 1000

// Rough box around Rochester Hills. Used only to WARN (never block) when a
// chosen location looks outside the city, e.g. a typo in the longitude sign.
export const ROCHESTER_HILLS_BOUNDS = {
  south: 42.55,
  north: 42.76,
  west: -83.3,
  east: -83.0,
}

// Rochester Hills, Michigan (approximate city center).
export const ROCHESTER_HILLS_CENTER = [42.658, -83.15]
export const DEFAULT_ZOOM = 12

// Where people make an official report (the City of Rochester Hills' Report a Concern page).
export const OFFICIAL_REPORT_URL =
  'https://rochesterhills.maps.arcgis.com/apps/instant/reporter/index.html?appid=fa2a4da97b254606a231c14d7647b79b'
