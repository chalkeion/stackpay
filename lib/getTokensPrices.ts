export interface Prices {
  stx: number
  btc: number
}

export async function getTokenPrices(): Promise<Prices> {
  const res = await fetch('/api/price')
  if (!res.ok) throw new Error('Failed to fetch prices')
  return res.json()
}