import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [
      { count: traderCount },
      { data: paidPayouts },
      { count: activeCount },
    ] = await Promise.all([
      adminClient.from('users').select('*', { count: 'exact', head: true }),
      adminClient
        .from('payouts')
        .select('amount_etb')
        .eq('status', 'paid'),
      adminClient
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'passed']),
    ]);

    const totalPaid = paidPayouts?.reduce((sum, p) => sum + (p.amount_etb || 0), 0) || 0;

    return NextResponse.json({
      traders: traderCount || 0,
      totalPaidETB: totalPaid,
      activeChallenges: activeCount || 0,
    });
  } catch {
    return NextResponse.json({ traders: 0, totalPaidETB: 0, activeChallenges: 0 });
  }
}
