import { createSlice } from '@reduxjs/toolkit'
import { runMonteCarloSimulation } from './simulate'

const initialInputs = {
  startingBalance: 10000,
  winRate: 45,
  riskReward: 2,
  riskPercent: 1,
  maxDrawdownPercent: 30,
  stopAtMaxDrawdown: true,
  tradesPerSimulation: 200,
  numberOfSimulations: 500,
}

const simulationSlice = createSlice({
  name: 'simulation',
  initialState: {
    inputs: initialInputs,
    result: runMonteCarloSimulation(initialInputs),
  },
  reducers: {
    updateInput: (state, action) => {
      const { field, value } = action.payload
      state.inputs[field] = value
    },
    runSimulation: (state) => {
      state.result = runMonteCarloSimulation(state.inputs)
    },
    resetInputs: (state) => {
      state.inputs = initialInputs
      state.result = runMonteCarloSimulation(initialInputs)
    },
  },
})

export const { updateInput, runSimulation, resetInputs } = simulationSlice.actions
export default simulationSlice.reducer
