-- Add rejection_reason column to payouts
alter table payouts add column if not exists 
  rejection_reason text;

-- Add trial account_size to challenges check constraint if needed
-- (account_size is text so no constraint change needed)

-- Update leaderboard view to include profit percentage and win rate
create or replace view leaderboard as
select
  u.id,
  u.full_name,
  c.account_size,
  c.status as challenge_status,
  c.virtual_balance,
  c.profit_target,
  c.started_at,
  coalesce(
    (
      select (sum(t.profit_loss) / nullif(c.virtual_balance, 0)) * 100
      from trades t
      where t.user_id = u.id and t.status = 'closed'
    ), 0
  ) as profit_pct,
  coalesce(
    (
      select 
        case when count(*) > 0 
          then (count(*) filter (where t.profit_loss > 0)::numeric / count(*)) * 100
          else 0
        end
      from trades t
      where t.user_id = u.id and t.status = 'closed'
    ), 0
  ) as win_rate
from users u
join challenges c on c.user_id = u.id
where c.status in ('active', 'passed')
order by profit_pct desc, c.started_at asc;
