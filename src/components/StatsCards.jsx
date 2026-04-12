import { useSelector } from 'react-redux'

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value) => `${value.toFixed(1)}%`

export function StatsCards() {
  const stats = useSelector((state) => state.simulation.result.stats)

  const cards = [
    { label: 'Median Final Equity', value: formatMoney(stats.medianFinal) },
    { label: 'Average Final Equity', value: formatMoney(stats.meanFinal) },
    { label: 'Best / Worst Final', value: `${formatMoney(stats.bestFinal)} / ${formatMoney(stats.worstFinal)}` },
    { label: 'Profitable Runs', value: formatPercent(stats.profitablePercent) },
    { label: 'Hit Drawdown Limit', value: formatPercent(stats.hitDrawdownLimitPercent) },
    { label: 'Median Max Drawdown', value: formatPercent(stats.medianMaxDrawdown) },
  ]

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article className="panel stat-card" key={card.label}>
          <h3>{card.label}</h3>
          <p>{card.value}</p>
        </article>
      ))}
    </section>
  )
}
