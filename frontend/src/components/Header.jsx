export default function Header({ route }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="brand">
          <svg
            className="brand__logo"
            viewBox="0 0 32 32"
            width="40"
            height="40"
            aria-hidden="true"
            focusable="false"
          >
            <rect width="32" height="32" rx="7" fill="#0F766E" />
            <path
              d="M4 18h6l3-8 5 14 3-6h7"
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1 className="brand__name">PathwayPulse</h1>
            <p className="brand__tagline">Better paths. Stronger communities.</p>
          </div>
        </div>
        <p className="mission">
          Explore community observations about walking and biking pathways in
          Rochester Hills, Michigan, and see where barriers may be showing up.
        </p>
      </div>
      <nav className="site-nav" aria-label="Main">
        <ul className="container site-nav__list">
          <li>
            <a
              href="#/"
              className="site-nav__link"
              aria-current={route === 'explore' ? 'page' : undefined}
            >
              Explore reports
            </a>
          </li>
          <li>
            <a
              href="#/report"
              className="site-nav__link"
              aria-current={route === 'report' ? 'page' : undefined}
            >
              Report a barrier
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
