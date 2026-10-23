import { useEffect, useRef, useState } from 'react'
import { ApiError, DATA_SOURCE, createReport } from '../api/reports.js'
import LocationPicker from '../components/LocationPicker.jsx'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  OFFICIAL_REPORT_URL,
  TITLE_MAX,
  TITLE_MIN,
  WAKING_MESSAGE,
} from '../constants.js'
import { validateReport } from '../validation.js'

const EMPTY_VALUES = {
  title: '',
  description: '',
  category: '',
  latitude: null,
  longitude: null,
}

// Which element to focus when someone picks an item in the error summary.
const FIELD_TARGETS = {
  title: 'title',
  description: 'description',
  category: 'category',
  location: 'location-group',
}
const FIELD_NAMES = {
  title: 'Title',
  description: 'Description',
  category: 'Category',
  location: 'Location',
}

const serverSays = (message) => `The server says: ${message}`

const NOT_SAVED_TITLE = 'Your report was not saved'

// A timed-out POST may still have reached the server, so we must NOT say
// "not saved" and must warn before a second attempt (it could be a duplicate).
const TIMEOUT_TITLE = 'We couldn’t confirm your report'
const TIMEOUT_MESSAGE =
  'The test server didn’t answer in time, so we can’t tell whether your report was saved. ' +
  'Before sending it again, check the list on the Explore reports page to see if it is already there.'

// Turns a 422 ApiError into {errors, general}: messages next to the matching
// field, plus anything that doesn't belong to one field.
function mapServerErrors(error) {
  const errors = {}
  const general = [...error.generalErrors]
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (field === 'title' || field === 'description' || field === 'category') {
      errors[field] = serverSays(message)
    } else if (field === 'latitude' || field === 'longitude') {
      errors.location = errors.location ?? serverSays(message)
    } else {
      general.push(`${field}: ${message}`)
    }
  }
  return { errors, general }
}

function focusById(id) {
  document.getElementById(id)?.focus()
}

function OfficialReportLink() {
  return (
    <>
      PathwayPulse does not send reports to the city. To make an official report, use the{' '}
      <a href={OFFICIAL_REPORT_URL}>City of Rochester Hills’ Report a Concern page</a>.
    </>
  )
}

