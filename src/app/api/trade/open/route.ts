// src/app/api/trade/open/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { challenge_id, direction, lot_size, entry_price, sl, tp, user_id, symbol } =
      await req.json()

    // Validate inputs
    if (!['buy', 'sell'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }
    if (lot_size < 0.01 || lot_size > 10) {
      return NextResponse.json(
        { error: 'Lot size must be between 0.01 and 10' },
        { status: 400 }
      )
    }
    if (!entry_price || entry_price <= 0) {
      return NextResponse.json({ error: 'Invalid entry price' }, { status: 400 })
    }

    // Verify challenge is active and belongs to user
    const { data: challenge, error: challengeErr } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('user_id', user_id)
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

    // Initialize balance/equity if first trade
    if (!challenge.current_balance) {
      await supabase
        .from('challenges')
        .update({
          current_balance: challenge.virtual_balance,
          current_equity: challenge.virtual_balance,
          daily_start_equity: challenge.virtual_balance,
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', challenge_id)
    }

    // Insert trade
    const { data: trade, error: tradeErr } = await supabase
      .from('trades')
      .insert({
        challenge_id,
        user_id,
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
