-- Add model column to challenges and payments tables
alter table challenges add column if not exists model text not null default '2step';
alter table payments add column if not exists model text not null default '2step';