export default function ReportFormPage() {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [formErrorTitle, setFormErrorTitle] = useState(NOT_SAVED_TITLE)
  const [phase, setPhase] = useState('idle') // idle | submitting | success
  const [waking, setWaking] = useState(false) // server is slow to answer
  const [created, setCreated] = useState(null)
  const [summaryTick, setSummaryTick] = useState(0) // bump to focus the error summary
  const summaryRef = useRef(null)
  // A ref (not state) so two quick clicks/Enter presses can't both get through
  // before React re-renders the disabled button.
  const submittingRef = useRef(false)
  const successRef = useRef(null)

  useEffect(() => {
    if (summaryTick > 0) summaryRef.current?.focus()
  }, [summaryTick])

  useEffect(() => {
    if (phase === 'success') successRef.current?.focus()
  }, [phase])

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  function setLocation(latitude, longitude) {
    setValues((current) => ({ ...current, latitude, longitude }))
    setErrors((current) => {
      if (!current.location) return current
      const next = { ...current }
      delete next.location
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submittingRef.current) return // a submit is already in progress

    setFormError('')
    setFormErrorTitle(NOT_SAVED_TITLE)
    const clientErrors = validateReport(values)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      setSummaryTick((n) => n + 1)
      return
    }

    setErrors({})
    submittingRef.current = true
    setWaking(false)
    setPhase('submitting')
    try {
      // onSlow fires if the server takes a few seconds; we keep waiting.
      const report = await createReport(values, { onSlow: () => setWaking(true) })
      // Only now, after the save really succeeded, do we show the confirmation.
      setCreated(report)
      setValues(EMPTY_VALUES)
      setPhase('success')
    } catch (error) {
      setPhase('idle')
      if (error instanceof ApiError && error.timedOut) {
        setErrors({})
        setFormErrorTitle(TIMEOUT_TITLE)
        setFormError(TIMEOUT_MESSAGE)
      } else if (error instanceof ApiError && error.status === 422) {
        const { errors: serverErrors, general } = mapServerErrors(error)
        setErrors(serverErrors)
        setFormError(general.map(serverSays).join(' '))
      } else {
        const message = error instanceof ApiError ? error.message : 'Something went wrong.'
        setErrors({})
        setFormError(`${message} Your report has not been saved.`)
      }
      setSummaryTick((n) => n + 1)
    } finally {
      submittingRef.current = false
      setWaking(false)
    }
  }

  function startAnother() {
    setCreated(null)
    setErrors({})
    setFormError('')
    setPhase('idle')
  }

  if (phase === 'success' && created) {
    return (
      <>
        <h2 id="page-heading" className="page-title" tabIndex={-1}>
          Report a barrier
        </h2>
        <section
          className="form-card success-panel"
          ref={successRef}
          tabIndex={-1}
          aria-labelledby="success-title"
        >
          {DATA_SOURCE === 'sample' ? (
            <>
              <h3 id="success-title">Your report was saved</h3>
              <p>
                “{created.title}” was saved with the status{' '}
                <strong>{created.status}</strong>. That means no one has checked it yet, so
                it is an unverified community observation.
              </p>
              <p>
                <strong>Sample mode:</strong> this report is only kept in this browser tab’s
                memory and disappears when you reload the page.
              </p>
            </>
          ) : (
            <>
              {/* NOTE: "will appear after it is reviewed" is only true while the backend's
                  GET /reports leaves out reports that are still Pending Review. Keep the
                  two in step (see "Known limitations" in the README). */}
              <h3 id="success-title">Your report was received</h3>
              <p>
                “{created.title}” was received and is waiting for a review (status:{' '}
                <strong>{created.status}</strong>). It will appear on the map after it is
                reviewed.
              </p>
            </>
          )}
          <p>
            <OfficialReportLink />
          </p>
          <div className="form-actions">
            <a className="btn btn--primary" href="#/">
              View the map and list
            </a>
            <button type="button" className="btn btn--secondary" onClick={startAnother}>
              Submit another report
            </button>
          </div>
        </section>
      </>
    )
  }

  const errorKeys = Object.keys(errors)
  const submitting = phase === 'submitting'
  const titleLength = values.title.trim().length
  const descriptionLength = values.description.trim().length

  return (
    <>
      <h2 id="page-heading" className="page-title" tabIndex={-1}>
        Report a barrier
      </h2>
      <p className="page-intro">
        Describe a walking or biking pathway problem you have seen in Rochester Hills. You
        don’t need to give your name, email, or phone number. Reports are community
        observations and stay unverified until reviewed.
      </p>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {(errorKeys.length > 0 || formError) && (
          <div
            className="error-summary"
            role="alert"
            tabIndex={-1}
            ref={summaryRef}
            aria-labelledby="error-summary-title"
          >
            <h3 id="error-summary-title">
              {errorKeys.length > 0 ? 'Please fix the following' : formErrorTitle}
            </h3>
            {formError && <p>{formError}</p>}
            {errorKeys.length > 0 && (
              <ul>
                {errorKeys.map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => focusById(FIELD_TARGETS[key])}
                    >
                      {FIELD_NAMES[key]}: {errors[key]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="title">
            Issue title <span className="required">(required)</span>
          </label>
          <input
            id="title"
            type="text"
            value={values.title}
            autoComplete="off"
            aria-required="true"
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={`title-help${errors.title ? ' title-error' : ''}`}
            onChange={(event) => setField('title', event.target.value)}
          />
          <p id="title-help" className="hint">
            {TITLE_MIN}–{TITLE_MAX} characters. Now: {titleLength}.
          </p>
          {errors.title && (
            <p id="title-error" className="field-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="category">
            Issue category <span className="required">(required)</span>
          </label>
          <select
            id="category"
            value={values.category}
            aria-required="true"
            aria-invalid={errors.category ? 'true' : undefined}
            aria-describedby={errors.category ? 'category-error' : undefined}
            onChange={(event) => setField('category', event.target.value)}
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
          {errors.category && (
            <p id="category-error" className="field-error">
              {errors.category}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="description">
            Description <span className="required">(required)</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={values.description}
            aria-required="true"
            aria-invalid={errors.description ? 'true' : undefined}
            aria-describedby={`description-help${errors.description ? ' description-error' : ''}`}
            onChange={(event) => setField('description', event.target.value)}
          />
          <p id="description-help" className="hint">
            {DESCRIPTION_MIN}–{DESCRIPTION_MAX} characters. Now: {descriptionLength}. Please
            don’t include names, faces, license plates, home addresses, phone numbers, or
            other personal information.
          </p>
          {errors.description && (
            <p id="description-error" className="field-error">
              {errors.description}
            </p>
          )}
        </div>

        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onChange={setLocation}
          error={errors.location}
        />

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
          {/* Live region: announces "Submitting…" and, if the server is slow,
              the waking-up message. Keep this page open while it waits. */}
          <p className="submit-status" role="status">
            {submitting
              ? waking
                ? `${WAKING_MESSAGE} Please keep this page open.`
                : 'Submitting your report…'
              : ''}
          </p>
        </div>
      </form>
    </>
  )
}
