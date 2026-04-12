import { SimulationForm } from './components/SimulationForm'
import { StatsCards } from './components/StatsCards'
import { EquityChart } from './components/EquityChart'
import { DrawdownCharts } from './components/DrawdownCharts'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <header className="hero-header">
        <p className="eyebrow">Trading Strategy Lab</p>
        <h1>Monte Carlo Risk Visualizer</h1>
        <p className="subtitle">
          Explore how win rate, risk-to-reward, account risk percentage, and drawdown limits can reshape long-run equity curves.
        </p>
      </header>

      <SimulationForm />
      <StatsCards />
      <EquityChart />
      <DrawdownCharts />
    </main>
  )
}

export default App
