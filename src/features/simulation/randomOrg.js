const RANDOM_ORG_URL = 'https://api.random.org/json-rpc/4/invoke'

/**
 * Fetch random numbers from random.org
 * @param {number} count - How many random numbers to fetch (max 10000 per request)
 * @returns {Promise<number[]>} Array of random numbers between 0 and 1
 */
export async function fetchRandomNumbersFromOrg(count) {
  const apiKey = import.meta.env.VITE_RANDOM_ORG_API_KEY

  if (!apiKey) {
    throw new Error('Missing VITE_RANDOM_ORG_API_KEY. Add it to your .env file to use random.org.')
  }

  const payload = {
    jsonrpc: '2.0',
    method: 'generateDecimalFractions',
    params: {
      apiKey,
      n: count,
      decimalPlaces: 8,
    },
    id: 1,
  }

  try {
    const response = await fetch(RANDOM_ORG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Random.org error: ${data.error.message}`)
    }

    return data.result.random.data
  } catch (error) {
    console.error('Failed to fetch from random.org:', error)
    throw error
  }
}

/**
 * Create a random generator that fetches from random.org in batches
 * Caches fetched numbers and refills as needed.
 */
export function createRandomOrgGenerator() {
  let cache = []
  let batchSize = 1000

  return async function getRandomNumber() {
    if (cache.length === 0) {
      cache = await fetchRandomNumbersFromOrg(batchSize)
    }
    return cache.pop()
  }
}
