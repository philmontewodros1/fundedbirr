import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getChallengeConfig, PLAN_LABELS } from '@/lib/constants';
import { sendChallengeEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: payments, error } = await supabaseAdmin
    .from('payments')
    .select('*, users(full_name, email, referred_by)')
    .in('status', ['pending', 'approved', 'rejected'])
    .not('telebirr_tx_ref', 'is', null)
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payments });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (status === 'approved') {
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, users!inner(full_name, email, referred_by)')
      .eq('id', id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const challengeType = payment.challenge_type || 'pro';
    const config = getChallengeConfig(challengeType);

    const { error: challengeError } = await supabaseAdmin.from('challenges').insert({
      user_id: payment.user_id,
      account_size: challengeType,
      virtual_balance: config.virtualBalance,
      price_etb: config.price,
      phase: 1,
      status: 'active',
      profit_target: config.profitTarget,
      daily_loss_limit: config.dailyLoss,
      max_loss_limit: config.maxLoss,
    });

    if (challengeError) {
      console.error('Challenge creation error:', challengeError);
    }

    const userProfile = payment.users;
    if (userProfile) {
      try {
        await sendChallengeEmail(userProfile.email, userProfile.full_name, challengeType);
      } catch (e) {
        console.error('Email error:', e);
      }

      if (userProfile.referred_by) {
        const commission = Math.round(config.price * 0.1);
        const { error: commissionError } = await supabaseAdmin.from('affiliate_commissions').insert({
          referrer_id: userProfile.referred_by,
          referred_user_id: payment.user_id,
          payment_id: payment.id,
          commission_etb: commission,
          status: 'pending',
        });

        if (commissionError) {
          console.error('Commission error:', commissionError);
        }
      }
    }

    return NextResponse.json({ success: true, status: 'approved' });
  }

  if (status === 'rejected') {
    const { error } = await supabaseAdmin
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: 'rejected' });
  }
}
