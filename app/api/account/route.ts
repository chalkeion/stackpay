import { NextRequest, NextResponse } from 'next/server'

const HIRO_BASE = 'https://api.testnet.hiro.so'
const SBTC_CONTRACT = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    const [stxRes, balancesRes] = await Promise.all([
      // ✅ Was: /v2/accounts — wrong, returns hex balance
      fetch(`${HIRO_BASE}/extended/v1/address/${address}/stx`, {
        next: { revalidate: 30 },
      }),
      // ✅ Was: /v1/address — wrong path, 404s silently
      fetch(`${HIRO_BASE}/extended/v1/address/${address}/balances`, {
        next: { revalidate: 30 },
      }),
    ])

    // Surface HTTP errors instead of silently returning 0
    if (!stxRes.ok) throw new Error(`STX API error: ${stxRes.status}`)
    if (!balancesRes.ok) throw new Error(`Balances API error: ${balancesRes.status}`)

    const [stxData, balancesData] = await Promise.all([
      stxRes.json(),
      balancesRes.json(),
    ])

    return NextResponse.json({
      stx: stxData.balance ?? '0',
      sbtc: balancesData.fungible_tokens?.[SBTC_CONTRACT]?.balance ?? '0',
    })

  } catch (e) {
    console.error('[/api/account]', e)
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 })
  }
}