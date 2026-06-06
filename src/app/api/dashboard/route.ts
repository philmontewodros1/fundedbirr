import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: profile } = await admin
    .from('users')
    .select('full_name, email, affiliate_code')
    .eq('id', user.id)
    .single();

  const { data: activeChallenge } = await admin
    .from('challenges')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'passed'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: latestPayment } = await admin
    .from('payments')
    .select('status, amount_etb, challenge_type, submitted_at')
    .eq('user_id', user.id)
    .not('telebirr_tx_ref', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ profile, activeChallenge, latestPayment });
}
