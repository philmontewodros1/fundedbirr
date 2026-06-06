import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const [usersRes, challengesActiveRes, payoutsPaidRes, challengesPassedRes] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('challenges').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('payouts').select('amount_etb').eq('status', 'paid'),
    supabaseAdmin.from('challenges').select('id', { count: 'exact', head: true }).eq('status', 'passed'),
  ]);

  const totalPaidEtb = (payoutsPaidRes.data || []).reduce((sum, p) => sum + (p.amount_etb || 0), 0);

  return NextResponse.json({
    total_traders: usersRes.count || 0,
    active_challenges: challengesActiveRes.count || 0,
    total_paid_etb: totalPaidEtb,
    total_challenges_passed: challengesPassedRes.count || 0,
  });
}
