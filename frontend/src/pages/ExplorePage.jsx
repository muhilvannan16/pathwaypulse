import { useEffect, useRef, useState } from 'react'
import { DATA_SOURCE, getReports } from '../api/reports.js'
import FilterBar from '../components/FilterBar.jsx'
import MyReports from '../components/MyReports.jsx'
import ReportList from '../components/ReportList.jsx'
import ReportMap from '../components/ReportMap.jsx'
import StatCards from '../components/StatCards.jsx'
import StateMessage from '../components/StateMessage.jsx'
import { PUBLIC_STATUSES, STATUSES } from '../constants.js'
import { getMyReports, removeMyReport } from '../myReports.js'
import { isNarrowLayout } from '../utils.js'

const NO_FILTERS = { category: '', status: '' }

// This page owns ALL the state for the Explore screen:
//   load      - loading / error / ready, plus the loaded reports. While loading,
//               `waking` turns true if the server is slow (free hosting waking
//               up); on error, `timedOut` says the server never answered.
//   filters   - the two dropdown values
//   selectedId- which report is highlighted (shared by the list and the map)
// Everything else (filtered list, counts) is calculated from those during
// render, so it can never get out of sync.
const LOADING = { phase: 'loading', reports: [], error: '', waking: false, timedOut: false }

export default function ExplorePage() {
  const [load, setLoad] = useState(LOADING)
  const [attempt, setAttempt] = useState(0) // bump to reload
  const [filters, setFilters] = useState(NO_FILTERS)
  const [selectedId, setSelectedId] = useState(null)
  const [mine, setMine] = useState(getMyReports) // reports sent from this device
  const mapSectionRef = useRef(null)

  useEffect(() => {
    let ignore = false // avoids setting state after unmount / a newer request
    getReports({
      // Slow server: keep waiting, but tell the person why.
      onSlow: () => {
        if (!ignore) setLoad((current) => (current.phase === 'loading' ? { ...current, waking: true } : current))
      },
    })
      .then((reports) => {
        if (!ignore) setLoad({ ...LOADING, phase: 'ready', reports })
      })
      .catch((err) => {
        if (!ignore) {
          setLoad({ ...LOADING, phase: 'error', error: err.message, timedOut: Boolean(err.timedOut) })
        }
      })
    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setLoad(LOADING)
    setAttempt((n) => n + 1)
  }

  const { phase, reports } = load
  const isSample = DATA_SOURCE === 'sample'

  // Counts come from everything that was loaded, not from the filtered view.
  const countStatus = (status) => reports.filter((r) => r.status === status).length

  // The real (api) data never includes "Pending Review" reports, so a
  // "Pending review" card would always say 0. Show "Verified" instead there.
  // Sample data does include pending reports, so it keeps the old card.
  const statCards = [
    { label: 'Total reports', value: reports.length },
    isSample
      ? { label: 'Pending review', value: countStatus('Pending Review') }
      : { label: 'Verified', value: countStatus('Verified') },
    { label: 'Resolved', value: countStatus('Resolved') },
  ]
  const filterStatuses = isSample ? STATUSES : PUBLIC_STATUSES
  const total = reports.length

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

  function showMine(id) {
    // Clear the filters first so the report can't be hidden by one.
    setFilters(NO_FILTERS)
    selectFromList(id)
  }

  function removeMine(id) {
    removeMyReport(id)
    setMine(getMyReports())
  }

  let listContent
  if (phase === 'loading') {
    listContent = <StateMessage kind="loading" waking={load.waking} />
  } else if (phase === 'error') {
    listContent = (
      <StateMessage kind="error" detail={load.error} timedOut={load.timedOut} onRetry={retry} />
    )
  } else if (total === 0) {
    listContent = <StateMessage kind="empty" afterReview={!isSample} />
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
      {!isSample && (
        <MyReports
          mine={mine}
          publicReports={reports}
          statusKnown={phase === 'ready'}
          onShow={showMine}
          onRemove={removeMine}
        />
      )}
      <StatCards cards={statCards} loading={phase === 'loading'} />
      <FilterBar
        statuses={filterStatuses}
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
