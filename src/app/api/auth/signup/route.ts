import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { email, password, fullName, phone, referredBy } = await req.json();

    if (!email || !password || !fullName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      const refCode = authData.user.id.slice(0, 8).toUpperCase();

      const insertData: Record<string, any> = {
        id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        affiliate_code: refCode,
      };

      if (referredBy) {
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('affiliate_code', referredBy)
          .maybeSingle();

        if (referrer) {
          insertData.referred_by = referrer.id;
        }
      }

      const { error: profileError } = await supabaseAdmin.from('users').insert(insertData);

      if (profileError) {
        console.error('Profile insert error:', profileError);
      }

      sendWelcomeEmail(email, fullName);
    }

    return NextResponse.json({ user: authData.user, session: authData.session });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
