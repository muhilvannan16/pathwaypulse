import { DATA_SOURCE } from '../api/reports.js'
import { OFFICIAL_REPORT_URL } from '../constants.js'

export default function NoticeBar() {
  return (
    <section className="notice-bar" aria-label="Important notices">
      <div className="container notice-bar__inner">
        {DATA_SOURCE === 'sample' ? (
          <p className="notice notice--sample">
            <span className="sample-badge">Sample data</span>
            <span>
              Every report on this page is a made-up example. None of them are
              real community observations.
            </span>
          </p>
        ) : (
          // TODO: update this wording when reports move to the permanent
          // database (Supabase). Today the server keeps reports in memory.
          <p className="notice notice--sample">
            <span className="sample-badge">Test server</span>
            <span>
              Reports come from the PathwayPulse test server. It keeps them only
              temporarily, so they disappear when it restarts, and its starter
              reports are made-up examples.
            </span>
          </p>
        )}
        <p className="notice">
          <strong>Not an official city app.</strong> PathwayPulse is an
          independent community project. PathwayPulse does not send reports to
          the city. To make an official report, use the{' '}
          <a href={OFFICIAL_REPORT_URL}>
            City of Rochester Hills’ Report a Concern page
          </a>
          . Community observations are unverified unless their status says
          otherwise.
        </p>
      </div>
    </section>
  )
}
