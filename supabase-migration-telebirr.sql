-- Add Telebirr columns to payments table
alter table payments add column if not exists challenge_type text;
alter table payments add column if not exists telebirr_tx_ref text;
alter table payments add column if not exists telebirr_phone text;
alter table payments add column if not exists screenshot_url text;
alter table payments add column if not exists submitted_at timestamptz default now();
