// The ONLY file that talks to data. Components import these three functions
// and never care where the data comes from.
//
// Right now everything reads from in-memory sample data. To connect Muhil's
// FastAPI backend later, replace the bodies of the three functions with
// fetch() calls (see the "REAL API" comments). The returned shapes already
// match the API contract:
//   GET  /reports -> list of reports
//   POST /reports -> body: title, description, category, latitude, longitude
//                    (server sets id, status, created_at)
//   GET  /stats   -> {total, pending_review, resolved, by_category, by_status}

import { CATEGORIES, STATUSES } from '../constants.js'
import { SAMPLE_REPORTS } from '../data/sampleReports.js'

// 'sample' = made-up demo data. When this becomes 'live' the "Sample data"
// badge disappears. Do not set it to 'live' unless data really comes from
// the database.
export const DATA_SOURCE = 'sample'

// const API_URL = import.meta.env.VITE_API_URL // REAL API: e.g. http://localhost:8000

const FAKE_DELAY_MS = 400

// In-memory copy so createReport() results show up in later getReports() calls.
let reports = SAMPLE_REPORTS.map((r) => ({ ...r }))

function wait(ms = FAKE_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Developer test hooks for the sample mode only:
//   /?demo=error  -> getReports() fails, to see the error state
//   /?demo=empty  -> getReports() returns no reports, to see the empty state
function demoMode() {
  return new URLSearchParams(window.location.search).get('demo')
}

export async function getReports() {
  // REAL API: const res = await fetch(`${API_URL}/reports`)
  //           if (!res.ok) throw new Error(`Server returned ${res.status}`)
  //           return res.json()
  await wait()
  const demo = demoMode()
  if (demo === 'error') throw new Error('Simulated network failure (demo=error).')
  if (demo === 'empty') return []
  return reports.map((r) => ({ ...r }))
}

export async function createReport({ title, description, category, latitude, longitude }) {
  // REAL API: POST `${API_URL}/reports` with JSON body of just these 5 fields.
  await wait()
  if (!title?.trim() || !description?.trim()) {
    throw new Error('Title and description are required.')
  }
  if (!CATEGORIES.includes(category)) throw new Error('Unknown category.')
  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    throw new Error('Invalid coordinates.')
  }
  // Mimic the server: IT sets id, status, and created_at, never the client.
  const created = {
    id: `sample-new-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category,
    latitude,
    longitude,
    status: 'Pending Review',
    created_at: new Date().toISOString(),
    photo_path: null,
    reviewed_at: null,
  }
  reports = [created, ...reports]
  return { ...created }
}

export async function getStats() {
  // REAL API: const res = await fetch(`${API_URL}/stats`) ...
  await wait()
  const by_category = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  const by_status = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const r of reports) {
    by_category[r.category] += 1
    by_status[r.status] += 1
  }
  return {
    total: reports.length,
    pending_review: by_status['Pending Review'],
    resolved: by_status['Resolved'],
    by_category,
    by_status,
  }
}
