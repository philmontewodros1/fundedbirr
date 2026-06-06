import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, kyc_status, kyc_document_url')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  const supabaseAdmin2 = getSupabaseAdmin();
  const { error } = await supabaseAdmin2
    .from('users')
    .update({ kyc_status: status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
