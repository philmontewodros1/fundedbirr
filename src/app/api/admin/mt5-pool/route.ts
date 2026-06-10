import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = getAdmin()
  const { data } = await supabase
    .from('mt5_account_pool')
    .select('*, challenges(users(full_name))')
    .order('created_at', { ascending: false })
  return NextResponse.json({ accounts: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = getAdmin()
  const body = await req.json()
  const { server, login, password, investor_password, balance_usd, challenge_size } = body

  if (!server || !login || !password || !investor_password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('mt5_account_pool')
    .insert({ server, login, password, investor_password, balance_usd: Number(balance_usd), challenge_size, broker: 'Exness' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, account: data })
}
