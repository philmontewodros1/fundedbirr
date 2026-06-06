// src/app/api/trade/positions/route.ts
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

    if (!user_id || !challenge_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .eq('challenge_id', challenge_id)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ trades })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
