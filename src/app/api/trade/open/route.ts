import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const MAX_LOT_BY_ACCOUNT: Record<string, number> = {
  '10000': 2.0,
  '25000': 5.0,
  '50000': 10.0,
  '100000': 20.0,
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { challenge_id, direction, lot_size, entry_price, sl, tp, symbol } =
      await req.json()

    if (!['buy', 'sell'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }
    if (!entry_price || entry_price <= 0) {
      return NextResponse.json({ error: 'Invalid entry price' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: challenge, error: challengeErr } = await admin
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('user_id', user.id)
      .single()

    if (challengeErr || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }
    if (challenge.status !== 'active') {
      return NextResponse.json(
        { error: `Challenge is ${challenge.status}` },
        { status: 400 }
      )
    }

    const maxLot = MAX_LOT_BY_ACCOUNT[String(challenge.virtual_balance)] || 1.0
    if (lot_size < 0.01 || lot_size > maxLot) {
      return NextResponse.json({
        error: `Lot size must be between 0.01 and ${maxLot} for this account`
      }, { status: 400 })
    }

    if (!challenge.current_balance) {
      await admin
        .from('challenges')
        .update({
          current_balance: challenge.virtual_balance,
          current_equity: challenge.virtual_balance,
          daily_start_equity: challenge.virtual_balance,
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', challenge_id)
    }

    const { data: trade, error: tradeErr } = await admin
      .from('trades')
      .insert({
        challenge_id,
        user_id: user.id,
        symbol: symbol || 'XAUUSD',
        direction,
        lot_size,
        entry_price,
        sl: sl || null,
        tp: tp || null,
        status: 'open'
      })
      .select()
      .single()

    if (tradeErr) {
      return NextResponse.json({ error: tradeErr.message }, { status: 500 })
    }

    return NextResponse.json({ trade, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
