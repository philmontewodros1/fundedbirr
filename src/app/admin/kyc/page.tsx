'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

interface User {
  id: string; full_name: string; email: string;
  kyc_status: string; kyc_document_url: string;
  kyc_submitted_at?: string;
}

export default function AdminKycPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending_review');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirm, setConfirm] = useState<{ id: string; status: string; label: string; danger?: boolean } | null>(null);
  const limit = 50;

  async function load() {
    const params = new URLSearchParams({ status: filter, page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/kyc?${params}`);
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users || []);
      setTotal(d.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, filter, search]);

  async function updateKyc(id: string, status: string) {
    await fetch('/api/admin/kyc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setConfirm(null);
    load();
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.label || ''}
        message="This action will be recorded in the audit log."
        confirmLabel={confirm?.status === 'verified' ? 'Approve' : 'Reject'}
        danger={confirm?.danger}
        onConfirm={() => { if (confirm) updateKyc(confirm.id, confirm.status); }}
        onCancel={() => setConfirm(null)}
      />

      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        KYC Verification
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        {total} document{total !== 1 ? 's' : ''} pending review
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
          <option value="pending_review">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Not Submitted</option>
          <option value="">All</option>
        </select>
      </div>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 0.8fr 1fr 1.5fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Name</div><div>Email</div><div>Status</div><div>Submitted</div><div>Actions</div>
        </div>
        {users.map((u) => (
          <div key={u.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 0.8fr 1fr 1.5fr',
            padding: '0.85rem 1.25rem', fontSize: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 500 }}>{u.full_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
            <div>
              <StatusBadge status={u.kyc_status} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {u.kyc_submitted_at ? new Date(u.kyc_submitted_at).toLocaleDateString() : '-'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {u.kyc_document_url && (
                <a href={u.kyc_document_url} target="_blank" rel="noopener noreferrer" className="btn-yellow-sm">
                  View ID
                </a>
              )}
              {u.kyc_status !== 'verified' && u.kyc_document_url && (
                <button onClick={() => setConfirm({ id: u.id, status: 'verified', label: `Verify KYC for ${u.full_name}?` })} className="btn-green-sm">Approve</button>
              )}
              {u.kyc_status !== 'rejected' && u.kyc_document_url && (
                <button onClick={() => setConfirm({ id: u.id, status: 'rejected', label: `Reject KYC for ${u.full_name}?`, danger: true })} className="btn-red-sm">Reject</button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No KYC documents found.</div>
        )}
      </div>
      <Pagination page={page} total={total} limit={limit} setPage={setPage} />
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    verified: { bg: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' },
    rejected: { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
    pending: { bg: 'rgba(201,145,42,0.1)', color: 'var(--accent)' },
  };
  const c = colors[status] || colors.pending;
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
