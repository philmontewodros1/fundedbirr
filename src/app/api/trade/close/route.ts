// src/app/api/trade/close/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { trade_id, exit_price, user_id } = await req.json()

    // Get trade
    const { data: trade, error: tradeErr } = await supabase
      .from('trades')
      .select('*')
      .eq('id', trade_id)
      .eq('user_id', user_id)
      .eq('status', 'open')
      .single()

    if (tradeErr || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Get challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', trade.challenge_id)
      .single()

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Calculate P&L
    // 1 lot XAUUSD = 100 oz, pip value ≈ $1 per 0.01 price move per 0.01 lot
    // Simplified: pnl = price_diff * lot_size * 100
    let pnl = 0
    if (trade.direction === 'buy') {
      pnl = (exit_price - trade.entry_price) * trade.lot_size * 100
    } else {
      pnl = (trade.entry_price - exit_price) * trade.lot_size * 100
    }
    pnl = Math.round(pnl * 100) / 100

    // Update trade
    await supabase
      .from('trades')
      .update({
        exit_price,
        profit_loss: pnl,
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', trade_id)

    // Update challenge balance/equity
    const newBalance = (challenge.current_balance || challenge.virtual_balance) + pnl
    const newEquity = newBalance

    // Check if new trading day — increment trading days
    const today = new Date().toISOString().split('T')[0]
    let tradingDaysCount = challenge.trading_days_count || 0
    let dailyStartEquity = challenge.daily_start_equity || challenge.virtual_balance

    if (challenge.last_reset_date !== today) {
      // New day — reset daily tracking
      tradingDaysCount += 1
      dailyStartEquity = newEquity
    }

    // === RULE ENGINE ===
    const startingBalance = challenge.virtual_balance
    let newStatus = 'active'
    let failReason = ''

    // Daily drawdown check (5%)
    const dailyLoss = dailyStartEquity - newEquity
    const dailyDDPct = (dailyLoss / startingBalance) * 100
    if (dailyDDPct >= 5) {
      newStatus = 'failed'
      failReason = 'Daily drawdown limit (5%) reached'
    }

    // Max drawdown check (10%)
    const totalLoss = startingBalance - newEquity
    const maxDDPct = (totalLoss / startingBalance) * 100
    if (maxDDPct >= 10) {
      newStatus = 'failed'
      failReason = 'Maximum drawdown limit (10%) reached'
    }

    // Profit target check (10%)
    const profitPct = ((newBalance - startingBalance) / startingBalance) * 100
    if (profitPct >= 10 && newStatus === 'active') {
      newStatus = 'passed'
    }

    // Update challenge
    await supabase
      .from('challenges')
      .update({
        current_balance: newBalance,
        current_equity: newEquity,
        daily_start_equity: dailyStartEquity,
        last_reset_date: today,
        trading_days_count: tradingDaysCount,
        status: newStatus === 'active' ? challenge.status : newStatus,
        completed_at: newStatus !== 'active' ? new Date().toISOString() : null
      })
      .eq('id', challenge.id)

    // If failed — close all open positions
    if (newStatus === 'failed') {
      await supabase
        .from('trades')
        .update({
          exit_price,
          profit_loss: 0,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('challenge_id', challenge.id)
        .eq('status', 'open')
    }

    return NextResponse.json({
      success: true,
      pnl,
      new_balance: newBalance,
      new_equity: newEquity,
      challenge_status: newStatus === 'active' ? challenge.status : newStatus,
      fail_reason: failReason,
      daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
      max_dd_pct: Math.round(maxDDPct * 100) / 100,
      profit_pct: Math.round(profitPct * 100) / 100,
      trading_days: tradingDaysCount
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
