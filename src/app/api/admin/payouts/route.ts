import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: payouts, error } = await supabaseAdmin
    .from('payouts')
    .select('*, users!inner(full_name, email)')
    .order('requested_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payouts });
}

export async function PATCH(req: Request) {
  const { id, status, rejectionReason } = await req.json();

  const update: Record<string, any> = { status };
  if (status === 'paid') {
    update.paid_at = new Date().toISOString();
  }
  if (status === 'rejected' && rejectionReason) {
    update.rejection_reason = rejectionReason;
  }

  const supabaseAdmin2 = getSupabaseAdmin();
  const { error } = await supabaseAdmin2
    .from('payouts')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
