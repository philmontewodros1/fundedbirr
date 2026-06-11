import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const login = req.headers.get('x-mt5-login')
    const secret = req.headers.get('x-report-secret')
    const { balance, equity } = await req.json()

    if (!login || !secret || balance == null || equity == null) {
      return NextResponse.json({ error: 'Missing x-mt5-login, x-report-secret, balance, or equity' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('mt5_login', login)
      .eq('mt5_report_secret', secret)
      .eq('status', 'active')
      .single()

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 })
    }

    const startBal = challenge.virtual_balance
    const dailyStart = challenge.daily_start_equity || startBal
    const today = new Date().toISOString().split('T')[0]
    const isNewDay = challenge.last_reset_date !== today

    const dailyDDPct = ((dailyStart - equity) / startBal) * 100
    const maxDDPct = ((startBal - equity) / startBal) * 100
    const profitPct = ((balance - startBal) / startBal) * 100

    let newStatus = challenge.status
    if (dailyDDPct >= 5) newStatus = 'failed'
    if (maxDDPct >= 10) newStatus = 'failed'
    if (profitPct >= 10 && (challenge.trading_days_count || 0) >= 5 && newStatus === 'active') newStatus = 'passed'

    await supabase.from('challenges').update({
      current_balance: balance,
      current_equity: equity,
      mt5_last_sync: new Date().toISOString(),
      last_reset_date: today,
      daily_start_equity: isNewDay ? equity : dailyStart,
      trading_days_count: isNewDay ? (challenge.trading_days_count || 0) + 1 : (challenge.trading_days_count || 0),
      status: newStatus,
      completed_at: newStatus !== challenge.status && newStatus !== 'active' ? new Date().toISOString() : challenge.completed_at,
    }).eq('id', challenge.id)

    if (newStatus !== challenge.status) {
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', challenge.user_id)
        .single()

      if (user) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'FundedBirr <noreply@fundedbirr.com>',
          to: user.email,
          subject: newStatus === 'passed' ? 'You Passed! — FundedBirr' : 'Challenge Update — FundedBirr',
          html: newStatus === 'passed'
            ? `<p>Hi ${user.full_name},</p><p>Congratulations! You hit the profit target. Request your payout at fundedbirr.com/dashboard/payout</p>`
            : `<p>Hi ${user.full_name},</p><p>Your challenge has ended due to exceeding drawdown limits. Start a new challenge at fundedbirr.com/pricing</p>`,
        })
      }
    }

    return NextResponse.json({
      received: true,
      status: newStatus,
      balance,
      equity,
      profit_pct: Math.round(profitPct * 100) / 100,
      daily_dd_pct: Math.round(dailyDDPct * 100) / 100,
      max_dd_pct: Math.round(maxDDPct * 100) / 100,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
