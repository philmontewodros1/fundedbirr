import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withAdmin(async ({ adminClient }) => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { count: totalTraders },
      { count: activeChallenges },
      { count: pendingPayments },
      { count: pendingPayouts },
      { count: pendingKyc },
      { count: approvedThisMonth },
    ] = await Promise.all([
      adminClient.from('users').select('*', { count: 'exact', head: true }),
      adminClient.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      adminClient.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminClient.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminClient.from('users').select('*', { count: 'exact', head: true }).not('kyc_document_url', 'is', null).neq('kyc_status', 'verified'),
      adminClient.from('payments').select('*', { count: 'exact', head: true }).gte('approved_at', firstOfMonth),
    ]);

    return NextResponse.json({
      totalTraders: totalTraders || 0,
      activeChallenges: activeChallenges || 0,
      pendingPayments: pendingPayments || 0,
      pendingPayouts: pendingPayouts || 0,
      pendingKyc: pendingKyc || 0,
      approvedThisMonth: approvedThisMonth || 0,
    });
  });
}
