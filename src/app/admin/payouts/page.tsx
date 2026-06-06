'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Payout {
  id: string;
  user_id: string;
  amount_etb: number;
  method: string;
  account_number: string;
  status: string;
  requested_at: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/payouts');
    if (res.ok) {
      const data = await res.json();
      setPayouts(data.payouts || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/payouts`, {
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
        Payout Requests
      </h1>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
          padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>Amount</div><div>Method</div><div>Account</div><div>Status</div><div>Actions</div>
        </div>
        {payouts.map((p) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.5fr',
            padding: '0.85rem 1.25rem', fontSize: '0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{p.amount_etb.toLocaleString()} ETB</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.method}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.account_number}</div>
            <div>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px',
                background: p.status === 'paid' ? 'rgba(29,122,74,0.15)' : p.status === 'pending' ? 'rgba(201,145,42,0.1)' : 'rgba(255,107,107,0.1)',
                color: p.status === 'paid' ? 'var(--green-light)' : p.status === 'pending' ? 'var(--accent)' : '#ff6b6b',
              }}>
                {p.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {p.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(p.id, 'approved')} style={{
                    background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                    border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  }}>Approve</button>
                  <button onClick={() => updateStatus(p.id, 'rejected')} style={{
                    background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                    border: '1px solid rgba(255,107,107,0.2)', padding: '4px 12px',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  }}>Reject</button>
                </>
              )}
              {p.status === 'approved' && (
                <button onClick={() => updateStatus(p.id, 'paid')} style={{
                  background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                  border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                }}>Mark Paid</button>
              )}
            </div>
          </div>
        ))}
        {payouts.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payout requests yet.</div>
        )}
      </div>
    </section>
  );
}
