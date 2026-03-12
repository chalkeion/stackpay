export interface AccountBalances {
  stx: string
  sbtc: string
}

export async function fetchAccountBalances(address: string): Promise<AccountBalances> {
  const res = await fetch(`/api/userAccount?address=${address}&type=balances`)
  if (!res.ok) throw new Error('Failed to fetch balances')
  return res.json()
}

// Transactions
export async function fetchUserTransactions(address: string, limit = 20, offset = 0) {
  const res = await fetch(
    `/api/userAccount?address=${address}&type=transactions&limit=${limit}&offset=${offset}`
  )
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

// Both at once — useful for initial page load
export async function fetchAccountData(address: string) {
  const res = await fetch(`/api/userAccount?address=${address}&type=all`)
  if (!res.ok) throw new Error('Failed to fetch account data')
  return res.json()
}