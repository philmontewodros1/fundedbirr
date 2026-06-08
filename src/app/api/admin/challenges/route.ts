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
      .from('challenges')
      .select('*, users!inner(full_name, email)', { count: 'exact' })
      .order('started_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`account_size.ilike.%${search}%,users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`);
    }

    const { data: challenges, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return adminError(error.message, 500);
    }

    return NextResponse.json({ challenges, total: count || 0, page, limit });
  });
}

export async function PATCH(req: Request) {
  return withAdmin(async ({ adminClient, user: admin }) => {
    const { id, status } = await req.json();

    if (!id || !['passed', 'failed', 'active'].includes(status)) {
      return adminError('Invalid request');
    }

    const { data: challenge } = await adminClient
      .from('challenges')
      .select('*, users!inner(full_name, email)')
      .eq('id', id)
      .single();

    if (!challenge) {
      return adminError('Challenge not found', 404);
    }

    if (challenge.status === 'passed' || challenge.status === 'failed') {
      return adminError(`Challenge already ${challenge.status}`);
    }

    const update: Record<string, any> = { status };
    if (status === 'passed' || status === 'failed') {
      update.completed_at = new Date().toISOString();
      update.completed_by = admin.id;
    }

    const { error } = await adminClient
      .from('challenges')
      .update(update)
      .eq('id', id);

    if (error) {
      return adminError(error.message, 500);
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: `challenge_${status}`,
      targetType: 'challenge',
      targetId: id,
      details: {
        user_id: challenge.user_id,
        user_name: challenge.users?.full_name,
        account_size: challenge.account_size,
        phase: challenge.phase,
        previous_status: challenge.status,
      },
    });

    return adminSuccess({ status });
  });
}
