import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import NoticeBar from './components/NoticeBar.jsx'
import Footer from './components/Footer.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import ReportFormPage from './pages/ReportFormPage.jsx'

// Tiny hash router: "#/report" shows the form, anything else shows Explore.
// Hash links need no library and work with a static host.
function routeFromHash() {
  return window.location.hash === '#/report' ? 'report' : 'explore'
}

const PAGE_TITLES = {
  explore: 'PathwayPulse',
  report: 'Report a barrier – PathwayPulse',
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash)
  const firstRender = useRef(true)

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // On every page change: update the tab title, go to the top, and move focus
  // to the new page's heading so keyboard and screen-reader users know the
  // page changed. (Skipped on the very first load.)
  useEffect(() => {
    document.title = PAGE_TITLES[route]
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    document.getElementById('page-heading')?.focus({ preventScroll: true })
  }, [route])

  // The skip link must not change the URL hash (that would change the page).
  function skipToMain(event) {
    event.preventDefault()
    document.getElementById('main')?.focus()
  }

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <Header route={route} />
      <NoticeBar />
      <main id="main" className="container" tabIndex={-1}>
        {route === 'report' ? <ReportFormPage /> : <ExplorePage />}
      </main>
      <Footer />
    </>
  )
}
