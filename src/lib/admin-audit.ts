import { getSupabaseAdmin } from './supabase-admin'

interface AuditEntry {
  adminId: string
  adminEmail: string
  action: string
  targetType: string
  targetId?: string
  details?: Record<string, any>
}

export async function logAdminAction(entry: AuditEntry) {
  try {
    const admin = getSupabaseAdmin()
    await admin.from('admin_audit_logs').insert({
      admin_id: entry.adminId,
      admin_email: entry.adminEmail,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId || null,
      details: entry.details || {},
    })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
