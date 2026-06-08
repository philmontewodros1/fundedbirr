import { NextResponse } from 'next/server';
import { withAdmin, adminError, adminSuccess } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/admin-audit';
import { sendPayoutApprovedEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAdmin(async ({ adminClient }) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('payouts')
      .select('*, users!inner(full_name, email)', { count: 'exact' })
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`);
    }

    const { data: payouts, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return adminError(error.message, 500);
    }

    return NextResponse.json({ payouts, total: count || 0, page, limit });
  });
}

export async function PATCH(req: Request) {
  return withAdmin(async ({ adminClient, user: admin }) => {
    const { id, status, rejectionReason } = await req.json();

    if (!id || !['approved', 'rejected', 'paid'].includes(status)) {
      return adminError('Invalid request');
    }

    const { data: payout } = await adminClient
      .from('payouts')
      .select('*, users!inner(full_name, email)')
      .eq('id', id)
      .single();

    if (!payout) {
      return adminError('Payout not found', 404);
    }

    if (status === 'paid' && payout.status !== 'approved') {
      return adminError('Cannot mark unapproved payout as paid');
    }

    const VALID_TRANSITIONS: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['paid', 'rejected'],
      paid: [],
      rejected: [],
    };

    if (!VALID_TRANSITIONS[payout.status]?.includes(status)) {
      return adminError(`Cannot transition from ${payout.status} to ${status}`);
    }

    const update: Record<string, any> = { status };
    if (status === 'paid') {
      update.paid_at = new Date().toISOString();
      update.paid_by = admin.id;
    }
    if (status === 'approved') {
      update.approved_at = new Date().toISOString();
      update.approved_by = admin.id;
    }
    if (status === 'rejected') {
      if (rejectionReason) update.rejection_reason = rejectionReason;
      update.rejected_at = new Date().toISOString();
      update.rejected_by = admin.id;
    }

    const { error } = await adminClient
      .from('payouts')
      .update(update)
      .eq('id', id);

    if (error) {
      return adminError(error.message, 500);
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: `payout_${status}`,
      targetType: 'payout',
      targetId: id,
      details: {
        user_id: payout.user_id,
        user_name: payout.users?.full_name,
        amount_etb: payout.amount_etb,
        method: payout.method,
        previous_status: payout.status,
        rejection_reason: rejectionReason || null,
      },
    });

    if ((status === 'approved' || status === 'paid') && payout.users) {
      try {
        await sendPayoutApprovedEmail(
          payout.users.email,
          payout.users.full_name,
          payout.amount_etb,
          payout.method
        );
      } catch (_) {}
    }

    return adminSuccess({ status });
  });
}
