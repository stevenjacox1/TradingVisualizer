import { useSelector } from 'react-redux'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DrawdownCharts() {
  const result = useSelector((state) => state.simulation.result)

  if (!result) {
    return (
      <section className="chart-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <h2>Drawdown Profile</h2>
            <p>How deep drawdowns get as week count increases.</p>
          </div>
          <div className="chart-wrap placeholder-chart">
            <p style={{ color: 'var(--neon-purple)', textAlign: 'center', paddingTop: '5rem' }}>
              Run a simulation to view charts
            </p>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <h2>Final Equity Distribution</h2>
            <p>Frequency of ending balances across all simulations.</p>
          </div>
          <div className="chart-wrap placeholder-chart">
            <p style={{ color: 'var(--neon-purple)', textAlign: 'center', paddingTop: '5rem' }}>
              Run a simulation to view charts
            </p>
          </div>
        </article>
      </section>
    )
  }

  const drawdownData = result.series.drawdownSeries
  const distributionData = result.series.finalDistribution

  return (
    <section className="chart-grid">
      <article className="panel chart-panel">
        <div className="panel-heading">
          <h2>Drawdown Profile</h2>
          <p>How deep drawdowns get as week count increases.</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={drawdownData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 42, 56, 0.15)" />
              <XAxis dataKey="week" stroke="#1f5568" />
              <YAxis stroke="#1f5568" tickFormatter={(value) => `${Math.round(value)}%`} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend />
              <Line type="monotone" dataKey="median" stroke="#e76f51" strokeWidth={3} dot={false} name="Median" />
              <Line type="monotone" dataKey="avg" stroke="#457b9d" strokeWidth={2} dot={false} name="Average" />
              <Line type="monotone" dataKey="worst" stroke="#9d0208" strokeWidth={2} dot={false} name="95th Percentile" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <div className="panel-heading">
          <h2>Final Equity Distribution</h2>
          <p>Frequency of ending balances across all simulations.</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 42, 56, 0.15)" />
              <XAxis dataKey="label" interval={1} angle={-30} textAnchor="end" height={56} stroke="#1f5568" />
              <YAxis stroke="#1f5568" />
              <Tooltip />
              <Bar dataKey="count" fill="#2a9d8f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  )
}
