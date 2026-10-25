import { useState } from 'react'
import { DATA_SOURCE } from '../api/reports.js'
import { fetchPending, rejectReport, verifyReport } from '../api/moderation.js'
import { CATEGORY_LABELS } from '../constants.js'
import { formatDate } from '../utils.js'

// Moderator tools: review reports that are "Pending Review".
//   Verify -> the report becomes public (status "Verified").
//   Reject -> the report is deleted for good (so it asks to confirm first).
// This page is not linked from the menu, but we do NOT rely on that for
// security: the server checks the token on every request. The token is kept
// in React state only, so closing or reloading the page forgets it.
export default function ModeratePage() {
  const [tokenInput, setTokenInput] = useState('')
  const [token, setToken] = useState('')
  const [pending, setPending] = useState([])
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [message, setMessage] = useState({ kind: 'info', text: '' })

  const unlocked = token !== ''

  if (DATA_SOURCE === 'sample') {
    return (
      <>
        <h2 id="page-heading" className="page-title" tabIndex={-1}>
          Moderator tools
        </h2>
        <p className="page-intro">
          Moderation is not available in sample-data mode, because sample reports are not
          stored on a server.
        </p>
      </>
    )
  }

  function lock(text = '') {
    setToken('')
    setPending([])
    setConfirmId(null)
    setMessage({ kind: 'info', text })
  }

  async function unlock(event) {
    event.preventDefault()
    const candidate = tokenInput.trim()
    if (!candidate || busy) return
    setBusy(true)
    setMessage({ kind: 'info', text: 'Checking the token…' })
    try {
      const list = await fetchPending(candidate)
      setToken(candidate)
      setTokenInput('')
      setPending(list)
      setMessage({ kind: 'info', text: list.length ? '' : 'Nothing is waiting for review.' })
    } catch (error) {
      setMessage({ kind: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function reload() {
    if (busy) return
    setBusy(true)
    setMessage({ kind: 'info', text: 'Refreshing…' })
    try {
      const list = await fetchPending(token)
      setPending(list)
      setMessage({ kind: 'info', text: list.length ? '' : 'Nothing is waiting for review.' })
    } catch (error) {
      if (error.status === 401) lock('That token was not accepted any more. The page is locked.')
      else setMessage({ kind: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function act(kind, report) {
    if (busy) return
    setBusy(true)
    setConfirmId(null)
    try {
      if (kind === 'verify') await verifyReport(token, report.id)
      else await rejectReport(token, report.id)
      setPending((list) => list.filter((item) => item.id !== report.id))
      setMessage({
        kind: 'info',
        text:
          kind === 'verify'
            ? `“${report.title}” is now Verified and public.`
            : `“${report.title}” was deleted.`,
      })
    } catch (error) {
      if (error.status === 401) {
        lock('That token was not accepted any more. The page is locked.')
      } else {
        if (error.status === 404) {
          setPending((list) => list.filter((item) => item.id !== report.id))
        }
        setMessage({ kind: 'error', text: error.message })
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 id="page-heading" className="page-title" tabIndex={-1}>
        Moderator tools
      </h2>
      <p className="page-intro">
        For the project team. New reports stay hidden until you verify them. You need the
        moderator token to use this page.
      </p>

      <div className="mod-message" role="status" aria-live="polite" data-kind={message.kind}>
        {message.text}
      </div>

      {!unlocked ? (
        <form className="form-card" onSubmit={unlock}>
          <div className="field">
            <label htmlFor="mod-token">Moderator token</label>
            <input
              id="mod-token"
              type="password"
              autoComplete="off"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={busy || !tokenInput.trim()}>
              {busy ? 'Checking…' : 'Unlock'}
            </button>
          </div>
        </form>
      ) : (
        <section aria-labelledby="mod-heading">
          <div className="mod-bar">
            <h3 id="mod-heading" className="section-title">
              Waiting for review ({pending.length})
            </h3>
            <div className="mod-bar__actions">
              <button type="button" className="btn btn--secondary btn--small" onClick={reload} disabled={busy}>
                Refresh
              </button>
              <button type="button" className="btn btn--secondary btn--small" onClick={() => lock()}>
                Lock
              </button>
            </div>
          </div>
          <ul className="mod-list">
            {pending.map((report) => (
              <li key={report.id} className="mod-item">
                <h4 className="mod-item__title">{report.title}</h4>
                <p className="mod-item__meta">
                  {CATEGORY_LABELS[report.category] ?? report.category}
                  {' · '}
                  <time dateTime={report.created_at}>{formatDate(report.created_at)}</time>
                  {' · '}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=18/${report.latitude}/${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View location (opens OpenStreetMap)
                  </a>
                </p>
                <p className="mod-item__desc">{report.description}</p>
                {report.flags?.length > 0 && (
                  <p className="mod-item__flags">
                    <strong>Check carefully:</strong> {report.flags.join('; ')}.
                  </p>
                )}
                <div className="mod-item__actions">
                  <button
                    type="button"
                    className="btn btn--primary btn--small"
                    onClick={() => act('verify', report)}
                    disabled={busy}
                  >
                    Verify
                  </button>
                  {confirmId === report.id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => act('reject', report)}
                        disabled={busy}
                      >
                        Yes, delete for good
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => setConfirmId(report.id)}
                      disabled={busy}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
