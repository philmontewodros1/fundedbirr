import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ETB_RATE = 130; // approximate USD to ETB, update as needed

export async function POST(req: Request) {
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

  const { method, accountNumber, amount } = await req.json();

  if (!method || !accountNumber || !amount || amount < 500) {
    return NextResponse.json({ error: 'Invalid payout details. Minimum 500 ETB.' }, { status: 400 });
  }

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, status, virtual_balance, current_balance')
    .eq('user_id', user.id)
    .eq('status', 'passed')
    .maybeSingle();

  if (!challenge) {
    return NextResponse.json({ error: 'No funded challenge found. Pass both phases first.' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('kyc_status')
    .eq('id', user.id)
    .single();

  if (profile?.kyc_status !== 'verified') {
    return NextResponse.json({
      error: 'KYC verification required before payout. Complete KYC in your dashboard settings.',
    }, { status: 400 });
  }

  const grossProfit = (challenge.current_balance || challenge.virtual_balance) - challenge.virtual_balance;
  const maxPayoutUsd = grossProfit * 0.80;
  const maxPayoutEtb = Math.floor(maxPayoutUsd * ETB_RATE);

  if (amount > maxPayoutEtb) {
    return NextResponse.json({
      error: `Maximum payout is ${maxPayoutEtb.toLocaleString()} ETB (80% of your profit)`
    }, { status: 400 });
  }

  const { data: recentPayout } = await supabase
    .from('payouts')
    .select('requested_at')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (recentPayout) {
    return NextResponse.json({ error: 'You already have a pending payout request.' }, { status: 400 });
  }

  const { error: payoutError } = await supabase.from('payouts').insert({
    user_id: user.id,
    challenge_id: challenge.id,
    amount_etb: amount,
    method,
    account_number: accountNumber,
    status: 'pending',
  });

  if (payoutError) {
    console.error('Payout creation error:', payoutError);
    return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
