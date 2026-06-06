'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Challenge {
  id: string;
  user_id: string;
  account_size: string;
  virtual_balance: number;
  phase: number;
  status: string;
  current_profit: number;
  started_at: string;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/challenges');
    if (res.ok) {
      const data = await res.json();
      setChallenges(data.challenges || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/challenges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
        Challenges
      </h1>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.5fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Account</div><div>Balance</div><div>Phase</div><div>P&L</div><div>Status</div><div>Actions</div>
        </div>
        {challenges.map((c) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1.5fr',
            padding: '0.85rem 1.25rem', fontSize: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{c.account_size}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>${c.virtual_balance.toLocaleString()}</div>
            <div>Phase {c.phase}</div>
            <div style={{ color: c.current_profit >= 0 ? 'var(--green-light)' : '#ff6b6b' }}>
              {c.current_profit >= 0 ? '+' : ''}{c.current_profit}
            </div>
            <div>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px',
                background: c.status === 'active' ? 'rgba(201,145,42,0.1)' : 'rgba(29,122,74,0.15)',
                color: c.status === 'active' ? 'var(--accent)' : 'var(--green-light)',
              }}>
                {c.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {c.status === 'active' && (
                <>
                  <button onClick={() => updateStatus(c.id, 'passed')} style={{
                    background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                    border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  }}>Pass</button>
                  <button onClick={() => updateStatus(c.id, 'failed')} style={{
                    background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                    border: '1px solid rgba(255,107,107,0.2)', padding: '4px 12px',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  }}>Fail</button>
                </>
              )}
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No challenges yet.</div>
        )}
      </div>
    </section>
  );
}
