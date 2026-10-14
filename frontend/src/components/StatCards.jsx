// Shows the three headline counts. The numbers are passed in by the page and
// are calculated from the reports that were actually loaded.
export default function StatCards({ total, pending, resolved, loading }) {
  const show = (n) => (loading ? '–' : n)
  return (
    <section className="stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="visually-hidden">
        Report counts
      </h2>
      <dl className="stats__grid" aria-busy={loading}>
        <div className="stat-card">
          <dt>Total reports</dt>
          <dd>{show(total)}</dd>
        </div>
        <div className="stat-card">
          <dt>Pending review</dt>
          <dd>{show(pending)}</dd>
        </div>
        <div className="stat-card">
          <dt>Resolved</dt>
          <dd>{show(resolved)}</dd>
        </div>
      </dl>
    </section>
  )
}
