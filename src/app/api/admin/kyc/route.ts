import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { data: users, error } = await adminClient
    .from('users')
    .select('id, full_name, email, kyc_status, kyc_document_url')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { adminClient } = auth;
  const { id, status } = await req.json();

  const { error } = await adminClient
    .from('users')
    .update({ kyc_status: status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
