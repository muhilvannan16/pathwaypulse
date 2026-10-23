// Shows the headline counts. The page decides WHICH counts to show and passes
// them in as `cards` ([{ label, value }]); the numbers are calculated from the
// reports that were actually loaded.
export default function StatCards({ cards, loading }) {
  const show = (n) => (loading ? '–' : n)
  return (
    <section className="stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="visually-hidden">
        Report counts
      </h2>
      <dl className="stats__grid" aria-busy={loading}>
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <dt>{card.label}</dt>
            <dd>{show(card.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
