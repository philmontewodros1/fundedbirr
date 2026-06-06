'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CHALLENGE_PRICES } from '@/lib/constants';

const PLANS = [
  { key: 'starter', name: 'Starter', size: '$5K', price: '1,500 ETB', target: '8%', daily: '4%', max: '8%', popular: false },
  { key: 'standard', name: 'Standard', size: '$10K', price: '3,000 ETB', target: '8%', daily: '4%', max: '8%', popular: false },
  { key: 'pro', name: 'Pro', size: '$25K', price: '7,000 ETB', target: '10%', daily: '5%', max: '10%', popular: true },
  { key: 'elite', name: 'Elite', size: '$50K', price: '12,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
  { key: 'legend', name: 'Legend', size: '$100K', price: '20,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
];

function PricingContent() {
  const searchParams = useSearchParams();
  const [buying, setBuying] = useState<string | null>(null);
  const [txRef, setTxRef] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(r => {
      setAuthenticated(r.status !== 401);
    }).catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    const ref = searchParams.get('buy');
    if (ref && PLANS.some(p => p.key === ref)) {
      setBuying(ref);
    }
  }, [searchParams]);

  const selectedPlan = PLANS.find(p => p.key === buying);
  const amount = buying ? CHALLENGE_PRICES[buying] : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/payment/telebirr-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeType: buying,
          telebirrTxRef: txRef.trim(),
          telebirrPhone: phone.trim(),
          fullName: fullName.trim(),
          screenshotUrl: screenshot.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error — please try again');
    }
    setSubmitting(false);
  }

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Account sizes</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '0.75rem',
      }}>
        Pick your challenge
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Choose your account size. Pay once in ETB. No hidden fees, no subscriptions.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {PLANS.map((a) => (
          <div key={a.name} className="hover-card" style={{
            background: 'var(--dark-2)',
            border: a.popular ? '1px solid rgba(201,145,42,0.4)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center',
            position: 'relative',
          }}>
            {a.popular && (
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--gold)', color: 'var(--dark)', fontSize: '0.65rem',
                fontWeight: 700, padding: '3px 12px', borderRadius: '100px',
                whiteSpace: 'nowrap', fontFamily: "'Syne', sans-serif",
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                Most popular
              </div>
            )}
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {a.name}
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', marginBottom: '0.35rem' }}>
              {a.size}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '1.25rem' }}>
              {a.price}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {[
                { label: 'Profit Target', val: a.target },
                { label: 'Daily Loss', val: a.daily },
                { label: 'Max Loss', val: a.max },
              ].map((r, i) => (
                <div key={r.label} style={{ padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginBottom: '1px' }}>{r.label}</div>
                  {r.val}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (authenticated === false) {
                  window.location.href = '/auth/login?redirect=/pricing?buy=' + a.key;
                  return;
                }
                setBuying(a.key);
              }}
              className="btn-primary no-underline mt-4 inline-block w-full py-2 rounded-lg text-sm"
              style={{ display: 'block', marginTop: '1rem', cursor: 'pointer', border: 'none', width: '100%' }}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {buying && selectedPlan && !submitted && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }} onClick={() => setBuying(null)}>
          <div style={{
            background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.2)',
            borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%',
            maxHeight: '90vh', overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem' }}>
                Pay via Telebirr
              </h2>
              <button onClick={() => setBuying(null)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '1.3rem',
              }}>✕</button>
            </div>

            <div style={{
              background: 'rgba(201,145,42,0.08)', borderRadius: '10px',
              padding: '1.25rem', marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Amount to send</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                {selectedPlan.price}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Send to: <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>251XXXXXXXX</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Account name: <span style={{ color: 'var(--text)', fontWeight: 600 }}>FundedBirr</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(29,122,74,0.06)', border: '1px solid rgba(29,122,74,0.15)',
              borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
              fontSize: '0.82rem', color: 'var(--text-muted)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--green-light)', marginBottom: '0.5rem' }}>Steps</div>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Open your Telebirr app</li>
                <li>Go to Send Money</li>
                <li>Enter the number above and exact amount</li>
                <li>Complete the transfer</li>
                <li>Enter your transaction details below</li>
              </ol>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Transaction Reference Number *
                  </label>
                  <input
                    required
                    placeholder="e.g. DF67N6BDEF"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    maxLength={10}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Your Telebirr Phone Number *
                  </label>
                  <input
                    required
                    placeholder="2519XXXXXXXX or 09XXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Full Name (must match registration)
                  </label>
                  <input
                    placeholder="Your full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Screenshot URL (optional)
                  </label>
                  <input
                    placeholder="Paste an image link (upload to imgur etc.)"
                    value={screenshot}
                    onChange={e => setScreenshot(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  display: 'block', width: '100%', marginTop: '1.25rem', padding: '0.75rem',
                  borderRadius: '10px', border: 'none', fontSize: '0.9rem', fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'I Have Paid — Submit for Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--dark-2)', border: '1px solid rgba(29,122,74,0.3)',
            borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '420px', width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Payment Submitted!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Your {selectedPlan?.name} challenge payment is pending verification. Our team will review it within 2 hours.
              You will receive a confirmation email once approved.
            </p>
            <Link href="/dashboard" className="btn-primary no-underline px-8 py-2 rounded-lg" style={{ display: 'inline-block' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: '3rem' }}>
        Payment via Telebirr. Instant account activation on MT5 after verification.
      </p>
    </section>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <section style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </section>
    }>
      <PricingContent />
    </Suspense>
  );
}
