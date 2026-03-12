import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=blockstack,bitcoin&vs_currencies=usd',
    { next: { revalidate: 60 } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })

  const data = await res.json()

  return NextResponse.json({
    stx: data.blockstack.usd,
    btc: data.bitcoin.usd,
  })
}