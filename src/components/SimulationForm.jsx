import { useDispatch, useSelector } from 'react-redux'
import { resetInputs, runSimulation, updateInput } from '../features/simulation/simulationSlice'

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
    max: 20,
    step: 0.1,
  },
  {
    key: 'maxDrawdownPercent',
    label: 'Max drawdown threshold (%)',
    min: 1,
    max: 95,
    step: 0.5,
  },
  {
    key: 'tradesPerSimulation',
    label: 'Trades per simulation',
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

  const onInputChange = (field, event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    dispatch(updateInput({ field, value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    dispatch(runSimulation())
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
            }).format(inputs.startingBalance * (inputs.riskPercent / 100))}
          </div>
        </div>

        <label className="field checkbox-field" htmlFor="stopAtMaxDrawdown">
          <span>Stop simulation once max drawdown is hit</span>
          <input
            id="stopAtMaxDrawdown"
            type="checkbox"
            checked={inputs.stopAtMaxDrawdown}
            onChange={(event) => onInputChange('stopAtMaxDrawdown', event)}
          />
        </label>
      </div>

      <div className="button-row">
        <button type="submit" className="btn btn-primary">
          Run Monte Carlo
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => dispatch(resetInputs())}
        >
          Reset Defaults
        </button>
      </div>
    </form>
  )
}
