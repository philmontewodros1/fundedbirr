-- FundedBirr Dual Trading Mode Migration
-- Run this in Supabase SQL Editor

-- Add trading_mode and MT5 fields to challenges table
alter table challenges add column if not exists trading_mode text check (trading_mode in ('web', 'mt5'));
alter table challenges add column if not exists mt5_broker text default 'Exness';
alter table challenges add column if not exists mt5_server text;
alter table challenges add column if not exists mt5_login text;
alter table challenges add column if not exists mt5_password text;
alter table challenges add column if not exists mt5_investor_password text;
alter table challenges add column if not exists mt5_connected boolean default false;
alter table challenges add column if not exists mt5_last_sync timestamp;

-- Add model column to challenges and payments
alter table challenges add column if not exists model text not null default '2step';
alter table payments add column if not exists model text not null default '2step';

-- MT5 account pool table
create table if not exists mt5_account_pool (
  id uuid primary key default gen_random_uuid(),
  broker text default 'Exness',
  server text not null,
  login text not null,
  password text not null,
  investor_password text not null,
  balance_usd numeric not null,
  challenge_size text not null,
  is_assigned boolean default false,
  assigned_to uuid references challenges(id),
  assigned_at timestamp,
  created_at timestamp default now()
);
