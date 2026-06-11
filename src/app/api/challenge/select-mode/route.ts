import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { challenge_id, user_id, mode, mt5_server, mt5_login, mt5_investor_password, mt5_broker } = await req.json()

    if (!['web', 'mt5'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode. Choose web or mt5' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('user_id', user_id)
      .single()

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (challenge.trading_mode) {
      return NextResponse.json({ error: 'Trading mode already selected' }, { status: 400 })
    }

    if (mode === 'mt5') {
      if (!mt5_server || !mt5_login || !mt5_investor_password) {
        return NextResponse.json({ error: 'MT5 credentials required' }, { status: 400 })
      }

      const reportSecret = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

      await supabase.from('challenges').update({
        trading_mode: 'mt5',
        mt5_broker: mt5_broker || 'Exness',
        mt5_server,
        mt5_login: mt5_login.toString(),
        mt5_investor_password,
        mt5_report_secret: reportSecret,
        mt5_connected: true,
        current_balance: challenge.virtual_balance,
        current_equity: challenge.virtual_balance,
        daily_start_equity: challenge.virtual_balance,
        last_reset_date: new Date().toISOString().split('T')[0],
      }).eq('id', challenge_id)

      return NextResponse.json({ success: true, mode: 'mt5', message: 'MT5 mode activated.' })
    }

    await supabase.from('challenges').update({
      trading_mode: 'web',
      mt5_connected: false,
      current_balance: challenge.virtual_balance,
      current_equity: challenge.virtual_balance,
      daily_start_equity: challenge.virtual_balance,
      last_reset_date: new Date().toISOString().split('T')[0],
    }).eq('id', challenge_id)

    return NextResponse.json({ success: true, mode: 'web', message: 'Web terminal mode activated.' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
