'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Challenge {
  id: string; user_id: string; account_size: string; model?: string;
  virtual_balance: number; current_balance?: number; phase: number;
  status: string; started_at: string;
  users: { full_name: string; email: string } | null;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState<{ id: string; status: string; label: string; danger?: boolean } | null>(null);
  const limit = 50;

  async function load() {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.set('status', filter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/challenges?${params}`);
    if (res.ok) {
      const d = await res.json();
      setChallenges(d.challenges || []);
      setTotal(d.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, filter, search]);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/challenges', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setConfirm(null);
    load();
  }

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.label || ''}
        message="This action will be recorded in the audit log."
        confirmLabel={confirm?.status === 'passed' ? 'Mark as Passed' : 'Mark as Failed'}
        danger={confirm?.danger}
        onConfirm={() => { if (confirm) updateStatus(confirm.id, confirm.status); }}
        onCancel={() => setConfirm(null)}
      />

      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Challenges
      </h1>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search by account size, name, or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem', flex: 1, minWidth: '200px',
          }}
        />
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          style={{
            padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 1.5fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Trader</div><div>Account</div><div>Model</div><div>Phase</div><div>P&L</div><div>Status</div><div>Actions</div>
        </div>
        {challenges.map((c) => {
          const pnl = (c.current_balance ?? c.virtual_balance) - c.virtual_balance;
          const pnlPct = (pnl / c.virtual_balance) * 100;
          return (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 1.5fr',
              padding: '0.85rem 1.25rem', fontSize: '0.85rem',
              borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{c.users?.full_name || 'Unknown'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.users?.email || ''}</div>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>
                {(c.account_size || '').toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.model || '2step'}</div>
              <div>P{c.phase}</div>
              <div style={{ color: pnl >= 0 ? 'var(--green-light)' : '#ff6b6b', fontSize: '0.8rem', fontFamily: "'Syne', sans-serif" }}>
                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
              </div>
              <div><StatusBadge status={c.status} /></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {c.status === 'active' && (
                  <>
                    <button onClick={() => setConfirm({ id: c.id, status: 'passed', label: `Mark ${c.users?.full_name || ''}'s challenge as Passed?` })} className="btn-green-sm">Pass</button>
                    <button onClick={() => setConfirm({ id: c.id, status: 'failed', label: `Mark ${c.users?.full_name || ''}'s challenge as Failed?`, danger: true })} className="btn-red-sm">Fail</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {challenges.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No challenges found.</div>
        )}
      </div>
      <Pagination page={page} total={total} limit={limit} setPage={setPage} />
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(201,145,42,0.1)', color: 'var(--accent)' },
    passed: { bg: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' },
    failed: { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
  };
  const c = colors[status] || colors.active;
  return <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: c.bg, color: c.color, textTransform: 'capitalize' }}>{status}</span>;
}

function Pagination({ page, total, limit, setPage }: { page: number; total: number; limit: number; setPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' }}>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--dark-3)', color: page <= 1 ? 'var(--text-muted)' : 'var(--text)', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}>
        ← Prev
      </button>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--dark-3)', color: page >= totalPages ? 'var(--text-muted)' : 'var(--text)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}>
        Next →
      </button>
    </div>
  );
}
