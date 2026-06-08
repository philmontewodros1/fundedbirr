'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string; full_name: string; email: string;
  phone: string; kyc_status: string; created_at: string;
  is_admin?: boolean;
}

export default function AdminTradersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  async function load() {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.set('kyc_status', filter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/traders?${params}`);
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users || []);
      setTotal(d.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, filter, search]);

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Traders
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        {total} registered trader{total !== 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search by name or email..."
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
          <option value="">All KYC Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Name</div><div>Email</div><div>Phone</div><div>KYC</div><div>Joined</div>
        </div>
        {users.map((u) => (
          <div key={u.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
            padding: '0.85rem 1.25rem', fontSize: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 500 }}>{u.full_name}{u.is_admin ? ' ⚙️' : ''}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.phone || '-'}</div>
            <div>
              <KycBadge status={u.kyc_status} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(u.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No traders found.</div>
        )}
      </div>
      <Pagination page={page} total={total} limit={limit} setPage={setPage} />
    </section>
  );
}

function KycBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    verified: { bg: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' },
    rejected: { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
    pending: { bg: 'rgba(201,145,42,0.1)', color: 'var(--accent)' },
  };
  const c = colors[status] || colors.pending;
  return <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: c.bg, color: c.color }}>{status || 'pending'}</span>;
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
