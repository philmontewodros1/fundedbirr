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
  current_balance: number;
  started_at: string;
  completed_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/dashboard/history');
      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      setChallenges(data.challenges || []);
      setPayouts(data.payouts || []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <section style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
        History
      </h1>

      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
        Past Challenges
      </h2>

      {challenges.length === 0 ? (
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem',
        }}>
          No past challenges yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
          {challenges.map((c) => (
            <div key={c.id} style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.account_size} — ${c.virtual_balance.toLocaleString()}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Phase {c.phase} · {new Date(c.started_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: (c.current_balance ?? c.virtual_balance) - c.virtual_balance >= 0 ? 'var(--green-light)' : '#ff6b6b', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
                  {((c.current_balance ?? c.virtual_balance) - c.virtual_balance) >= 0 ? '+' : ''}{((c.current_balance ?? c.virtual_balance) - c.virtual_balance).toFixed(2)}
                </span>
                <span style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px',
                  background: c.status === 'passed' ? 'rgba(29,122,74,0.15)' : c.status === 'active' ? 'rgba(201,145,42,0.1)' : 'rgba(255,107,107,0.1)',
                  color: c.status === 'passed' ? 'var(--green-light)' : c.status === 'active' ? 'var(--accent)' : '#ff6b6b',
                  border: `1px solid ${
                    c.status === 'passed' ? 'rgba(29,122,74,0.25)' : c.status === 'active' ? 'rgba(201,145,42,0.2)' : 'rgba(255,107,107,0.2)'
                  }`,
                }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
        Payout History
      </h2>

      {payouts.length === 0 ? (
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)',
        }}>
          No payouts yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payouts.map((p: any) => (
            <div key={p.id} style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.method}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(p.requested_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'var(--green-light)' }}>
                  {p.amount_etb.toLocaleString()} ETB
                </span>
                <span style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px',
                  background: p.status === 'paid' ? 'rgba(29,122,74,0.15)' : p.status === 'pending' ? 'rgba(201,145,42,0.1)' : 'rgba(255,107,107,0.1)',
                  color: p.status === 'paid' ? 'var(--green-light)' : p.status === 'pending' ? 'var(--accent)' : '#ff6b6b',
                  border: `1px solid ${
                    p.status === 'paid' ? 'rgba(29,122,74,0.25)' : p.status === 'pending' ? 'rgba(201,145,42,0.2)' : 'rgba(255,107,107,0.2)'
                  }`,
                }}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
