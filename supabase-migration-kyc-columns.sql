-- Add KYC tracking columns to users table
alter table users add column if not exists kyc_submitted_at timestamptz;
alter table users add column if not exists kyc_verified_at timestamptz;
alter table users add column if not exists kyc_verified_by uuid references users(id);

-- Create Supabase storage bucket for KYC documents (run separately in SQL Editor)
-- select storage.create_bucket('kyc-documents', 'public');
