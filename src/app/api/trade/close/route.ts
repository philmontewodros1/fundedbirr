import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendChallengeFailedEmail, sendChallengePassedEmail } from '@/lib/resend'
import { PLAN_LABELS, getContractSize, MODEL_CONFIG } from '@/lib/constants'

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

    const { trade_id, exit_price } = await req.json()
    const user_id = user.id

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: trade, error: tradeErr } = await admin
      .from('trades')
      .select('*')
      .eq('id', trade_id)
      .eq('user_id', user_id)
      .eq('status', 'open')
      .single()

    if (tradeErr || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    const { data: challenge } = await admin
      .from('challenges')
      .select('*')
      .eq('id', trade.challenge_id)
      .single()

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    const contractSize = getContractSize(trade.symbol || 'XAUUSD')
    let pnl = 0
    if (trade.direction === 'buy') {
      pnl = (exit_price - trade.entry_price) * trade.lot_size * contractSize
    } else {
      pnl = (trade.entry_price - exit_price) * trade.lot_size * contractSize
    }
    pnl = Math.round(pnl * 100) / 100

    await admin
      .from('trades')
      .update({
        exit_price,
        profit_loss: pnl,
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', trade_id)

    const newBalance = (challenge.current_balance || challenge.virtual_balance) + pnl
    const newEquity = newBalance

    const today = new Date().toISOString().split('T')[0]
    let tradingDaysCount = challenge.trading_days_count || 0
    let dailyStartEquity = challenge.daily_start_equity || challenge.virtual_balance

    if (challenge.last_reset_date !== today) {
      tradingDaysCount += 1
      dailyStartEquity = newEquity
    }

    const challengeModel: string = challenge.model || '2step'
    const config = MODEL_CONFIG[challengeModel] || MODEL_CONFIG['2step']
    const startingBalance = challenge.virtual_balance
    let newStatus: string = challenge.status
    let newPhase: number = challenge.phase || 1
    let failReason = ''

    const dailyLoss = dailyStartEquity - newEquity
    const dailyDDPct = (dailyLoss / dailyStartEquity) * 100
    if (dailyDDPct >= config.maxDailyLossPct) {
      newStatus = 'failed'
      failReason = `Daily drawdown limit (${config.maxDailyLossPct}%) reached`
    }

    const totalLoss = startingBalance - newEquity
    const maxDDPct = (totalLoss / startingBalance) * 100
    if (maxDDPct >= config.maxLossPct) {
      newStatus = 'failed'
      failReason = `Maximum drawdown limit (${config.maxLossPct}%) reached`
    }

    if (newStatus !== 'failed') {
      const profitPct = ((newBalance - startingBalance) / startingBalance) * 100

      if (newPhase === 1 && profitPct >= config.phase1ProfitTarget) {
        const { data: trades } = await admin
          .from('trades')
          .select('profit_loss, closed_at')
          .eq('challenge_id', challenge.id)
          .eq('status', 'closed')
          .order('closed_at', { ascending: true })

        const consistencyThreshold = (config.consistencyPct || 50) / 100

        if (trades && trades.length >= config.minTradingDays) {
          const totalProfit = trades.reduce((sum, t) => sum + Math.max(0, t.profit_loss), 0)
          if (totalProfit > 0) {
            const dailyProfits: Record<string, number> = {}
            trades.forEach((t) => {
              if (t.profit_loss > 0) {
                const day = t.closed_at?.split('T')[0] || ''
                dailyProfits[day] = (dailyProfits[day] || 0) + t.profit_loss
              }
            })
            const maxDayProfit = Math.max(...Object.values(dailyProfits), 0)
            if (maxDayProfit / totalProfit > consistencyThreshold) {
              failReason = `Consistency rule failed — one day exceeded ${config.consistencyPct}% of total profits`
              newStatus = 'failed'
            }
          }
        } else {
          failReason = `Minimum ${config.minTradingDays} trading days required for Phase 1`
          newStatus = 'failed'
        }

        if (newStatus !== 'failed') {
          if (challengeModel === '1step') {
            newStatus = 'passed'
            await admin
              .from('challenges')
              .update({
                current_balance: newBalance,
                current_equity: newEquity,
                daily_start_equity: dailyStartEquity,
                last_reset_date: today,
                trading_days_count: tradingDaysCount,
                status: 'passed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', challenge.id)

            const { data: userData } = await admin
              .from('users')
              .select('email, full_name')
              .eq('id', user_id)
              .single()
            if (userData) {
              try {
                await sendChallengePassedEmail(
                  userData.email,
                  userData.full_name || 'Trader',
                  PLAN_LABELS[challenge.account_size] || challenge.account_size,
                  process.env.NEXT_PUBLIC_APP_URL || 'https://www.fundedbirr.com'
                )
              } catch (_) {}
            }

            return NextResponse.json({
              success: true, pnl, new_balance: newBalance, new_equity: newEquity,
              challenge_status: 'passed', phase: 1,
              fail_reason: '',
              daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
              max_dd_pct: Math.round(maxDDPct * 100) / 100,
              profit_pct: Math.round(profitPct * 100) / 100,
              trading_days: tradingDaysCount,
            })
          }

          newPhase = 2
          newStatus = 'active'
          await admin
            .from('challenges')
            .update({
              current_balance: challenge.virtual_balance,
              current_equity: challenge.virtual_balance,
              daily_start_equity: challenge.virtual_balance,
              last_reset_date: today,
              phase: 2,
              trading_days_count: 0,
              status: 'active',
            })
            .eq('id', challenge.id)

          return NextResponse.json({
            success: true,
            pnl,
            new_balance: challenge.virtual_balance,
            new_equity: challenge.virtual_balance,
            challenge_status: 'phase2',
            phase: 2,
            fail_reason: '',
            daily_dd_pct: 0,
            max_dd_pct: 0,
            profit_pct: 0,
            trading_days: 0,
          })
        }
      }

      if (newPhase === 2) {
        const { data: trades } = await admin
          .from('trades')
          .select('profit_loss, closed_at')
          .eq('challenge_id', challenge.id)
          .eq('status', 'closed')
          .order('closed_at', { ascending: true })

        const consistencyThreshold = (config.consistencyPct || 50) / 100

        if (trades && trades.length >= config.minTradingDays) {
          const totalProfit = trades.reduce((sum, t) => sum + Math.max(0, t.profit_loss), 0)
          if (totalProfit > 0) {
            const dailyProfits: Record<string, number> = {}
            trades.forEach((t) => {
              if (t.profit_loss > 0) {
                const day = t.closed_at?.split('T')[0] || ''
                dailyProfits[day] = (dailyProfits[day] || 0) + t.profit_loss
              }
            })
            const maxDayProfit = Math.max(...Object.values(dailyProfits), 0)
            if (maxDayProfit / totalProfit > consistencyThreshold) {
              failReason = `Consistency rule failed — one day exceeded ${config.consistencyPct}% of total profits`
              newStatus = 'failed'
            }
          }
        } else {
          failReason = `Minimum ${config.minTradingDays} trading days required for Phase 2`
          newStatus = 'failed'
        }

        if (newStatus !== 'failed' && config.phase2ProfitTarget && profitPct >= config.phase2ProfitTarget) {
          newStatus = 'passed'
          await admin
            .from('challenges')
            .update({
              current_balance: newBalance,
              current_equity: newEquity,
              daily_start_equity: dailyStartEquity,
              last_reset_date: today,
              trading_days_count: tradingDaysCount,
              status: 'passed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', challenge.id)

          const { data: userData } = await admin
            .from('users')
            .select('email, full_name')
            .eq('id', user_id)
            .single()
          if (userData) {
            try {
              await sendChallengePassedEmail(
                userData.email,
                userData.full_name || 'Trader',
                PLAN_LABELS[challenge.account_size] || challenge.account_size,
                process.env.NEXT_PUBLIC_APP_URL || 'https://www.fundedbirr.com'
              )
            } catch (_) {}
          }

          return NextResponse.json({
            success: true, pnl, new_balance: newBalance, new_equity: newEquity,
            challenge_status: 'passed', phase: 2,
            fail_reason: '', daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
            max_dd_pct: Math.round(maxDDPct * 100) / 100,
            profit_pct: Math.round(profitPct * 100) / 100,
            trading_days: tradingDaysCount,
          })
        }
      }
    }

    if (newStatus === 'failed') {
      await admin
        .from('trades')
        .update({
          exit_price,
          profit_loss: 0,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('challenge_id', challenge.id)
        .eq('status', 'open')

      await admin
        .from('challenges')
        .update({
          current_balance: newBalance,
          current_equity: newEquity,
          daily_start_equity: dailyStartEquity,
          last_reset_date: today,
          trading_days_count: tradingDaysCount,
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', challenge.id)

      const { data: userData } = await admin
        .from('users')
        .select('email, full_name')
        .eq('id', user_id)
        .single()
      if (userData) {
        try {
          await sendChallengeFailedEmail(
            userData.email,
            userData.full_name || 'Trader',
            PLAN_LABELS[challenge.account_size] || challenge.account_size,
            failReason,
            process.env.NEXT_PUBLIC_APP_URL || 'https://www.fundedbirr.com',
            tradingDaysCount,
            Math.round(dailyDDPct * 100) / 100,
            Math.round(maxDDPct * 100) / 100,
          )
        } catch (_) {}
      }

      return NextResponse.json({
        success: true, pnl, new_balance: newBalance, new_equity: newEquity,
        challenge_status: 'failed', phase: newPhase,
        fail_reason: failReason,
        daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
        max_dd_pct: Math.round(maxDDPct * 100) / 100,
        profit_pct: Math.round(((newBalance - startingBalance) / startingBalance) * 100 * 100) / 100,
        trading_days: tradingDaysCount,
      })
    }

    await admin
      .from('challenges')
      .update({
        current_balance: newBalance,
        current_equity: newEquity,
        daily_start_equity: dailyStartEquity,
        last_reset_date: today,
        trading_days_count: tradingDaysCount,
      })
      .eq('id', challenge.id)

    return NextResponse.json({
      success: true, pnl, new_balance: newBalance, new_equity: newEquity,
      challenge_status: 'active', phase: newPhase,
      fail_reason: '',
      daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
      max_dd_pct: Math.round(maxDDPct * 100) / 100,
      profit_pct: Math.round(((newBalance - startingBalance) / startingBalance) * 100 * 100) / 100,
      trading_days: tradingDaysCount,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
