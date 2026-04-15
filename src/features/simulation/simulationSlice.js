import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { runMonteCarloSimulation } from './simulate'
import { createRandomOrgGenerator } from './randomOrg'

const initialInputs = {
  startingBalance: 10000,
  winRate: 45,
  riskReward: 2,
  riskPercent: 1,
  weeklyTrades: 1,
  maxDrawdownPercent: 30,
  stopAtMaxDrawdown: true,
  weeksPerSimulation: 200,
  numberOfSimulations: 500,
  randomnessSource: 'math', // 'math' or 'random.org'
}

export const runSimulationAsync = createAsyncThunk(
  'simulation/runSimulation',
  async (inputs) => {
    if (inputs.randomnessSource !== 'random.org') {
      return runMonteCarloSimulation(inputs, Math.random)
    }

    try {
      return await runMonteCarloSimulation(inputs, createRandomOrgGenerator())
    } catch (error) {
      console.warn('random.org unavailable, falling back to Math.random()', error)
      return runMonteCarloSimulation(inputs, Math.random)
    }
  }
)

const simulationSlice = createSlice({
  name: 'simulation',
  initialState: {
    inputs: initialInputs,
    result: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateInput: (state, action) => {
      const { field, value } = action.payload
      state.inputs[field] = value
    },
    resetInputs: (state) => {
      state.inputs = { ...initialInputs }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSimulationAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(runSimulationAsync.fulfilled, (state, action) => {
        state.result = action.payload
        state.loading = false
      })
      .addCase(runSimulationAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { updateInput, resetInputs } = simulationSlice.actions
export default simulationSlice.reducer
