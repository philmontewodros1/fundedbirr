'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Payment {
  id: string; user_id: string; amount_etb: number; challenge_type: string;
  model?: string; telebirr_tx_ref: string; telebirr_phone: string;
  screenshot_url: string | null; status: string; submitted_at: string;
  users: { full_name: string; email: string } | null;
}

interface Payout {
  id: string; user_id: string; amount_etb: number; method: string;
  account_number: string; status: string; requested_at: string;
  users: { full_name: string; email: string } | null;
}

export default function AdminPayoutsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'payments' | 'payouts'>('payments');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState<{ action: string; id: string; label: string; danger?: boolean } | null>(null);

  // Search & filter
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('pending,approved,rejected');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutFilter, setPayoutFilter] = useState('');

  // Pagination
  const [paymentPage, setPaymentPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const limit = 50;

  async function loadPayments() {
    const params = new URLSearchParams({
      status: paymentFilter,
      page: String(paymentPage),
      limit: String(limit),
    });
    if (paymentSearch) params.set('search', paymentSearch);
    const res = await fetch(`/api/admin/telebirr-payments?${params}`);
    if (res.ok) {
      const d = await res.json();
      setPayments(d.payments || []);
      setPaymentTotal(d.total || 0);
    }
  }

  async function loadPayouts() {
    const params = new URLSearchParams({
      page: String(payoutPage),
      limit: String(limit),
    });
    if (payoutFilter) params.set('status', payoutFilter);
    if (payoutSearch) params.set('search', payoutSearch);
    const res = await fetch(`/api/admin/payouts?${params}`);
    if (res.ok) {
      const d = await res.json();
      setPayouts(d.payouts || []);
      setPayoutTotal(d.total || 0);
    }
  }

  useEffect(() => { loadPayments(); }, [paymentPage, paymentFilter, paymentSearch]);
  useEffect(() => { loadPayouts(); }, [payoutPage, payoutFilter, payoutSearch]);
  useEffect(() => { setLoading(false); }, []);

  async function doAction(id: string, status: string, endpoint: string) {
    const body: Record<string, any> = { id, status };
    if (status === 'rejected' && rejectReason[id]) {
      body.rejectionReason = rejectReason[id];
    }
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setConfirm(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error || `Request failed (${res.status})`);
      return;
    }
    setActionError('');
    if (endpoint.includes('telebirr')) loadPayments();
    else loadPayouts();
  }

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const pendingPayoutCount = payouts.filter(p => p.status === 'pending').length;

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.label || ''}
        message="This action will be recorded in the audit log."
        confirmLabel={confirm?.action || ''}
        danger={confirm?.danger}
        onConfirm={() => {
          if (!confirm) return;
          const [ep, action] = confirm.action.split('|');
          doAction(confirm.id, action, ep);
        }}
        onCancel={() => setConfirm(null)}
      />

      <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Admin
      </Link>

      {actionError && (
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {actionError}
        </div>
      )}

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Payment Management
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button onClick={() => setTab('payments')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 500,
          background: tab === 'payments' ? 'var(--gold)' : 'var(--dark-2)',
          color: tab === 'payments' ? 'var(--dark)' : 'var(--text-muted)',
        }}>
          Telebirr Payments {pendingCount > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: '100px', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '4px' }}>{pendingCount}</span>}
        </button>
        <button onClick={() => setTab('payouts')} style={{
          padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 500,
          background: tab === 'payouts' ? 'var(--gold)' : 'var(--dark-2)',
          color: tab === 'payouts' ? 'var(--dark)' : 'var(--text-muted)',
        }}>
          Payout Requests {pendingPayoutCount > 0 && <span style={{ background: '#dc2626', color: '#fff', borderRadius: '100px', padding: '1px 6px', fontSize: '0.7rem', marginLeft: '4px' }}>{pendingPayoutCount}</span>}
        </button>
      </div>

      {tab === 'payments' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="Search by TxRef or phone..."
              value={paymentSearch}
              onChange={e => { setPaymentSearch(e.target.value); setPaymentPage(1); }}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem', flex: 1, minWidth: '200px',
              }}
            />
            <select
              value={paymentFilter}
              onChange={e => { setPaymentFilter(e.target.value); setPaymentPage(1); }}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem',
              }}
            >
              <option value="pending,approved,rejected">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.9fr 0.7fr 1.5fr',
              padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>Trader</div><div>Plan</div><div>Amount</div><div>Tx Ref</div><div>Status</div><div>Actions</div>
            </div>
            {payments.map((p) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.9fr 0.7fr 1.5fr',
                padding: '0.85rem 1.25rem', fontSize: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{p.users?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.users?.email || ''}</div>
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  {(p.challenge_type || '').toUpperCase()}{p.model ? ` (${p.model})` : ''}
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{p.amount_etb.toLocaleString()} ETB</div>
                <div style={{ fontSize: '0.72rem' }}>
                  <code style={{ background: 'var(--dark-3)', padding: '2px 6px', borderRadius: '4px' }}>{p.telebirr_tx_ref}</code>
                </div>
                <div>
                  <StatusBadge status={p.status} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => setConfirm({ action: '/api/admin/telebirr-payments|approved', id: p.id, label: 'Approve Payment?' })} className="btn-green-sm">APPROVE ✓</button>
                      <button onClick={() => setConfirm({ action: '/api/admin/telebirr-payments|rejected', id: p.id, label: 'Reject Payment?', danger: true })} className="btn-red-sm">REJECT ✗</button>
                    </>
                  )}
                  {p.screenshot_url && (
                    <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>View SS</a>
                  )}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payments found.</div>
            )}
          </div>
          <Pagination page={paymentPage} total={paymentTotal} limit={limit} setPage={setPaymentPage} />
        </>
      )}

      {tab === 'payouts' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="Search by trader name or email..."
              value={payoutSearch}
              onChange={e => { setPayoutSearch(e.target.value); setPayoutPage(1); }}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem', flex: 1, minWidth: '200px',
              }}
            />
            <select
              value={payoutFilter}
              onChange={e => { setPayoutFilter(e.target.value); setPayoutPage(1); }}
              style={{
                padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--dark-3)', color: 'var(--text)', fontSize: '0.8rem',
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr 0.7fr 1.2fr',
              padding: '0.85rem 1.25rem', fontSize: '0.72rem', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>Trader</div><div>Amount</div><div>Method</div><div>Account</div><div>Status</div><div>Actions</div>
            </div>
            {payouts.map((p) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr 0.7fr 1.2fr',
                padding: '0.85rem 1.25rem', fontSize: '0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{p.users?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.users?.email || ''}</div>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{p.amount_etb.toLocaleString()} ETB</div>
                <div style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{p.method}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.account_number}</div>
                <div><StatusBadge status={p.status} /></div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => setConfirm({ action: '/api/admin/payouts|approved', id: p.id, label: 'Approve Payout?' })} className="btn-green-sm">Approve</button>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <input
                          placeholder="Reason"
                          value={rejectReason[p.id] || ''}
                          onChange={e => setRejectReason(r => ({ ...r, [p.id]: e.target.value }))}
                          style={{ width: '80px', padding: '3px 6px', fontSize: '0.7rem', background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text)' }}
                        />
                        <button onClick={() => setConfirm({ action: '/api/admin/payouts|rejected', id: p.id, label: 'Reject Payout?', danger: true })} className="btn-red-sm">Reject</button>
                      </div>
                    </>
                  )}
                  {p.status === 'approved' && (
                    <button onClick={() => setConfirm({ action: '/api/admin/payouts|paid', id: p.id, label: 'Mark Payout as Paid?' })} className="btn-green-sm">Mark Paid</button>
                  )}
                  {(p.status === 'paid' || p.status === 'rejected') && (
                    <span style={{ fontSize: '0.7rem', color: p.status === 'paid' ? 'var(--green-light)' : '#ff6b6b' }}>
                      {p.status === 'paid' ? '✓' : '✗'} {p.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {payouts.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payout requests found.</div>
            )}
          </div>
          <Pagination page={payoutPage} total={payoutTotal} limit={limit} setPage={setPayoutPage} />
        </>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string, color: string }> = {
    approved: { bg: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' },
    paid: { bg: 'rgba(29,122,74,0.15)', color: 'var(--green-light)' },
    pending: { bg: 'rgba(201,145,42,0.1)', color: 'var(--accent)' },
    rejected: { bg: 'rgba(255,107,107,0.1)', color: '#ff6b6b' },
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
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Page {page} of {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--dark-3)', color: page >= totalPages ? 'var(--text-muted)' : 'var(--text)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}>
        Next →
      </button>
    </div>
  );
}
