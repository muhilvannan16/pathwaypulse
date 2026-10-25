// Calls to the moderator endpoints (backend/app/main.py, "/moderation/...").
// Every call sends the moderator token in the X-Moderator-Token header. The
// token is typed in by the moderator, lives only in the page's memory, and is
// NEVER stored in the browser, the repo, or a VITE_ variable. The real check
// is done by the server; this page only makes the endpoints easier to use.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
// The free-tier server can need about a minute to wake up.
const TIMEOUT_MS = 75000

export class ModerationError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ModerationError'
    this.status = status // HTTP status, or 0 if the server could not be reached
  }
}

async function call(path, token, method = 'GET') {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'X-Moderator-Token': token },
      signal: controller.signal,
    })
  } catch {
    throw new ModerationError(
      controller.signal.aborted
        ? 'The server took too long to answer. Please try again.'
        : 'Could not reach the server. Check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }
  if (response.status === 401) throw new ModerationError('That token was not accepted.', 401)
  if (response.status === 404) {
    throw new ModerationError('That report was not found. It may already have been handled.', 404)
  }
  if (!response.ok) {
    throw new ModerationError('The server reported a problem. Please try again.', response.status)
  }
  return response.status === 204 ? null : response.json()
}

export const fetchPending = (token) => call('/moderation/reports', token)
export const verifyReport = (token, id) => call(`/moderation/reports/${id}/verify`, token, 'POST')
export const rejectReport = (token, id) => call(`/moderation/reports/${id}`, token, 'DELETE')
