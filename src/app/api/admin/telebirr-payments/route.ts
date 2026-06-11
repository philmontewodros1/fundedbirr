import { NextResponse } from 'next/server';
import { withAdmin, adminError, adminSuccess } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/admin-audit';
import { getChallengeConfig } from '@/lib/constants';
import { sendChallengeEmail } from '@/lib/resend';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAdmin(async ({ adminClient }) => {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status') || 'pending,approved,rejected';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('payments')
      .select('*, users!inner(full_name, email, referred_by)', { count: 'exact' })
      .not('telebirr_tx_ref', 'is', null)
      .order('submitted_at', { ascending: false });

    const statuses = statusFilter.split(',').filter(Boolean);
    if (statuses.length > 0) {
      query = query.in('status', statuses);
    }

    if (search) {
      query = query.or(`telebirr_tx_ref.ilike.%${search}%,telebirr_phone.ilike.%${search}%`);
    }

    const { data: payments, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return adminError(error.message, 500);
    }

    return NextResponse.json({ payments, total: count || 0, page, limit });
  });
}

export async function PATCH(req: Request) {
  return withAdmin(async ({ adminClient, user: admin }) => {
    const { id, status, rejectionReason } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return adminError('Invalid request');
    }

    const { data: payment } = await adminClient
      .from('payments')
      .select('*, users!inner(full_name, email, referred_by)')
      .eq('id', id)
      .single();

    if (!payment) {
      return adminError('Payment not found', 404);
    }

    if (payment.status !== 'pending') {
      return adminError(`Payment already ${payment.status}`);
    }

    const updateData: Record<string, any> = { status };
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = admin.id;
    }
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejected_by = admin.id;
    }

    const { error: updateError } = await adminClient
      .from('payments')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return adminError(updateError.message, 500);
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: status === 'approved' ? 'approve_payment' : 'reject_payment',
      targetType: 'payment',
      targetId: id,
      details: {
        challenge_type: payment.challenge_type,
        amount_etb: payment.amount_etb,
        user_id: payment.user_id,
        user_name: payment.users?.full_name,
        rejection_reason: rejectionReason || null,
      },
    });

    if (status === 'approved') {
      const challengeType = payment.challenge_type || 'pro';
      const challengeModel = payment.model || '2step';
      const config = getChallengeConfig(challengeType, challengeModel);

      // Try to auto-assign MT5 account from pool
      const { data: mt5Account } = await adminClient
        .from('mt5_account_pool')
        .select('*')
        .eq('is_assigned', false)
        .eq('challenge_size', challengeType)
        .limit(1)
        .maybeSingle();

      let mt5Fields: Record<string, any> = {};
      if (mt5Account) {
        mt5Fields = {
          trading_mode: 'mt5',
          mt5_broker: 'Exness',
          mt5_server: mt5Account.server,
          mt5_login: mt5Account.login,
          mt5_password: mt5Account.password,
          mt5_investor_password: mt5Account.investor_password,
          mt5_connected: true,
        };
      }

      const reportSecret = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

      const { data: newChallenge, error: challengeError } = await adminClient.from('challenges').insert({
        user_id: payment.user_id,
        account_size: challengeType,
        model: challengeModel,
        virtual_balance: config.virtualBalance,
        price_etb: config.price,
        phase: 1,
        status: 'active',
        profit_target: config.profitTarget,
        daily_loss_limit: config.dailyLoss,
        max_loss_limit: config.maxLoss,
        approved_by: admin.id,
        approved_at: new Date().toISOString(),
        mt5_report_secret: reportSecret,
        ...mt5Fields,
      }).select().single();

      if (challengeError) {
        console.error('Challenge creation error:', challengeError);
      }

      if (mt5Account && newChallenge) {
        await adminClient
          .from('mt5_account_pool')
          .update({ is_assigned: true, assigned_to: newChallenge.id, assigned_at: new Date().toISOString() })
          .eq('id', mt5Account.id);
      }

      const userProfile = payment.users;
      if (userProfile) {
        try {
          if (mt5Account) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'FundedBirr <noreply@fundedbirr.com>',
              to: userProfile.email,
              subject: `Your ${challengeType.toUpperCase()} MT5 Challenge Is Live!`,
              html: `
                <p>Hi ${userProfile.full_name},</p>
                <p>Your <strong>${challengeType.toUpperCase()}</strong> challenge has been activated with <strong>MT5 mode</strong>.</p>
                <p><strong>Your MT5 Account:</strong></p>
                <div style="background:#151810;padding:1rem;border-radius:8px;">
                  <p>Server: ${mt5Account.server}</p>
                  <p>Login: ${mt5Account.login}</p>
                  <p>Password: (your trading password from Exness)</p>
                  <p>Investor Password: ${mt5Account.investor_password}</p>
                </div>
                <p>Login to MT5 using the server and login above. Use your own Exness trading password to trade.</p>
                <p>Admin will sync your balance daily to track drawdown and profit targets.</p>
                <p><a href="https://fundedbirr.com/dashboard">Go to Dashboard</a></p>
              `,
            });
          } else {
            await sendChallengeEmail(userProfile.email, userProfile.full_name, challengeType, challengeModel);
          }
        } catch (e) {
          console.error('Email error:', e);
        }

        if (userProfile.referred_by) {
          const commission = Math.round(config.price * 0.1);
          const { error: commissionError } = await adminClient.from('affiliate_commissions').insert({
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
    }

    return adminSuccess({ status });
  });
}
