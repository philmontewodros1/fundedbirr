-- Run this in Supabase SQL Editor after creating the tables

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
