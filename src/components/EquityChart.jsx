import { useSelector } from 'react-redux'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function EquityChart() {
  const data = useSelector((state) => state.simulation.result.series.equitySeries)

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h2>Equity Curve Envelope</h2>
        <p>Percentile bands from all Monte Carlo runs for each trade index.</p>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 42, 56, 0.15)" />
            <XAxis dataKey="trade" stroke="#1f5568" />
            <YAxis stroke="#1f5568" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
            <Tooltip formatter={(value) => moneyFormatter.format(value)} />
            <Legend />
            <Line type="monotone" dataKey="p10" stroke="#7da3b1" dot={false} strokeWidth={2} name="P10" />
            <Line type="monotone" dataKey="p50" stroke="#f08c00" dot={false} strokeWidth={3} name="Median" />
            <Line type="monotone" dataKey="p90" stroke="#2a9d8f" dot={false} strokeWidth={2} name="P90" />
            <Line type="monotone" dataKey="mean" stroke="#264653" dot={false} strokeWidth={2} name="Average" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
