'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PayoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState('telebirr');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, accountNumber: account, amount: Number(amount) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section style={{ padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          Payout Requested
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your payout has been submitted. Processing takes up to 48 hours.
        </p>
        <Link href="/dashboard" className="btn-primary no-underline px-8 py-3 rounded-lg" style={{ display: 'inline-block' }}>
          Back to Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Request Payout
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Withdraw your ETB earnings via Telebirr, CBE Birr, or Awash Bank.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Payout Method</label>
          <select
            value={method} onChange={e => setMethod(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
            }}
          >
            <option value="telebirr">Telebirr</option>
            <option value="cbe">CBE Birr</option>
            <option value="awash">Awash Bank</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Account Number</label>
          <input
            type="text" value={account} onChange={e => setAccount(e.target.value)}
            placeholder="Phone number or account number" required
            style={{
              width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Amount (ETB)</label>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="500 minimum" required min={500}
            style={{
              width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          className="btn-primary"
          style={{
            padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Submitting...' : 'Request Payout'}
        </button>
      </form>
    </section>
  );
}
