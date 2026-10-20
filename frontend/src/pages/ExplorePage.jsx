import { useEffect, useRef, useState } from 'react'
import { DATA_SOURCE, getReports } from '../api/reports.js'
import FilterBar from '../components/FilterBar.jsx'
import ReportList from '../components/ReportList.jsx'
import ReportMap from '../components/ReportMap.jsx'
import StatCards from '../components/StatCards.jsx'
import StateMessage from '../components/StateMessage.jsx'
import { isNarrowLayout } from '../utils.js'

const NO_FILTERS = { category: '', status: '' }

// This page owns ALL the state for the Explore screen:
//   load      - loading / error / ready, plus the loaded reports
//   filters   - the two dropdown values
//   selectedId- which report is highlighted (shared by the list and the map)
// Everything else (filtered list, counts) is calculated from those during
// render, so it can never get out of sync.
export default function ExplorePage() {
  const [load, setLoad] = useState({ phase: 'loading', reports: [], error: '' })
  const [attempt, setAttempt] = useState(0) // bump to reload
  const [filters, setFilters] = useState(NO_FILTERS)
  const [selectedId, setSelectedId] = useState(null)
  const mapSectionRef = useRef(null)

  useEffect(() => {
    let ignore = false // avoids setting state after unmount / a newer request
    getReports()
      .then((reports) => {
        if (!ignore) setLoad({ phase: 'ready', reports, error: '' })
      })
      .catch((err) => {
        if (!ignore) setLoad({ phase: 'error', reports: [], error: err.message })
      })
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setLoad({ phase: 'loading', reports: [], error: '' })
    setAttempt((n) => n + 1)
  }

  const { phase, reports } = load
  const isSample = DATA_SOURCE === 'sample'

  // Counts come from everything that was loaded, not from the filtered view.
  const total = reports.length
  const pending = reports.filter((r) => r.status === 'Pending Review').length
  const resolved = reports.filter((r) => r.status === 'Resolved').length

  const visible = reports
    .filter((r) => !filters.category || r.category === filters.category)
    .filter((r) => !filters.status || r.status === filters.status)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // If a filter hides the selected report, nothing is selected any more.
  const selectedReport = visible.find((r) => r.id === selectedId) ?? null

  function selectFromList(id) {
    setSelectedId(id)
    // On phones the map is above the list, so bring it into view.
    if (isNarrowLayout()) {
      mapSectionRef.current?.scrollIntoView({ block: 'start' })
    }
  }

  function selectFromMap(id) {
    setSelectedId(id)
    // On wide screens the list is beside the map; show the matching item.
    if (!isNarrowLayout()) {
      document.getElementById(`report-${id}`)?.scrollIntoView({ block: 'nearest' })
    }
  }

  let listContent
  if (phase === 'loading') {
    listContent = <StateMessage kind="loading" />
  } else if (phase === 'error') {
    listContent = <StateMessage kind="error" detail={load.error} onRetry={retry} />
  } else if (total === 0) {
    listContent = <StateMessage kind="empty" />
  } else if (visible.length === 0) {
    listContent = <StateMessage kind="no-match" onClear={() => setFilters(NO_FILTERS)} />
  } else {
    listContent = (
      <ReportList
        reports={visible}
        selectedId={selectedReport?.id ?? null}
        isSample={isSample}
        onSelect={selectFromList}
      />
    )
  }

  return (
    <>
      <h2 id="page-heading" className="page-title" tabIndex={-1}>
        Explore reports
      </h2>
      <StatCards
        total={total}
        pending={pending}
        resolved={resolved}
        loading={phase === 'loading'}
      />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(NO_FILTERS)}
        disabled={phase !== 'ready' || total === 0}
      />
      <div className="explore">
        <section className="explore__map" ref={mapSectionRef} aria-labelledby="map-heading">
          <h2 id="map-heading" className="section-title">
            Map
          </h2>
          <ReportMap
            reports={visible}
            selectedReport={selectedReport}
            isSample={isSample}
            onSelect={selectFromMap}
          />
          <p className="hint">
            Pins show where each report was placed. Select a pin or a report in
            the list to highlight it.
          </p>
        </section>
        <section className="explore__list" aria-labelledby="list-heading">
          <h2 id="list-heading" className="section-title">
            Recent reports
          </h2>
          {phase === 'ready' && total > 0 && (
            <p className="hint" aria-live="polite">
              Showing {visible.length} of {total} {total === 1 ? 'report' : 'reports'}
            </p>
          )}
          {listContent}
        </section>
      </div>
    </>
  )
}
