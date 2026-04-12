import { configureStore } from '@reduxjs/toolkit'
import simulationReducer from '../features/simulation/simulationSlice'

export const store = configureStore({
  reducer: {
    simulation: simulationReducer,
  },
})
