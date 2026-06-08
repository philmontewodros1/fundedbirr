import { NextResponse } from 'next/server';
import { withAdmin, adminError } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAdmin(async ({ adminClient }) => {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const kycStatus = url.searchParams.get('kyc_status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('users')
      .select('id, full_name, email, phone, kyc_status, is_admin, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (kycStatus) {
      query = query.eq('kyc_status', kycStatus);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return adminError(error.message, 500);
    }

    return NextResponse.json({ users, total: count || 0, page, limit });
  });
}
