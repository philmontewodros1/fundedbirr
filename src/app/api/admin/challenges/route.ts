import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { data: challenges, error } = await adminClient
    .from('challenges')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ challenges });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { id, status } = await req.json();

  const update: Record<string, any> = { status };
  if (status === 'passed' || status === 'failed') {
    update.completed_at = new Date().toISOString();
  }

  const { error } = await adminClient
    .from('challenges')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
