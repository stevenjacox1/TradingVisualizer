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

## Deploy To Azure Static Web Apps

This repo is configured for Azure Static Web Apps with GitHub Actions.

### 1. Push To GitHub

Make sure this project is in a GitHub repository and your default branch is `main`.

### 2. Create The Static Web App Resource

1. In Azure Portal, create a new **Static Web App**.
2. Deployment source: **GitHub**.
3. Choose your repository and `main` branch.
4. Build details:
  - App location: `/`
  - API location: *(leave blank)*
  - Output location: `dist`

Azure will create the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in your GitHub repo.

### 3. Verify Workflow

The workflow file is:

- `.github/workflows/azure-static-web-apps.yml`

It builds and deploys on pushes to `main`.

### 4. Share Your App

After the workflow finishes, Azure provides a public URL like:

`https://<your-app-name>.azurestaticapps.net`

Use that URL to share your app.
