import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { sendPayoutApprovedEmail } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { data: payouts, error } = await adminClient
    .from('payouts')
    .select('*, users!inner(full_name, email)')
    .order('requested_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payouts });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { id, status, rejectionReason } = await req.json();

  const { data: payout } = await adminClient
    .from('payouts')
    .select('*, users!inner(full_name, email)')
    .eq('id', id)
    .single();

  if (!payout) {
    return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
  }

  const update: Record<string, any> = { status };
  if (status === 'paid') {
    update.paid_at = new Date().toISOString();
  }
  if (status === 'rejected' && rejectionReason) {
    update.rejection_reason = rejectionReason;
  }

  const { error } = await adminClient
    .from('payouts')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  return NextResponse.json({ success: true });
}
