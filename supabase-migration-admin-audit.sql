-- Admin audit log table
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references users(id) not null,
  admin_email text not null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes for faster queries
create index if not exists idx_admin_audit_logs_admin_id on admin_audit_logs(admin_id);
create index if not exists idx_admin_audit_logs_created_at on admin_audit_logs(created_at desc);
create index if not exists idx_admin_audit_logs_action on admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_target_type on admin_audit_logs(target_type);
