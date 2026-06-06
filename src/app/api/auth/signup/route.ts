import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { email, password, fullName, phone, referredBy, isTrial } = await req.json();

    if (!email || !password || !fullName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
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

      if (isTrial) {
        const { error: trialError } = await supabaseAdmin.from('challenges').insert({
          user_id: authData.user.id,
          account_size: 'trial',
          virtual_balance: 1000,
          price_etb: 0,
          phase: 1,
          status: 'active',
          profit_target: 10,
          daily_loss_limit: 5,
          max_loss_limit: 10,
        });

        if (trialError) {
          console.error('Trial challenge error:', trialError);
        }
      }

      sendWelcomeEmail(email, fullName);
    }

    const { data: signIn } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    return NextResponse.json({
      user: authData.user,
      session: {
        access_token: signIn?.session?.access_token,
        refresh_token: signIn?.session?.refresh_token,
      },
      isTrial: !!isTrial,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
