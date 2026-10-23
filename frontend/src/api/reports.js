// The ONLY file that talks to data. Components import these functions and
// never care where the data comes from.
//
// Two modes, chosen by environment variables (see frontend/.env.example):
//   VITE_DATA_SOURCE=api     (default) talk to the FastAPI backend
//   VITE_DATA_SOURCE=sample  use made-up in-memory sample data, no backend
//   VITE_API_URL             backend address, default http://localhost:8000
//
// Backend contract (backend/app/main.py):
//   GET  /reports -> list of reports
//   POST /reports -> body: title, description, category, latitude, longitude
//                    ONLY; the server sets id, status, created_at (201)
//   422 error body: {"detail":[{"loc":["body","title"],"msg":"...","type":"..."}]}
// There is no GET /stats yet, so getStats() counts the reports list itself.
//
// Slow servers: the API runs on Render's free tier, which sleeps when idle and
// can need about a minute to wake up. So every request:
//   - after SLOW_NOTICE_MS calls the caller's onSlow() (the UI shows a calm
//     "waking up" message) and KEEPS WAITING,
//   - gives up after REQUEST_TIMEOUT_MS with an ApiError whose timedOut is true.

import { CATEGORIES, STATUSES } from '../constants.js'
import { SAMPLE_REPORTS } from '../data/sampleReports.js'
import { validateReport } from '../validation.js'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
const MODE = import.meta.env.VITE_DATA_SOURCE === 'sample' ? 'sample' : 'api'

// 'sample' = made-up local demo data. 'api' = data from the backend server.
// The "Sample data" / "Test version" notices on the page depend on this.
export const DATA_SOURCE = MODE

const FAKE_DELAY_MS = 400

// Show the "waking up" notice after this long, give up after the timeout.
const SLOW_NOTICE_MS = 4000
const REQUEST_TIMEOUT_MS = 75000
// Used only by the ?demo=slow test hook.
const DEMO_SLOW_MS = 6000

// ---------------------------------------------------------------- errors

// Thrown for every failed request so components can show a clear message.
//   message      - safe to show to the user
//   status       - HTTP status, or 0 when the server could not be reached
//   fieldErrors  - {fieldName: message} taken from a 422 response
//   generalErrors- 422 messages that don't belong to a single form field
//   timedOut     - true when the server did not answer within the timeout
export class ApiError extends Error {
  constructor(
    message,
    { status = 0, fieldErrors = {}, generalErrors = [], timedOut = false } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.generalErrors = generalErrors
    this.timedOut = timedOut
  }
}

function timeoutError() {
  return new ApiError('The server did not answer within about a minute.', {
    status: 0,
    timedOut: true,
  })
}

// Runs run(signal) with the slow-server behaviour described at the top of
// this file. run() must pass the signal to fetch() so the request is really
// cancelled at the timeout.
async function withSlowNotice(run, onSlow) {
  const controller = new AbortController()
  const slowTimer = setTimeout(() => onSlow?.(), SLOW_NOTICE_MS)
  const timeoutTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await run(controller.signal)
  } catch (error) {
    // Aborting makes fetch() fail like a network error; report it as a timeout.
    if (controller.signal.aborted) throw timeoutError()
    throw error
  } finally {
    clearTimeout(slowTimer)
    clearTimeout(timeoutTimer)
  }
}

// Same sentence the backend sends with HTTP 429; used if its body is missing.
const RATE_LIMIT_MESSAGE = 'Too many reports from this connection. Please try again later.'

const NETWORK_MESSAGE =
  'We couldn’t reach the PathwayPulse server. Check your connection and try again.'

// FastAPI/Pydantic 422 body -> {fieldErrors, generalErrors}.
// loc looks like ["body", "title"]; the field name is the second item.
function parseValidationDetail(detail) {
  const fieldErrors = {}
  const generalErrors = []
  for (const item of Array.isArray(detail) ? detail : []) {
    const loc = Array.isArray(item?.loc) ? item.loc : []
    const field = loc[0] === 'body' && typeof loc[1] === 'string' ? loc[1] : null
    const msg = typeof item?.msg === 'string' ? item.msg : 'Invalid value.'
    if (field) {
      if (!fieldErrors[field]) fieldErrors[field] = msg
    } else {
      generalErrors.push(msg)
    }
  }
  return { fieldErrors, generalErrors }
}

async function errorFromResponse(response) {
  let body = null
  try {
    body = await response.json()
  } catch {
    // Not JSON (for example an HTML error page). Fall through to a generic message.
  }
  if (response.status === 422 && Array.isArray(body?.detail)) {
    const { fieldErrors, generalErrors } = parseValidationDetail(body.detail)
    return new ApiError('The server could not accept some of the details.', {
      status: 422,
      fieldErrors,
      generalErrors,
    })
  }
  if (response.status === 429) {
    // Too many requests. The backend explains it in a plain-text "detail";
    // use that, or our own sentence if it is missing or not text.
    const detail = typeof body?.detail === 'string' ? body.detail.trim() : ''
    return new ApiError(detail || RATE_LIMIT_MESSAGE, { status: 429 })
  }
  if (response.status >= 500) {
    return new ApiError('The server had a problem. Please try again in a moment.', {
      status: response.status,
    })
  }
  const detail = typeof body?.detail === 'string' ? ` (${body.detail})` : ''
  return new ApiError(`The server could not complete the request${detail}.`, {
    status: response.status,
  })
}

