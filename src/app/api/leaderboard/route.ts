import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: leaderboard, error } = await supabaseAdmin
    .from('leaderboard')
    .select('*')
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = await Promise.all(
    (leaderboard || []).map(async (t: any) => {
      const { data: trades } = await supabaseAdmin
        .from('trades')
        .select('profit_loss')
        .eq('user_id', t.id)
        .eq('status', 'closed');

      let profitPct = 0;
      let winRate = 0;
      if (trades && trades.length > 0) {
        const totalProfit = trades.reduce((s: number, tr: any) => s + (tr.profit_loss || 0), 0);
        profitPct = t.virtual_balance > 0 ? Math.round((totalProfit / t.virtual_balance) * 10000) / 100 : 0;
        const wins = trades.filter((tr: any) => (tr.profit_loss || 0) > 0).length;
        winRate = Math.round((wins / trades.length) * 100);
      }
      return { ...t, profit_pct: profitPct, win_rate: winRate };
    }),
  );

  enriched.sort((a: any, b: any) => b.profit_pct - a.profit_pct);

  return NextResponse.json({
    traders: enriched.map((t: any, i: number) => ({ ...t, rank: i + 1 })),
  });
}
