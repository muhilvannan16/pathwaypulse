import { OFFICIAL_REPORT_URL } from '../constants.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          PathwayPulse is an independent project and is not affiliated with the
          City of Rochester Hills. PathwayPulse does not send reports to the
          city. To make an official report, use the{' '}
          <a href={OFFICIAL_REPORT_URL}>
            City of Rochester Hills’ Report a Concern page
          </a>
          .
        </p>
        <p>
          Map data &copy;{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          . PathwayPulse does not certify any pathway as safe or accessible.
        </p>
      </div>
    </footer>
  )
}
