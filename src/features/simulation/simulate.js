const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const average = (values) => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const percentile = (sortedValues, p) => {
  if (!sortedValues.length) return 0

  const index = (sortedValues.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)

  if (lower === upper) return sortedValues[lower]

  const weight = index - lower
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

const createDistribution = (values, bucketCount = 14) => {
  if (!values.length) return []

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return [
      {
        label: min.toFixed(0),
        count: values.length,
      },
    ]
  }

  const width = (max - min) / bucketCount
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    start: min + width * index,
    end: min + width * (index + 1),
    count: 0,
  }))

  for (const value of values) {
    let bucketIndex = Math.floor((value - min) / width)
    if (bucketIndex >= bucketCount) bucketIndex = bucketCount - 1
    buckets[bucketIndex].count += 1
  }

  return buckets.map((bucket) => ({
    label: `${bucket.start.toFixed(0)}-${bucket.end.toFixed(0)}`,
    count: bucket.count,
  }))
}

export const runMonteCarloSimulation = async (rawInput, randomGenerator = Math.random) => {
  const input = {
    startingBalance: toNumber(rawInput.startingBalance, 10000),
    winRate: toNumber(rawInput.winRate, 50),
    riskReward: toNumber(rawInput.riskReward, 2),
    riskPercent: toNumber(rawInput.riskPercent, 1),
    weeklyTrades: Math.max(1, Math.floor(toNumber(rawInput.weeklyTrades, 1))),
    maxDrawdownPercent: toNumber(rawInput.maxDrawdownPercent, 30),
    stopAtMaxDrawdown: Boolean(rawInput.stopAtMaxDrawdown),
    weeksPerSimulation: Math.max(1, Math.floor(toNumber(rawInput.weeksPerSimulation, 200))),
    numberOfSimulations: Math.max(10, Math.floor(toNumber(rawInput.numberOfSimulations, 500))),
  }

  const equityPaths = []
  const drawdownPaths = []
  const weeklyTradeBreakdownPaths = []

  for (let i = 0; i < input.numberOfSimulations; i += 1) {
    let equity = input.startingBalance
    let peak = equity
    let halted = false

    const equityPath = [equity]
    const drawdownPath = [0]
    const weeklyTradeBreakdownPath = [[]]

    for (let week = 1; week <= input.weeksPerSimulation; week += 1) {
      if (!halted) {
        const riskAmount = equity * (input.riskPercent / 100)
        let pnl = 0
        const weeklyTradeBreakdown = []

        for (let position = 0; position < input.weeklyTrades; position += 1) {
          const randomValue = await Promise.resolve(randomGenerator())
          const isWin = randomValue <= input.winRate / 100
          const positionPnl = isWin ? riskAmount * input.riskReward : -riskAmount
          pnl += positionPnl
          weeklyTradeBreakdown.push(positionPnl)
        }

        equity += pnl
        if (equity < 0) equity = 0

        peak = Math.max(peak, equity)
        const drawdown = peak === 0 ? 0 : ((peak - equity) / peak) * 100

        equityPath.push(equity)
        drawdownPath.push(drawdown)
        weeklyTradeBreakdownPath.push(weeklyTradeBreakdown)

        if (input.stopAtMaxDrawdown && drawdown >= input.maxDrawdownPercent) {
          halted = true
        }
      } else {
        equityPath.push(equity)
        drawdownPath.push(drawdownPath[drawdownPath.length - 1])
        weeklyTradeBreakdownPath.push([])
      }
    }

    equityPaths.push(equityPath)
    drawdownPaths.push(drawdownPath)
    weeklyTradeBreakdownPaths.push(weeklyTradeBreakdownPath)
  }

  const equitySeries = []
  const drawdownSeries = []

  for (let week = 0; week <= input.weeksPerSimulation; week += 1) {
    const stepEquity = equityPaths.map((path) => path[week]).sort((a, b) => a - b)
    const stepDrawdown = drawdownPaths.map((path) => path[week]).sort((a, b) => a - b)

    equitySeries.push({
      week,
      p10: percentile(stepEquity, 0.1),
      p50: percentile(stepEquity, 0.5),
      p90: percentile(stepEquity, 0.9),
      mean: average(stepEquity),
    })

    drawdownSeries.push({
      week,
      median: percentile(stepDrawdown, 0.5),
      avg: average(stepDrawdown),
      worst: percentile(stepDrawdown, 0.95),
    })
  }

  const finalEquity = equityPaths.map((path) => path[path.length - 1]).sort((a, b) => a - b)
  const maxDrawdowns = drawdownPaths.map((path) => Math.max(...path)).sort((a, b) => a - b)
  const unsortedFinalEquity = equityPaths.map((path) => path[path.length - 1])
  const medianFinal = percentile(finalEquity, 0.5)

  let medianPathIndex = 0
  let closestDistance = Number.POSITIVE_INFINITY
  for (let index = 0; index < unsortedFinalEquity.length; index += 1) {
    const distance = Math.abs(unsortedFinalEquity[index] - medianFinal)
    if (distance < closestDistance) {
      closestDistance = distance
      medianPathIndex = index
    }
  }

  const stats = {
    start: input.startingBalance,
    meanFinal: average(finalEquity),
    medianFinal,
    medianProfit: medianFinal - input.startingBalance,
    bestFinal: finalEquity[finalEquity.length - 1],
    worstFinal: finalEquity[0],
    profitablePercent:
      (finalEquity.filter((value) => value > input.startingBalance).length / finalEquity.length) * 100,
    hitDrawdownLimitPercent:
      (maxDrawdowns.filter((value) => value >= input.maxDrawdownPercent).length / maxDrawdowns.length) * 100,
    medianMaxDrawdown: percentile(maxDrawdowns, 0.5),
  }

  return {
    input,
    medianOutcome: {
      finalEquity: unsortedFinalEquity[medianPathIndex],
      equityPath: equityPaths[medianPathIndex],
      drawdownPath: drawdownPaths[medianPathIndex],
      weeklyTradeBreakdown: weeklyTradeBreakdownPaths[medianPathIndex],
    },
    series: {
      equitySeries,
      drawdownSeries,
      finalDistribution: createDistribution(finalEquity),
    },
    stats,
  }
}
