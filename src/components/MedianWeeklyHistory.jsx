import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function MedianWeeklyHistory() {
  const result = useSelector((state) => state.simulation.result)

  const rows = useMemo(() => {
    if (!result?.medianOutcome?.equityPath || !result?.medianOutcome?.drawdownPath) {
      return []
    }

    const equityPath = result.medianOutcome.equityPath
    const drawdownPath = result.medianOutcome.drawdownPath
    const weeklyTradeBreakdown = result.medianOutcome.weeklyTradeBreakdown ?? []

    return equityPath.map((equity, week) => {
      const previousEquity = week === 0 ? equity : equityPath[week - 1]
      const netChange = equity - previousEquity

      return {
        week,
        equity,
        netChange,
        drawdown: drawdownPath[week],
        weeklyTradeBreakdown: weeklyTradeBreakdown[week] ?? [],
      }
    })
  }, [result])

  if (!result) {
    return (
      <section className="panel history-panel">
        <div className="panel-heading">
          <h2>Median Outcome Weekly History</h2>
          <p>Week-by-week equity path for the run closest to median final equity.</p>
        </div>
        <div className="history-empty">Run a simulation to view median weekly history</div>
      </section>
    )
  }

  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <h2>Median Outcome Weekly History</h2>
        <p>
          Final equity: <strong>{moneyFormatter.format(result.medianOutcome.finalEquity)}</strong>
        </p>
      </div>

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Equity</th>
              <th>Net Change</th>
              <th>Weekly Trades</th>
              <th>Drawdown</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.week}>
                <td>{row.week}</td>
                <td>{moneyFormatter.format(row.equity)}</td>
                <td className={row.netChange > 0 ? 'positive' : row.netChange < 0 ? 'negative' : ''}>
                  {row.netChange === 0 ? '$0' : moneyFormatter.format(row.netChange)}
                </td>
                <td className="weekly-trades-breakdown">
                  {row.weeklyTradeBreakdown.length === 0 ? (
                    <span className="weekly-breakdown-empty">No weekly trades</span>
                  ) : (
                    <ul className="weekly-trade-breakdown-list">
                      {row.weeklyTradeBreakdown.map((weeklyTradePnl, weeklyTradeIndex) => (
                        <li
                          key={`${row.week}-${weeklyTradeIndex}`}
                          className={weeklyTradePnl > 0 ? 'positive' : weeklyTradePnl < 0 ? 'negative' : ''}
                        >
                          WT{weeklyTradeIndex + 1}: {moneyFormatter.format(weeklyTradePnl)}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{percentFormatter.format(row.drawdown / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}