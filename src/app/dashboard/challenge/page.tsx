'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Challenge {
  id: string;
  account_size: string;
  virtual_balance: number;
  phase: number;
  status: string;
  profit_target: number;
  daily_loss_limit: number;
  max_loss_limit: number;
  current_balance: number;
  trading_days_count: number;
  started_at: string;
}

export default function ChallengeDetailPage() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/dashboard');
      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setChallenge(data.activeChallenge);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <section style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  if (!challenge) {
    return (
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          No Active Challenge
        </h1>
        <Link href="/pricing" className="btn-primary no-underline px-6 py-2 rounded-lg">Buy a Challenge</Link>
      </section>
    );
  }

  const phaseRules = challenge.phase === 1 ? [
    `Reach ${challenge.profit_target}% profit target`,
    `Daily loss limit: ${challenge.daily_loss_limit}%`,
    `Max loss: ${challenge.max_loss_limit}%`,
    'Minimum 3 trading days required',
    'No time limit',
  ] : [
    'Reach 5% profit target',
    'Same drawdown rules apply',
    'Minimum 3 trading days',
    'Consistency rule: no single day >50% of total profit',
  ];

  const currentBalance = challenge.current_balance ?? challenge.virtual_balance;
  const profit = currentBalance - challenge.virtual_balance;
  const profitPct = Math.round((profit / challenge.virtual_balance) * 100);
  const drawdown = Math.max(0, (challenge.virtual_balance - currentBalance) / challenge.virtual_balance * 100);
  const tradingDays = challenge.trading_days_count ?? 0;

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Current Challenge
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {challenge.account_size.charAt(0).toUpperCase() + challenge.account_size.slice(1)} — ${challenge.virtual_balance.toLocaleString()} virtual
        · Phase {challenge.phase}
      </p>

      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
          Phase {challenge.phase} Rules
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {phaseRules.map((r, i) => (
            <li key={i} style={{
              padding: '0.5rem 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              fontSize: '0.85rem', color: 'var(--text-muted)',
            }}>
              ✓ {r}
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '1.5rem',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
          Progress
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <span>Profit Target</span>
            <span style={{ color: 'var(--accent)' }}>{profitPct}% / {challenge.profit_target}%</span>
          </div>
          <div style={{ background: 'var(--dark-3)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (profitPct / challenge.profit_target) * 100)}%`,
              height: '100%', background: profitPct >= challenge.profit_target ? 'var(--green-light)' : 'var(--gold)',
              borderRadius: '100px', transition: 'width 0.3s',
            }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>Account size: <span style={{ color: 'var(--text)' }}>${challenge.virtual_balance.toLocaleString()}</span></div>
          <div>Current P&L: <span style={{ color: profit >= 0 ? 'var(--green-light)' : '#ff6b6b' }}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)}</span></div>
          <div>Drawdown: <span style={{ color: 'var(--text)' }}>{drawdown.toFixed(2)}%</span></div>
          <div>Trading days: <span style={{ color: 'var(--text)' }}>{tradingDays}</span></div>
        </div>
      </div>
    </section>
  );
}
