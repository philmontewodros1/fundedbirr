'use client';

import { useEffect, useState } from 'react';
import { PLAN_LABELS } from '@/lib/constants';

interface Trader {
  id: string;
  full_name: string;
  account_size: string;
  challenge_status: string;
  virtual_balance: number;
  profit_pct: number;
  win_rate: number;
  rank: number;
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32',
};

export default function LeaderboardPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setTraders(data.traders || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Live leaderboard</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '0.75rem',
      }}>
        Ethiopia&apos;s top traders
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Rankings update daily based on verified trading performance.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Loading...</div>
      ) : traders.length === 0 ? (
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.15)',
          borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏆</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            No traders on the leaderboard yet. Be the first!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Complete a challenge to appear here.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.15)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '3rem 1fr 1fr 1fr 1fr 1fr',
            padding: '1rem 1.5rem', fontSize: '0.72rem', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-muted)',
            borderBottom: '1px solid rgba(201,145,42,0.1)', fontWeight: 500,
          }}>
            <div>Rank</div><div>Trader</div><div>Profit</div><div>Win Rate</div><div>Account</div><div>Status</div>
          </div>
          {traders.map((t) => (
            <div key={t.id} className="hover-row" style={{
              display: 'grid', gridTemplateColumns: '3rem 1fr 1fr 1fr 1fr 1fr',
              padding: '1rem 1.5rem', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: '0.875rem',
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem',
                color: RANK_COLORS[t.rank] || 'var(--text-muted)',
              }}>
                {String(t.rank).padStart(2, '0')}
              </div>
              <div>{t.full_name || 'Trader'}</div>
              <div style={{ color: t.profit_pct >= 0 ? 'var(--green-light)' : '#ff6b6b', fontWeight: 500, fontFamily: "'Syne', sans-serif" }}>
                {t.profit_pct >= 0 ? '+' : ''}{t.profit_pct}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.win_rate}%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{PLAN_LABELS[t.account_size] || t.account_size}</div>
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: t.challenge_status === 'passed' ? 'rgba(29,122,74,0.15)' : 'rgba(201,145,42,0.1)',
                  color: t.challenge_status === 'passed' ? 'var(--green-light)' : 'var(--accent)',
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px',
                  border: t.challenge_status === 'passed' ? '1px solid rgba(29,122,74,0.25)' : '1px solid rgba(201,145,42,0.2)',
                }}>
                  {t.challenge_status === 'passed' ? '✓ Funded' : t.challenge_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
        Rankings calculated from closed trade performance.
      </p>
    </section>
  );
}
