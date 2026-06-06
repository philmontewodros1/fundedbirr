'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Challenge {
  id: string;
  account_size: string;
  virtual_balance: number;
  phase: number;
  status: string;
  profit_target: number;
  daily_loss_limit: number;
  max_loss_limit: number;
  current_profit: number;
  current_drawdown: number;
  trading_days: number;
  started_at: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  affiliate_code: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setChallenge(data.activeChallenge);
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(201,145,42,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '1.5rem',
        }}>🔒</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
          letterSpacing: '-0.04em', marginBottom: '0.75rem',
        }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 2rem' }}>
          Sign in to view your challenge progress, account balance, trading metrics, and payout history.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/login" className="btn-primary no-underline px-8 py-3 rounded-lg">Sign In</Link>
          <Link href="/auth/register" className="btn-secondary no-underline px-8 py-3 rounded-lg">Create Account</Link>
        </div>
      </section>
    );
  }

  const profitPct = challenge ? Math.round((challenge.current_profit / challenge.virtual_balance) * 100) : 0;
  const drawdownPct = challenge ? Math.round(challenge.current_drawdown) : 0;

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Welcome, {profile.full_name || 'Trader'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Referral code: <span style={{ color: 'var(--accent)', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{profile.affiliate_code}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
          color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '8px',
          cursor: 'pointer', fontSize: '0.85rem',
        }}>
          Sign Out
        </button>
      </div>

      {challenge ? (
        <>
          {/* Metric Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '2rem',
          }}>
            {[
              { label: 'Current Balance', val: `$${challenge.virtual_balance.toLocaleString()}` },
              { label: 'Daily P&L', val: `$${challenge.current_profit >= 0 ? '+' : ''}${challenge.current_profit}`, pos: challenge.current_profit >= 0 },
              { label: 'Trading Days', val: `${challenge.trading_days} / 3` },
              { label: 'Daily Drawdown', val: `${drawdownPct}% / ${challenge.daily_loss_limit}%` },
              { label: 'Max Drawdown', val: `${drawdownPct}% / ${challenge.max_loss_limit}%` },
            ].map((m) => (
              <div key={m.label} style={{
                background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{m.label}</div>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'pos' in m ? (m as any).pos ? 'var(--green-light)' : 'var(--text)' : 'var(--text)',
                }}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* Phase Progress */}
          <div style={{
            background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem',
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
              Challenge Progress
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span>Phase 1 — Evaluation</span>
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
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span>Phase 2 — Verification</span>
                  <span style={{ color: challenge.phase >= 2 ? 'var(--green-light)' : 'var(--text-muted)' }}>
                    {challenge.phase >= 2 ? 'Active' : 'Locked'}
                  </span>
                </div>
                <div style={{ background: 'var(--dark-3)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: challenge.phase >= 2 ? '100%' : '0%',
                    height: '100%', background: 'var(--green)',
                    borderRadius: '100px',
                  }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span>Funded Trader</span>
                  <span style={{ color: challenge.status === 'passed' ? 'var(--green-light)' : 'var(--text-muted)' }}>
                    {challenge.status === 'passed' ? '✓ Funded' : 'Pending'}
                  </span>
                </div>
                <div style={{ background: 'var(--dark-3)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: challenge.status === 'passed' ? '100%' : '0%',
                    height: '100%', background: 'var(--green-light)',
                    borderRadius: '100px',
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '1.5rem',
            }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>Trading Stats</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Win rate, RR ratio, best session — coming soon with MT5 integration.
              </div>
            </div>

            {challenge.status === 'passed' && (
              <div style={{
                background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.3)',
                borderRadius: '14px', padding: '1.5rem', textAlign: 'center',
              }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--gold-light)' }}>
                  Request Payout
                </h3>
                <Link href="/dashboard/payout" className="btn-primary no-underline px-6 py-2 rounded-lg" style={{ display: 'inline-block' }}>
                  Request Now
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            No Active Challenge
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            You don&apos;t have an active challenge. Purchase one to start trading.
          </p>
          <Link href="/pricing" className="btn-primary no-underline px-8 py-3 rounded-lg" style={{ display: 'inline-block' }}>
            Buy a Challenge →
          </Link>
        </div>
      )}
    </section>
  );
}
