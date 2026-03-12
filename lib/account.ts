export interface AccountBalances {
  stx: string
  sbtc: string
}

export async function fetchAccountBalances(
  address: string
): Promise<AccountBalances> {
  const res = await fetch(`/api/account?address=${address}`)

  if (!res.ok) throw new Error('Failed to fetch balances')

  return res.json()
}