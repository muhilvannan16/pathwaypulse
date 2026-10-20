// Client-side checks for the report form. They mirror the server's rules so
// people get friendly messages early. The server re-checks everything, and
// its answer (HTTP 422) is also shown in the form.

import {
  CATEGORIES,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  ROCHESTER_HILLS_BOUNDS,
  TITLE_MAX,
  TITLE_MIN,
} from './constants.js'

function checkText(label, value, min, max) {
  // The server trims spaces before counting, so we do too.
  const length = (value ?? '').trim().length
  if (length === 0) return `Enter a ${label}.`
  if (length < min) {
    return `The ${label} must be at least ${min} characters (you have ${length}).`
  }
  if (length > max) {
    return `The ${label} must be ${max} characters or fewer (you have ${length}).`
  }
  return ''
}

// Returns an error message, or '' when the pair is a usable coordinate.
export function checkCoordinates(latitude, longitude) {
  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return 'Choose a location on the map.'
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return 'Latitude must be a number between -90 and 90.'
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return 'Longitude must be a number between -180 and 180.'
  }
  return ''
}

// True when the point is inside the rough Rochester Hills box.
export function isNearRochesterHills(latitude, longitude) {
  const b = ROCHESTER_HILLS_BOUNDS
  return latitude >= b.south && latitude <= b.north && longitude >= b.west && longitude <= b.east
}

// Turns typed text like " 42.658 " into a number. Empty or junk gives NaN.
export function parseCoordinate(text) {
  const trimmed = String(text ?? '').trim()
  return trimmed === '' ? NaN : Number(trimmed)
}

// Returns an object with one message per problem field (empty object = valid).
// Keys: title, description, category, location.
export function validateReport({ title, description, category, latitude, longitude }) {
  const errors = {}
  const titleError = checkText('title', title, TITLE_MIN, TITLE_MAX)
  if (titleError) errors.title = titleError
  const descriptionError = checkText('description', description, DESCRIPTION_MIN, DESCRIPTION_MAX)
  if (descriptionError) errors.description = descriptionError
  if (!CATEGORIES.includes(category)) errors.category = 'Choose a category.'
  const locationError = checkCoordinates(latitude, longitude)
  if (locationError) errors.location = locationError
  return errors
}
