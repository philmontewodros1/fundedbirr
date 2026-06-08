import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendResetPasswordEmail } from '@/lib/resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check user exists in our database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('email', email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    // Generate recovery link using admin API (doesn't send email)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const resetLink = data.properties?.action_link || ''

    if (!resetLink) {
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    // Send email via Resend
    await sendResetPasswordEmail(
      email,
      user.full_name || email.split('@')[0],
      resetLink
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
