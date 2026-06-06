import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyChapaPayment, CHALLENGE_VIRTUAL, CHALLENGE_PRICES } from '@/lib/chapa';
import { sendChallengeEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const body = await req.json();
    const { tx_ref } = body;

    if (!tx_ref) {
      return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
    }

    const verification = await verifyChapaPayment(tx_ref);

    if (verification.status !== 'success') {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('chapa_tx_ref', tx_ref);

      return NextResponse.json({ status: 'failed' });
    }

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('chapa_tx_ref', tx_ref)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await supabaseAdmin
      .from('payments')
      .update({ status: 'success' })
      .eq('id', payment.id);

    const userId = payment.user_id;
    const challengeType = tx_ref.split('-')[2] || 'pro';

    const virtualBalance = CHALLENGE_VIRTUAL[challengeType] || 25000;
    const isSmall = challengeType === 'starter' || challengeType === 'standard';
    const profitTarget = isSmall ? 8 : 10;
    const dailyLoss = isSmall ? 4 : 5;
    const maxLoss = isSmall ? 8 : 10;
    const price = CHALLENGE_PRICES[challengeType] || 7000;

    const { error: challengeError } = await supabaseAdmin.from('challenges').insert({
      user_id: userId,
      account_size: challengeType,
      virtual_balance: virtualBalance,
      price_etb: price,
      phase: 1,
      status: 'active',
      profit_target: profitTarget,
      daily_loss_limit: dailyLoss,
      max_loss_limit: maxLoss,
    });

    if (challengeError) {
      console.error('Challenge creation error:', challengeError);
    }

    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('full_name, email, referred_by')
      .eq('id', userId)
      .single();

    if (userProfile) {
      sendChallengeEmail(userProfile.email, userProfile.full_name, challengeType);

      if (userProfile.referred_by) {
        const commission = Math.round(price * 0.1);

        const { error: commissionError } = await supabaseAdmin.from('affiliate_commissions').insert({
          referrer_id: userProfile.referred_by,
          referred_user_id: userId,
          payment_id: payment.id,
          commission_etb: commission,
          status: 'pending',
        });

        if (commissionError) {
          console.error('Commission creation error:', commissionError);
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
