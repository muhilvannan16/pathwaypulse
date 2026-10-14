import { OFFICIAL_SITE_URL } from '../constants.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          PathwayPulse is an independent project and is not affiliated with the
          City of Rochester Hills. For official pathway information and
          reporting, visit the{' '}
          <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
            City of Rochester Hills website
            <span className="visually-hidden"> (opens in a new tab)</span>
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
