# Trading Monte Carlo Visualizer

A React + Redux website for running Monte Carlo-style trading simulations from form inputs and visualizing outcomes with charts.

## Features

- Parameter form for:
  - Win rate (%)
  - Risk-to-reward ratio
  - Risk per trade (% of account size)
  - Max drawdown threshold (%)
  - Trades per simulation
  - Number of simulations
  - Starting account balance
- Monte Carlo simulation engine using randomized trade sequences
- Equity envelope chart (P10, median, P90, average)
- Drawdown profile chart (median, average, high-percentile drawdown)
- Final equity distribution histogram
- Summary cards for key metrics
- Redux state management for inputs and simulation results

## Tech Stack

- React (Vite)
- Redux Toolkit + React Redux
- Recharts

## Run Locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
```
