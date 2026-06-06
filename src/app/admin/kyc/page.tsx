'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  full_name: string;
  email: string;
  kyc_status: string;
  kyc_document_url: string;
}

export default function AdminKycPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/kyc');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateKyc(id: string, status: string) {
    await fetch('/api/admin/kyc', {
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
        KYC Verification
      </h1>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Name</div><div>Email</div><div>Status</div><div>Actions</div>
        </div>
        {users.filter(u => u.kyc_status !== 'verified').map((u) => (
          <div key={u.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr',
            padding: '0.85rem 1.25rem', fontSize: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}>
            <div>{u.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
            <div>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px',
                background: u.kyc_status === 'pending' ? 'rgba(201,145,42,0.1)' : 'rgba(255,107,107,0.1)',
                color: u.kyc_status === 'pending' ? 'var(--accent)' : '#ff6b6b',
              }}>
                {u.kyc_status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {u.kyc_document_url && (
                <a href={u.kyc_document_url} target="_blank" rel="noopener noreferrer" style={{
                  background: 'rgba(201,145,42,0.1)', color: 'var(--accent)',
                  border: '1px solid rgba(201,145,42,0.2)', padding: '4px 12px',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  textDecoration: 'none',
                }}>View ID</a>
              )}
              <button onClick={() => updateKyc(u.id, 'verified')} style={{
                background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
              }}>Approve</button>
              <button onClick={() => updateKyc(u.id, 'rejected')} style={{
                background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                border: '1px solid rgba(255,107,107,0.2)', padding: '4px 12px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
              }}>Reject</button>
            </div>
          </div>
        ))}
        {users.filter(u => u.kyc_status !== 'verified').length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>All KYC documents processed.</div>
        )}
      </div>
    </section>
  );
}
