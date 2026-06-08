'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AdminStats {
  totalTraders: number
  activeChallenges: number
  pendingPayments: number
  pendingPayouts: number
  pendingKyc: number
  approvedThisMonth: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch('/api/stats/admin')
      .then(r => r.ok ? r.json() : null)
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  const ADMIN_LINKS = [
    { label: 'Traders', href: '/admin/traders', desc: `${stats?.totalTraders || 0} registered users`, color: '#4A90D9' },
    { label: 'Payments', href: '/admin/payouts', desc: `${stats?.pendingPayments || 0} pending approvals`, color: '#E8B84B' },
    { label: 'KYC', href: '/admin/kyc', desc: `${stats?.pendingKyc || 0} documents to review`, color: '#A865E8' },
    { label: 'Challenges', href: '/admin/challenges', desc: `${stats?.activeChallenges || 0} active challenges`, color: '#28A86A' },
  ];

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
        Admin Panel
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        FundedBirr administration dashboard
      </p>

      {/* Stats row */}
      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total Traders', value: stats.totalTraders, color: '#4A90D9' },
            { label: 'Active Challenges', value: stats.activeChallenges, color: '#28A86A' },
            { label: 'Pending Payments', value: stats.pendingPayments, color: '#E8B84B' },
            { label: 'Pending Payouts', value: stats.pendingPayouts, color: '#E8B84B' },
            { label: 'Pending KYC', value: stats.pendingKyc, color: '#A865E8' },
            { label: 'Approved (Month)', value: stats.approvedThisMonth, color: '#28A86A' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {ADMIN_LINKS.map((l) => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'var(--dark-2)', border: `1px solid ${l.color}22`,
              borderRadius: '14px', padding: '1.5rem', transition: 'all 0.2s',
            }} className="hover-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: l.color, flexShrink: 0,
                }} />
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                  {l.label}
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
