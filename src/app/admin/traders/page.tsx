'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  kyc_status: string;
  created_at: string;
}

export default function AdminTradersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/traders');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
        Traders
      </h1>

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
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}>
            <div>{u.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.phone}</div>
            <div>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px',
                background: u.kyc_status === 'verified' ? 'rgba(29,122,74,0.15)' : u.kyc_status === 'rejected' ? 'rgba(255,107,107,0.1)' : 'rgba(201,145,42,0.1)',
                color: u.kyc_status === 'verified' ? 'var(--green-light)' : u.kyc_status === 'rejected' ? '#ff6b6b' : 'var(--accent)',
              }}>
                {u.kyc_status}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {new Date(u.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No traders registered yet.</div>
        )}
      </div>
    </section>
  );
}
