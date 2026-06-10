import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: NextRequest) {
  try {
    const { challenge_id, balance, equity, add_trading_day } = await req.json()
    const supabase = getAdmin()

    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single()

    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

    const startBal = challenge.virtual_balance
    const dailyStart = challenge.daily_start_equity || startBal
    const tradingDays = (challenge.trading_days_count || 0) + (add_trading_day ? 1 : 0)
    const today = new Date().toISOString().split('T')[0]

    const dailyDDPct = ((dailyStart - equity) / startBal) * 100
    const maxDDPct = ((startBal - equity) / startBal) * 100
    const profitPct = ((balance - startBal) / startBal) * 100

    let newStatus = challenge.status
    let failReason = ''

    if (dailyDDPct >= 5) { newStatus = 'failed'; failReason = `Daily drawdown ${dailyDDPct.toFixed(2)}% exceeded 5% limit` }
    if (maxDDPct >= 10) { newStatus = 'failed'; failReason = `Max drawdown ${maxDDPct.toFixed(2)}% exceeded 10% limit` }
    if (profitPct >= 10 && tradingDays >= 5 && newStatus === 'active') { newStatus = 'passed' }

    await supabase.from('challenges').update({
      current_balance: balance,
      current_equity: equity,
      trading_days_count: tradingDays,
      last_reset_date: today,
      daily_start_equity: challenge.last_reset_date !== today ? equity : dailyStart,
      mt5_last_sync: new Date().toISOString(),
      status: newStatus,
      completed_at: newStatus !== 'active' && newStatus !== challenge.status ? new Date().toISOString() : challenge.completed_at,
    }).eq('id', challenge_id)

    if (newStatus !== challenge.status) {
      const { data: user } = await supabase.from('users').select('email, full_name').eq('id', challenge.user_id).single()
      if (user) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        if (newStatus === 'failed') {
          await resend.emails.send({
            from: 'FundedBirr <noreply@fundedbirr.com>',
            to: user.email,
            subject: 'Challenge Update — FundedBirr',
            html: `<p>Hi ${user.full_name},</p><p>Your challenge has ended. Reason: ${failReason}</p><p>You can start a new challenge at fundedbirr.com/pricing</p>`
          })
        }
        if (newStatus === 'passed') {
          await resend.emails.send({
            from: 'FundedBirr <noreply@fundedbirr.com>',
            to: user.email,
            subject: 'You Passed! — FundedBirr',
            html: `<p>Hi ${user.full_name},</p><p>Congratulations! You hit the 10% profit target in ${tradingDays} trading days.</p><p>Request your ETB payout at fundedbirr.com/dashboard/payout</p>`
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      new_status: newStatus,
      daily_dd_pct: dailyDDPct.toFixed(2),
      max_dd_pct: maxDDPct.toFixed(2),
      profit_pct: profitPct.toFixed(2),
      trading_days: tradingDays,
      status_changed: newStatus !== challenge.status,
      fail_reason: failReason,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = getAdmin()
  const { data } = await supabase
    .from('challenges')
    .select(`*, users(full_name, email)`)
    .eq('trading_mode', 'mt5')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return NextResponse.json({ challenges: data || [] })
}
