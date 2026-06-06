// src/app/api/cron/daily-reset/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Get all active challenges that haven't been reset today
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, current_equity, virtual_balance')
      .eq('status', 'active')
      .neq('last_reset_date', today)

    if (error) throw error

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ message: 'No challenges to reset', count: 0 })
    }

    // Reset daily_start_equity for each challenge
    const updates = challenges.map((c) =>
      supabase
        .from('challenges')
        .update({
          daily_start_equity: c.current_equity || c.virtual_balance,
          last_reset_date: today
        })
        .eq('id', c.id)
    )

    await Promise.all(updates)

    return NextResponse.json({
      message: 'Daily reset complete',
      count: challenges.length,
      date: today
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
