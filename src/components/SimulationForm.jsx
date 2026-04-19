import { useDispatch, useSelector } from 'react-redux'
import { resetInputs, updateInput, runSimulationAsync } from '../features/simulation/simulationSlice'

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const getKellyPercent = (inputs) => {
  const p = toNumber(inputs.winRate, 0) / 100
  const b = toNumber(inputs.riskReward, 0)

  if (!Number.isFinite(p) || !Number.isFinite(b) || b <= 0) {
    return 0
  }

  return ((b * p - (1 - p)) / b) * 100
}

const getRiskOfRuinPercent = (inputs) => {
  const p = toNumber(inputs.winRate, 0) / 100
  const b = toNumber(inputs.riskReward, 0)
  const f = toNumber(inputs.riskPercent, 0) / 100
  const drawdownThreshold = toNumber(inputs.maxDrawdownPercent, 0) / 100
  const weeklyTrades = Math.max(1, Math.floor(toNumber(inputs.weeklyTrades, 1)))

  if (p <= 0 || p >= 1 || b <= 0 || f <= 0 || f >= 1 || drawdownThreshold <= 0 || drawdownThreshold >= 1) {
    return 100
  }

  const probabilityByWins = []
  const logReturns = []

  let outcomeProbability = (1 - p) ** weeklyTrades
  for (let wins = 0; wins <= weeklyTrades; wins += 1) {
    const lossCount = weeklyTrades - wins
    const growthFactor = 1 + f * (wins * b - lossCount)

    if (growthFactor <= 0) {
      return 100
    }

    probabilityByWins.push(outcomeProbability)
    logReturns.push(Math.log(growthFactor))

    if (wins < weeklyTrades) {
      outcomeProbability = (outcomeProbability * (weeklyTrades - wins) * p) / ((wins + 1) * (1 - p))
    }
  }

  const meanLogReturn = logReturns.reduce(
    (sum, value, index) => sum + value * probabilityByWins[index],
    0
  )

  const varianceLogReturn = logReturns.reduce((sum, value, index) => {
    const deviation = value - meanLogReturn
    return sum + probabilityByWins[index] * deviation * deviation
  }, 0)

  if (varianceLogReturn <= 0) {
    return meanLogReturn <= 0 ? 100 : 0
  }

  const barrierDistance = -Math.log(1 - drawdownThreshold)
  if (meanLogReturn <= 0) {
    return 100
  }

  const probability = Math.exp((-2 * meanLogReturn * barrierDistance) / varianceLogReturn)
  return Math.max(0, Math.min(1, probability)) * 100
}

const fields = [
  {
    key: 'startingBalance',
    label: 'Available Drawdown ($)',
    min: 100,
    max: 100000000,
    step: 100,
  },
  {
    key: 'winRate',
    label: 'Win rate (%)',
    min: 1,
    max: 99,
    step: 0.1,
  },
  {
    key: 'riskReward',
    label: 'Risk-to-reward ratio',
    min: 0.1,
    max: 20,
    step: 0.1,
  },
  {
    key: 'riskPercent',
    label: 'Risk per trade (% of account)',
    min: 0.1,
    step: 0.1,
  },
  {
    key: 'weeklyTrades',
    label: 'Number of weekly trades',
    min: 1,
    max: 20,
    step: 1,
  },
  {
    key: 'maxDrawdownPercent',
    label: 'Max drawdown threshold (%)',
    min: 1,
    max: 95,
    step: 0.5,
  },
  {
    key: 'weeksPerSimulation',
    label: 'Weeks per simulation',
    min: 1,
    max: 5000,
    step: 1,
  },
  {
    key: 'numberOfSimulations',
    label: 'Number of simulations',
    min: 100,
    max: 5000,
    step: 50,
  },
]

