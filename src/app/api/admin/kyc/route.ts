import { NextResponse } from 'next/server';
import { withAdmin, adminError, adminSuccess } from '@/lib/admin-guard';
import { logAdminAction } from '@/lib/admin-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAdmin(async ({ adminClient }) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('users')
      .select('id, full_name, email, kyc_status, kyc_document_url, kyc_submitted_at, kyc_verified_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      if (status === 'pending_review') {
        query = query.not('kyc_document_url', 'is', null).neq('kyc_status', 'verified');
      } else {
        query = query.eq('kyc_status', status);
      }
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

export async function PATCH(req: Request) {
  return withAdmin(async ({ adminClient, user: admin }) => {
    const { id, status } = await req.json();

    if (!id || !['verified', 'rejected', 'pending'].includes(status)) {
      return adminError('Invalid request');
    }

    const { data: targetUser } = await adminClient
      .from('users')
      .select('id, full_name, email, kyc_status')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return adminError('User not found', 404);
    }

    const { error } = await adminClient
      .from('users')
      .update({
        kyc_status: status,
        ...(status === 'verified' ? { kyc_verified_at: new Date().toISOString(), kyc_verified_by: admin.id } : {}),
      })
      .eq('id', id);

    if (error) {
      return adminError(error.message, 500);
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: `kyc_${status}`,
      targetType: 'user',
      targetId: id,
      details: {
        user_name: targetUser.full_name,
        user_email: targetUser.email,
        previous_status: targetUser.kyc_status,
      },
    });

    return adminSuccess({ status });
  });
}
