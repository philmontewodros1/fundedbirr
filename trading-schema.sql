-- Run this in Supabase SQL Editor
-- FundedBirr Trading Engine Schema

-- TRADES TABLE
create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid references users(id),
  symbol text default 'XAUUSD',
  direction text not null check (direction in ('buy', 'sell')),
  lot_size numeric not null,
  entry_price numeric not null,
  exit_price numeric,
  sl numeric,
  tp numeric,
  profit_loss numeric default 0,
  status text default 'open' check (status in ('open', 'closed')),
  opened_at timestamp default now(),
  closed_at timestamp
);

-- Enable RLS
alter table trades enable row level security;

create policy "users see own trades" on trades
  for all using (auth.uid() = user_id);

-- Add trading engine columns to challenges table
alter table challenges add column if not exists current_balance numeric;
alter table challenges add column if not exists current_equity numeric;
alter table challenges add column if not exists daily_start_equity numeric;
alter table challenges add column if not exists last_reset_date date;
alter table challenges add column if not exists trading_days_count int default 0;

-- Initialize existing active challenges
update challenges
set
  current_balance = virtual_balance,
  current_equity = virtual_balance,
  daily_start_equity = virtual_balance,
  last_reset_date = current_date,
  trading_days_count = 0
where current_balance is null;