export function SimulationForm() {
  const dispatch = useDispatch()
  const inputs = useSelector((state) => state.simulation.inputs)
  const loading = useSelector((state) => state.simulation.loading)
  const error = useSelector((state) => state.simulation.error)

  const kellyPercent = getKellyPercent(inputs)
  const halfKellyPercent = kellyPercent / 2
  const riskPercent = toNumber(inputs.riskPercent, 0)
  const riskOfRuinPercent = getRiskOfRuinPercent(inputs)

  const kellyMessage =
    kellyPercent <= 0
      ? 'Negative Kelly: edge is unfavorable under current assumptions.'
      : riskPercent > kellyPercent
        ? 'Current risk is above full Kelly.'
        : riskPercent > halfKellyPercent
          ? 'Current risk is between half and full Kelly.'
          : 'Current risk is at or below half Kelly.'

  const riskOfRuinMessage =
    riskOfRuinPercent >= 70
      ? 'High ruin risk under current assumptions.'
      : riskOfRuinPercent >= 35
        ? 'Moderate ruin risk under current assumptions.'
        : 'Lower ruin risk under current assumptions.'

  const onInputChange = (field, event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    dispatch(updateInput({ field, value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    dispatch(runSimulationAsync(inputs))
  }

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-heading">
        <h2>Simulation Inputs</h2>
        <p>Adjust edge and risk assumptions, then regenerate random outcomes.</p>
      </div>

      <div className="field-grid">
        {fields.map((field) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            <input
              type="number"
              value={inputs[field.key]}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(event) => onInputChange(field.key, event)}
              disabled={loading}
              required
            />
          </label>
        ))}

        <div className="field">
          <span>Risk per trade ($ amount)</span>
          <div className="risk-amount">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(toNumber(inputs.startingBalance, 0) * (riskPercent / 100))}
          </div>
        </div>

        <div className="field kelly-widget" role="status" aria-live="polite">
          <span>Kelly Criterion</span>
          <div className="kelly-values">
            <p>
              Full Kelly: <strong>{kellyPercent.toFixed(1)}%</strong>
            </p>
            <p>
              Half Kelly: <strong>{halfKellyPercent.toFixed(1)}%</strong>
            </p>
            <p className="kelly-note">{kellyMessage}</p>
          </div>
        </div>

        <div className="field ruin-widget" role="status" aria-live="polite">
          <span>Risk of Ruin (Estimated)</span>
          <div className="ruin-values">
            <p>
              Ruin Probability: <strong>{riskOfRuinPercent.toFixed(1)}%</strong>
            </p>
            <p className="ruin-note">{riskOfRuinMessage}</p>
            <p className="ruin-note">Assumes independent outcomes, fixed fractional risk, and the drawdown threshold as ruin.</p>
          </div>
        </div>

        <label className="field radio-field" htmlFor="randomness-math">
          <span>Randomness Source</span>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="randomnessSource"
                value="math"
                checked={inputs.randomnessSource === 'math'}
                onChange={(event) => onInputChange('randomnessSource', { ...event, target: { ...event.target, value: event.target.value } })}
                disabled={loading}
              />
              Math.random() (fast)
            </label>
            <label>
              <input
                type="radio"
                name="randomnessSource"
                value="random.org"
                checked={inputs.randomnessSource === 'random.org'}
                onChange={(event) => onInputChange('randomnessSource', { ...event, target: { ...event.target, value: event.target.value } })}
                disabled={loading}
              />
              random.org (true random)
            </label>
          </div>
        </label>

        <label className="field checkbox-field" htmlFor="stopAtMaxDrawdown">
          <span>Stop simulation once max drawdown is hit</span>
          <input
            id="stopAtMaxDrawdown"
            type="checkbox"
            checked={inputs.stopAtMaxDrawdown}
            onChange={(event) => onInputChange('stopAtMaxDrawdown', event)}
            disabled={loading}
          />
        </label>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Running...' : 'Run Monte Carlo'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => dispatch(resetInputs())}
          disabled={loading}
        >
          Reset Defaults
        </button>
      </div>
    </form>
  )
}
