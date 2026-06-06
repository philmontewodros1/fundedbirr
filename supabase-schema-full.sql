-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  phone text,
  affiliate_code text unique not null,
  referred_by uuid references users(id),
  kyc_status text default 'pending',
  kyc_document_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- CHALLENGES
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  account_size text not null,
  virtual_balance numeric not null,
  price_etb numeric not null,
  phase integer default 1,
  status text default 'active',
  profit_target numeric not null,
  daily_loss_limit numeric not null,
  max_loss_limit numeric not null,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  amount_etb numeric not null,
  challenge_type text,
  telebirr_tx_ref text,
  telebirr_phone text,
  screenshot_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  submitted_at timestamptz default now()
);

-- PAYOUTS
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  challenge_id uuid not null references challenges(id),
  amount_etb numeric not null,
  method text not null,
  account_number text not null,
  status text default 'pending',
  requested_at timestamptz default now(),
  paid_at timestamptz
);

-- AFFILIATE COMMISSIONS
create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users(id),
  referred_user_id uuid not null references users(id),
  payment_id uuid not null references payments(id),
  commission_etb numeric not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- LEADERBOARD VIEW
create or replace view leaderboard as
select
  u.id,
  u.full_name,
  c.account_size,
  c.status as challenge_status,
  c.virtual_balance,
  c.profit_target,
  c.started_at,
  row_number() over (order by c.virtual_balance desc, c.started_at asc) as rank
from users u
join challenges c on c.user_id = u.id
where c.status in ('active', 'passed')
order by c.virtual_balance desc, c.started_at asc;

-- RLS: ENABLE ON ALL TABLES
alter table users enable row level security;
alter table challenges enable row level security;
alter table payments enable row level security;
alter table payouts enable row level security;
alter table affiliate_commissions enable row level security;

-- USERS: self-service
create policy "users select own" on users for select using (auth.uid() = id);
create policy "users insert own" on users for insert with check (auth.uid() = id);
create policy "users update own" on users for update using (auth.uid() = id);

-- CHALLENGES: see own only
create policy "challenges select own" on challenges for select using (auth.uid() = user_id);
create policy "challenges insert own" on challenges for insert with check (auth.uid() = user_id);
create policy "challenges update own" on challenges for update using (auth.uid() = user_id);

-- PAYMENTS: see own only
create policy "payments select own" on payments for select using (auth.uid() = user_id);
create policy "payments insert own" on payments for insert with check (auth.uid() = user_id);

-- PAYOUTS: see own only
create policy "payouts select own" on payouts for select using (auth.uid() = user_id);
create policy "payouts insert own" on payouts for insert with check (auth.uid() = user_id);

-- AFFILIATE: see own commissions
create policy "affiliate select own" on affiliate_commissions for select using (auth.uid() = referrer_id);

-- ADMINS: full access (check is_admin column)
create policy "admin all users" on users for all using (auth.jwt() ->> 'email' in (select email from users where is_admin = true));
create policy "admin all challenges" on challenges for all using (auth.jwt() ->> 'email' in (select email from users where is_admin = true));
create policy "admin all payments" on payments for all using (auth.jwt() ->> 'email' in (select email from users where is_admin = true));
create policy "admin all payouts" on payouts for all using (auth.jwt() ->> 'email' in (select email from users where is_admin = true));
create policy "admin all affiliate" on affiliate_commissions for all using (auth.jwt() ->> 'email' in (select email from users where is_admin = true));
