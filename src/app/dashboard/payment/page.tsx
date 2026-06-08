'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CHALLENGE_PRICES, CHALLENGE_VIRTUAL, PLAN_LABELS, PLAN_TO_TYPE } from '@/lib/constants';

const PLANS_META: Record<string, { name: string, size: string }> = {
  starter: { name: 'Starter', size: '$5K' },
  standard: { name: 'Standard', size: '$10K' },
  pro: { name: 'Pro', size: '$25K' },
  elite: { name: 'Elite', size: '$50K' },
  legend: { name: 'Legend', size: '$100K' },
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || '';
  const modelParam = searchParams.get('model') || '';

  const challengeType = PLAN_TO_TYPE[planParam];
  const meta = PLANS_META[planParam];

  const [telebirrTxRef, setTelebirrTxRef] = useState('');
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!challengeType) {
      const saved = localStorage.getItem('fb_plan');
      if (saved && PLAN_TO_TYPE[saved]) {
        const savedModel = localStorage.getItem('fb_model') || '2step';
        router.replace(`/dashboard/payment?plan=${saved}&model=${savedModel}`);
      }
    }
  }, [challengeType, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/payment/telebirr-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeType,
          model: modelParam || '2step',
          telebirrTxRef: telebirrTxRef.trim(),
          telebirrPhone: telebirrPhone.trim(),
          fullName: fullName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Submission failed');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!challengeType || !meta) {
    return (
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.4rem', marginBottom: '1rem' }}>
          No Plan Selected
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please choose a challenge plan first.
        </p>
        <Link href="/pricing" className="btn-primary no-underline px-8 py-3 rounded-lg" style={{ display: 'inline-block' }}>
          View Plans →
        </Link>
      </section>
    );
  }

  if (submitted) {
    return (
      <section style={{ padding: '5rem 2rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--gold-light)' }}>
          Payment Submitted
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          Your {meta.name} ({meta.size}) challenge payment of {CHALLENGE_PRICES[challengeType].toLocaleString()} ETB is pending review.
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.82rem' }}>
          Verification usually takes within 2 hours. You will receive a confirmation email once approved.
        </p>
        <Link href="/dashboard" className="btn-primary no-underline px-8 py-3 rounded-lg" style={{ display: 'inline-block' }}>
          Go to Dashboard
        </Link>
      </section>
    );
  }

  const price = CHALLENGE_PRICES[challengeType];
  const virtualBalance = CHALLENGE_VIRTUAL[challengeType];

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Change Plan
      </Link>

      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.2)',
        borderRadius: '16px', padding: '2rem', marginBottom: '2rem', textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>
          {meta.name} — {meta.size}
        </h1>
        <div style={{ color: 'var(--accent)', fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {price.toLocaleString()} ETB
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Virtual capital: <strong style={{ color: 'var(--green-light)' }}>${virtualBalance.toLocaleString()}</strong>
        </div>
        <div style={{
          marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: '100px',
          background: modelParam === '1step' ? 'rgba(41,168,106,0.1)' : 'rgba(201,145,42,0.1)',
          border: `1px solid ${modelParam === '1step' ? 'rgba(41,168,106,0.25)' : 'rgba(201,145,42,0.25)'}`,
          display: 'inline-block', fontSize: '0.75rem', fontWeight: 600,
          color: modelParam === '1step' ? 'var(--green-light)' : 'var(--accent)',
        }}>
          {modelParam === '1step' ? '1-Step Evaluation' : '2-Step Evaluation'}
        </div>
      </div>

      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '2rem',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Send Payment via Telebirr
        </h2>
        <div style={{
          background: 'rgba(201,145,42,0.08)', border: '1px solid rgba(201,145,42,0.2)',
          borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--accent)' }}>Send to:</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)' }}>
            +251 9XX XXX XXX
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Contact <strong>@fundedbirr</strong> on Telegram for the current payment number
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name (as on account)</label>
            <input
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Abebe Kebede" required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Telebirr Transaction Reference</label>
            <input
              type="text" value={telebirrTxRef} onChange={e => setTelebirrTxRef(e.target.value)}
              placeholder="e.g. 8A3F2B9C1D (10 characters)" required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Telebirr Phone Number</label>
            <input
              type="tel" value={telebirrPhone} onChange={e => setTelebirrPhone(e.target.value)}
              placeholder="+251 9XX XXX XXX" required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.85rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {loading ? 'Submitting...' : `Submit Payment — ${price.toLocaleString()} ETB`}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}