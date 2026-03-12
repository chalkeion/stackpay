import { NextRequest, NextResponse } from 'next/server'

const HIRO_BASE = 'https://api.testnet.hiro.so'
const SBTC_CONTRACT = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  const type    = req.nextUrl.searchParams.get('type') ?? 'balances' // 'balances' | 'transactions' | 'all'
  const limit   = req.nextUrl.searchParams.get('limit') ?? '20'
  const offset  = req.nextUrl.searchParams.get('offset') ?? '0'

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    const fetchBalances = async () => {
      const [stxRes, balancesRes] = await Promise.all([
        fetch(`${HIRO_BASE}/extended/v1/address/${address}/stx`, { next: { revalidate: 30 } }),
        fetch(`${HIRO_BASE}/extended/v1/address/${address}/balances`, { next: { revalidate: 30 } }),
      ])
      if (!stxRes.ok)      throw new Error(`STX API error: ${stxRes.status}`)
      if (!balancesRes.ok) throw new Error(`Balances API error: ${balancesRes.status}`)

      const [stxData, balancesData] = await Promise.all([
        stxRes.json(),
        balancesRes.json(),
      ])

      return {
        stx:  stxData.balance ?? '0',
        sbtc: balancesData.fungible_tokens?.[SBTC_CONTRACT]?.balance ?? '0',
      }
    }

    const fetchTransactions = async () => {
      const res = await fetch(
        `${HIRO_BASE}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`,
        { next: { revalidate: 30 } }
      )
      if (!res.ok) throw new Error(`Transactions API error: ${res.status}`)

      const data = await res.json()

      return {
        transactions: data.results.map((tx: any) => ({
          txId:      tx.tx_id,
          type:      tx.tx_type,
          status:    tx.tx_status,
          amount:    tx.token_transfer?.amount ?? '0',
          sender:    tx.sender_address,
          recipient: tx.token_transfer?.recipient_address ?? null,
          memo:      tx.token_transfer?.memo ?? null,
          fee:       tx.fee_rate,
          timestamp: tx.burn_block_time_iso,
        })),
        total:  data.total,
        limit:  data.limit,
        offset: data.offset,
      }
    }

    // Return based on type param
    if (type === 'balances') {
      return NextResponse.json(await fetchBalances())
    }

    if (type === 'transactions') {
      return NextResponse.json(await fetchTransactions())
    }

    if (type === 'all') {
      const [balances, transactions] = await Promise.all([
        fetchBalances(),
        fetchTransactions(),
      ])
      return NextResponse.json({ ...balances, ...transactions })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  } catch (e) {
    console.error('[/api/userAccount]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}