import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface AdminSession {
  user: { id: string; email: string }
  adminClient: ReturnType<typeof getSupabaseAdmin>
}

export async function withAdmin<T>(handler: (session: AdminSession) => Promise<T | NextResponse>): Promise<NextResponse | T> {
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getSupabaseAdmin()

  const { data: profile, error: profileError } = await adminClient
    .from('users')
    .select('is_admin, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return handler({ user: { id: user.id, email: profile.email || user.email || '' }, adminClient })
}

export function adminError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function adminSuccess(data?: Record<string, any>) {
  return NextResponse.json({ success: true, ...data })
}
