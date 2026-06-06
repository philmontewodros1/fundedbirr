import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CHALLENGE_PRICES } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { challengeType, telebirrTxRef, telebirrPhone, fullName, screenshotUrl } = await req.json();

    if (!CHALLENGE_PRICES[challengeType]) {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    if (!telebirrTxRef || !/^[A-Za-z0-9]{10}$/.test(telebirrTxRef)) {
      return NextResponse.json({ error: 'Transaction reference must be exactly 10 alphanumeric characters' }, { status: 400 });
    }

    if (!telebirrPhone || !/^(251|09)\d{8}$/.test(telebirrPhone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Phone must start with 251 or 09 and be 10-12 digits' }, { status: 400 });
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

    const amount = CHALLENGE_PRICES[challengeType];

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        challenge_type: challengeType,
        amount_etb: amount,
        telebirr_tx_ref: telebirrTxRef,
        telebirr_phone: telebirrPhone,
        screenshot_url: screenshotUrl || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Payment insert error:', error);
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    console.error('Telebirr submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
