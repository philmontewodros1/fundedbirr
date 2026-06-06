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

interface TelebirrPayment {
  id: string;
  user_id: string;
  amount_etb: number;
  challenge_type: string;
  telebirr_tx_ref: string;
  telebirr_phone: string;
  screenshot_url: string | null;
  status: string;
  submitted_at: string;
  users: { full_name: string; email: string } | null;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payments, setPayments] = useState<TelebirrPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'payments' | 'payouts'>('payments');

  async function load() {
    const [payoutRes, paymentRes] = await Promise.all([
      fetch('/api/admin/payouts'),
      fetch('/api/admin/telebirr-payments'),
    ]);
    if (payoutRes.ok) {
      const data = await payoutRes.json();
      setPayouts(data.payouts || []);
    }
    if (paymentRes.ok) {
      const data = await paymentRes.json();
      setPayments(data.payments || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approvePayment(id: string) {
    await fetch('/api/admin/telebirr-payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'approved' }),
    });
    load();
  }

  async function rejectPayment(id: string) {
    await fetch('/api/admin/telebirr-payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' }),
    });
    load();
  }

  async function updatePayoutStatus(id: string, status: string) {
    await fetch('/api/admin/payouts', {
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

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Payment Management
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button onClick={() => setTab('payments')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 500,
          background: tab === 'payments' ? 'var(--gold)' : 'var(--dark-2)',
          color: tab === 'payments' ? 'var(--dark)' : 'var(--text-muted)',
        }}>
          Telebirr Payments ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button onClick={() => setTab('payouts')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 500,
          background: tab === 'payouts' ? 'var(--gold)' : 'var(--dark-2)',
          color: tab === 'payouts' ? 'var(--dark)' : 'var(--text-muted)',
        }}>
          Payout Requests ({payouts.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {/* Telebirr Payments Tab */}
      {tab === 'payments' && (
        <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr 1fr 1.5fr',
            padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>Trader</div><div>Plan</div><div>Amount</div><div>Tx Ref</div><div>Phone</div><div>Actions</div>
          </div>
          {payments.map((p) => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr 1fr 1.5fr',
              padding: '0.85rem 1.25rem', fontSize: '0.85rem',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{p.users?.full_name || 'Unknown'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.users?.email || ''}</div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{p.challenge_type}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{p.amount_etb.toLocaleString()} ETB</div>
              <div>
                <code style={{ fontSize: '0.75rem', background: 'var(--dark-3)', padding: '2px 6px', borderRadius: '4px' }}>{p.telebirr_tx_ref}</code>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.telebirr_phone}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {p.status === 'pending' && (
                  <>
                    <button onClick={() => approvePayment(p.id)} style={{
                      background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                      border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                    }}>APPROVE ✓</button>
                    <button onClick={() => rejectPayment(p.id)} style={{
                      background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                      border: '1px solid rgba(255,107,107,0.2)', padding: '4px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                    }}>REJECT ✗</button>
                  </>
                )}
                {p.status === 'approved' && (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' }}>
                    Approved ✓
                  </span>
                )}
                {p.status === 'rejected' && (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>
                    Rejected ✗
                  </span>
                )}
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No Telebirr payments yet.</div>
          )}
        </div>
      )}

      {/* Payout Requests Tab */}
      {tab === 'payouts' && (
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
                    <button onClick={() => updatePayoutStatus(p.id, 'approved')} style={{
                      background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                      border: '1px solid rgba(29,122,74,0.25)', padding: '4px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                    }}>Approve</button>
                    <button onClick={() => updatePayoutStatus(p.id, 'rejected')} style={{
                      background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                      border: '1px solid rgba(255,107,107,0.2)', padding: '4px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                    }}>Reject</button>
                  </>
                )}
                {p.status === 'approved' && (
                  <button onClick={() => updatePayoutStatus(p.id, 'paid')} style={{
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
      )}
    </section>
  );
}
