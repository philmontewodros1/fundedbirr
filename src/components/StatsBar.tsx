'use client';

import { useEffect, useState } from 'react';

export default function StatsBar() {
  const [stats, setStats] = useState({
    traders: 0,
    totalPaidETB: 0,
    activeChallenges: 0,
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const formatETB = (n: number) => {
    if (n === 0) return '—';
    if (n >= 1_000_000) return `ETB ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `ETB ${(n / 1_000).toFixed(0)}K`;
    return `ETB ${n.toLocaleString()}`;
  };

  const items = [
    { num: `${stats.traders > 0 ? stats.traders : 7}+`, label: 'Registered traders' },
    {
      num: stats.totalPaidETB > 0 ? formatETB(stats.totalPaidETB) : 'Telebirr & CBE',
      label: stats.totalPaidETB > 0 ? 'Total paid out' : 'Payout methods',
    },
    {
      num: stats.activeChallenges > 0 ? `${stats.activeChallenges}` : 'XAUUSD',
      label: stats.activeChallenges > 0 ? 'Active challenges' : 'Trading pair',
    },
    { num: '48h', label: 'Payout processing' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      border: '1px solid rgba(201,145,42,0.15)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'var(--dark-2)',
    }}>
      {items.map((s, i) => (
        <div key={i} style={{
          flex: 1,
          padding: '1.5rem 1.25rem',
          borderRight: i < 3 ? '1px solid rgba(201,145,42,0.1)' : 'none',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--accent)',
            display: 'block',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            {s.num}
          </span>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '4px',
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
