import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: challenges, error } = await supabaseAdmin
    .from('challenges')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ challenges });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  const update: Record<string, any> = { status };
  if (status === 'passed' || status === 'failed') {
    update.completed_at = new Date().toISOString();
  }

  const supabaseAdmin2 = getSupabaseAdmin();
  const { error } = await supabaseAdmin2
    .from('challenges')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