async function request(path, options, signal) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, signal })
  } catch {
    // fetch() only rejects when the network request itself fails.
    throw new ApiError(NETWORK_MESSAGE, { status: 0 })
  }
  if (!response.ok) throw await errorFromResponse(response)
  try {
    return await response.json()
  } catch {
    throw new ApiError('The server sent an answer we could not read.', {
      status: response.status,
    })
  }
}

// ------------------------------------------------------------ adaptation

// If the backend ever sends a timestamp without a time zone
// ("2026-10-10T14:30:00"), browsers would read it as local time. Treat it as
// UTC, which is what the server uses.
function normalizeTimestamp(value) {
  if (typeof value !== 'string') return value ?? null
  return /(Z|[+-]\d\d:?\d\d)$/i.test(value) ? value : `${value}Z`
}

// Backend report -> the shape the UI uses (same as the sample data). The
// backend does not send photo_path or reviewed_at yet, so they default to null.
function normalizeReport(raw) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    latitude: raw.latitude,
    longitude: raw.longitude,
    status: raw.status,
    created_at: normalizeTimestamp(raw.created_at),
    photo_path: raw.photo_path ?? null,
    reviewed_at: normalizeTimestamp(raw.reviewed_at ?? null),
  }
}

// ----------------------------------------------------------- sample mode

// In-memory copy so createReport() results show up in later getReports() calls.
let sampleReports = SAMPLE_REPORTS.map((r) => ({ ...r }))

function wait(ms = FAKE_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Developer test hooks, work in both modes (add to the page URL):
//   /?demo=error    -> getReports() fails, to see the error state
//   /?demo=empty    -> getReports() returns no reports, to see the empty state
//   /?demo=slow     -> requests take ~6 s, to see the "waking up" message
//   /?demo=timeout  -> the "waking up" message, then a timeout error
//                      (slow and timeout also affect form submits)
//   /?demo=ratelimit-> submitting a report fails like HTTP 429 "too many reports"
function demoMode() {
  return new URLSearchParams(window.location.search).get('demo')
}

async function applySlowDemo(demo) {
  if (demo === 'slow') await wait(DEMO_SLOW_MS)
  if (demo === 'timeout') {
    await wait(SLOW_NOTICE_MS + 500)
    throw timeoutError()
  }
}

// ------------------------------------------------------------ public API

// options.onSlow is called once if the server takes longer than a few seconds.
export async function getReports({ onSlow } = {}) {
  return withSlowNotice(async (signal) => {
    const demo = demoMode()
    if (demo === 'error') {
      await wait(150)
      throw new ApiError('Simulated network failure (demo=error).', { status: 0 })
    }
    if (demo === 'empty') {
      await wait(150)
      return []
    }
    await applySlowDemo(demo)
    if (MODE === 'sample') {
      await wait()
      return sampleReports.map((r) => ({ ...r }))
    }
    const data = await request('/reports', undefined, signal)
    if (!Array.isArray(data)) {
      throw new ApiError('The server sent an answer we could not read.')
    }
    return data.map(normalizeReport)
  }, onSlow)
}

// Sends ONLY the five fields a public user may provide. The server (not the
// browser) decides id, status and created_at.
// options.onSlow is called once if the server takes longer than a few seconds.
export async function createReport(
  { title, description, category, latitude, longitude },
  { onSlow } = {},
) {
  const body = {
    title: String(title ?? '').trim(),
    description: String(description ?? '').trim(),
    category,
    latitude,
    longitude,
  }

  return withSlowNotice(async (signal) => {
    const demo = demoMode()
    await applySlowDemo(demo)
    if (demo === 'ratelimit') {
      await wait(300)
      throw new ApiError(RATE_LIMIT_MESSAGE, { status: 429 })
    }

    if (MODE === 'sample') {
      await wait()
      const errors = validateReport(body)
      if (Object.keys(errors).length > 0) {
        const fieldErrors = {}
        for (const [field, message] of Object.entries(errors)) {
          fieldErrors[field === 'location' ? 'latitude' : field] = message
        }
        throw new ApiError('The details are not valid.', { status: 422, fieldErrors })
      }
      // Mimic the server: IT sets id, status, and created_at.
      const created = {
        id: `sample-new-${Date.now()}`,
        ...body,
        status: 'Pending Review',
        created_at: new Date().toISOString(),
        photo_path: null,
        reviewed_at: null,
      }
      sampleReports = [created, ...sampleReports]
      return { ...created }
    }

    const data = await request(
      '/reports',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      signal,
    )
    return normalizeReport(data)
  }, onSlow)
}

// Counts for the whole reports list. Shape matches the planned GET /stats.
// Calculated here until the backend gets a /stats endpoint.
export function computeStats(reports) {
  const by_category = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  const by_status = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const report of reports) {
    if (report.category in by_category) by_category[report.category] += 1
    if (report.status in by_status) by_status[report.status] += 1
  }
  return {
    total: reports.length,
    pending_review: by_status['Pending Review'],
    resolved: by_status['Resolved'],
    by_category,
    by_status,
  }
}

export async function getStats() {
  // REAL ENDPOINT LATER: if the backend adds GET /stats, call it here instead.
  return computeStats(await getReports())
}
