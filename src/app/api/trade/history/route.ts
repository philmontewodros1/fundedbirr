// src/app/api/trade/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    const challenge_id = searchParams.get('challenge_id')

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(50)

    if (challenge_id) {
      query = query.eq('challenge_id', challenge_id)
    }

    const { data: trades, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ trades })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
