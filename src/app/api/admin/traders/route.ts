import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { data: users, error } = await adminClient
    .from('users')
    .select('id, full_name, email, phone, kyc_status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}
