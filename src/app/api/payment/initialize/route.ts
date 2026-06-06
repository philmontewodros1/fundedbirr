import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { initializeChapaPayment, CHALLENGE_PRICES, CHALLENGE_VIRTUAL } from '@/lib/chapa';

export async function POST(req: Request) {
  try {
    const { challengeType } = await req.json();

    if (!CHALLENGE_PRICES[challengeType]) {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

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

    const { data: profile } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const txRef = `FB-${user.id.slice(0, 8)}-${challengeType}-${Date.now()}`;
    const amount = CHALLENGE_PRICES[challengeType];

    const result = await initializeChapaPayment({
      amount,
      email: profile?.email || user.email || '',
      firstName: profile?.full_name || 'Trader',
      txRef,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    });

    if (result.status === 'success') {
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: user.id,
        amount_etb: amount,
        chapa_tx_ref: txRef,
        status: 'pending',
      });

      if (paymentError) {
        console.error('Payment record error:', paymentError);
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Payment init error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
