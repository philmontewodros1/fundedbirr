import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, mt5_login, mt5_server, mt5_last_sync, users(full_name)')
      .eq('trading_mode', 'mt5')
      .eq('status', 'active')
      .or(`mt5_last_sync.is.null,mt5_last_sync.lt.${twentyHoursAgo}`)

    if (error) throw error

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ message: 'All MT5 challenges synced', count: 0 })
    }

    const listItems = challenges
      .map((c: any) => `- ${c.users?.full_name || 'Unknown'} | Login: ${c.mt5_login} | Last sync: ${c.mt5_last_sync ? Math.floor((Date.now() - new Date(c.mt5_last_sync).getTime()) / 3600000) + 'h ago' : 'Never'}`)
      .join('\n')

    const adminEmail = process.env.ADMIN_EMAIL || 'philmontewodros@gmail.com'

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'FundedBirr <noreply@fundedbirr.com>',
      to: adminEmail,
      subject: 'MT5 Sync Needed — FundedBirr',
      html: `
        <p>You have <strong>${challenges.length}</strong> active MT5 trader(s) who need syncing today:</p>
        <pre style="background:#151810;padding:1rem;border-radius:8px;font-size:0.85rem;">${listItems}</pre>
        <p><a href="https://fundedbirr.com/admin/mt5-pool" style="color:#C9912A;">Go to admin panel →</a></p>
      `,
    })

    return NextResponse.json({
      message: 'Reminder sent',
      count: challenges.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
