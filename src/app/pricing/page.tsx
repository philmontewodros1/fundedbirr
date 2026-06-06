'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CHALLENGE_PRICES, CHALLENGE_VIRTUAL, PLAN_LABELS } from '@/lib/constants';

const PLANS = [
  { key: 'bf10k', name: 'BF 10K', size: '$10,000', price: '3,000 ETB', popular: false },
  { key: 'bf25k', name: 'BF 25K', size: '$25,000', price: '7,000 ETB', popular: true },
  { key: 'bf50k', name: 'BF 50K', size: '$50,000', price: '12,000 ETB', popular: false },
  { key: 'bf100k', name: 'BF 100K', size: '$100,000', price: '20,000 ETB', popular: false },
];

const FEATURES = [
  { label: 'Phase 1 Target', val: '10%' },
  { label: 'Phase 2 Target', val: '5%' },
  { label: 'Daily Loss Limit', val: '5%' },
  { label: 'Max Drawdown', val: '10% (static)' },
  { label: 'Consistency Rule', val: '✅ Max 50% per day' },
  { label: 'Time Limit', val: 'No limit' },
  { label: 'Min Trading Days (P1)', val: '5 days' },
  { label: 'Min Trading Days (P2)', val: '3 days' },
  { label: 'Profit Split', val: '80% / 20%' },
  { label: 'Fee Refund', val: '✅ With 1st payout' },
  { label: 'Scaling Plan', val: '✅ +50% after 3mo' },
  { label: 'Payouts', val: 'Every 14 days' },
];

const STEPS = [
  { step: '1', title: 'Choose Your Plan', desc: 'Pick an account size that matches your trading goals. Pay once — no subscriptions.' },
  { step: '2', title: 'Pass Phase 1 (Evaluation)', desc: 'Grow the account by 10% while respecting the daily loss (5%) and max drawdown (10%) limits. Minimum 5 trading days. No time limit.' },
  { step: '3', title: 'Pass Phase 2 (Verification)', desc: 'Grow by 5% with the same risk rules. Minimum 3 trading days. Prove that your Phase 1 success was not luck.' },
  { step: '4', title: 'Become Funded', desc: 'You are now a FundedBirr trader. Trade the full virtual account. Keep 80% of profits. Get paid every 14 days.' },
];

export default function PricingPage() {
  const [buying, setBuying] = useState<string | null>(null);
  const [txRef, setTxRef] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('buy');
    if (ref && PLANS.some(p => p.key === ref)) {
      setBuying(ref);
    }
  }, []);

  const selectedPlan = PLANS.find(p => p.key === buying);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const authCheck = await fetch('/api/dashboard');
    if (authCheck.status === 401) {
      window.location.href = '/auth/login?redirect=/pricing?buy=' + buying;
      return;
    }

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
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '550px', margin: '0 auto 3rem' }}>
        One fee. Two evaluation phases. Funded for life.
      </p>

      <div style={{
        overflowX: 'auto', marginBottom: '4rem',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--dark-2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 1.25rem', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plan Details</th>
              {PLANS.map((p) => (
                <th key={p.key} style={{
                  textAlign: 'center', padding: '1rem 0.75rem',
                  position: 'relative',
                }}>
                  {p.popular && (
                    <div style={{
                      position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--gold)', color: 'var(--dark)', fontSize: '0.6rem',
                      fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 100px 100px',
                      whiteSpace: 'nowrap', fontFamily: "'Syne', sans-serif",
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>{p.size}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.35rem' }}>{p.price}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.label} style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
              }}>
                <td style={{ padding: '0.7rem 1.25rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.label}</td>
                {PLANS.map((p) => (
                  <td key={p.key} style={{ textAlign: 'center', padding: '0.7rem 0.75rem', color: 'var(--text)' }}>{f.val}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ padding: '0.85rem 1.25rem' }}></td>
              {PLANS.map((p) => (
                <td key={p.key} style={{ textAlign: 'center', padding: '0.85rem 0.75rem' }}>
                  <button
                    onClick={() => setBuying(p.key)}
                    className="btn-primary no-underline"
                    style={{
                      cursor: 'pointer', border: 'none', padding: '0.55rem 1.25rem',
                      borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Start Challenge
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem',
        textAlign: 'center', marginBottom: '2rem',
      }}>
        How it works
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '4rem' }}>
        {STEPS.map((s) => (
          <div key={s.step} style={{
            background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '1.5rem 1.25rem',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(201,145,42,0.15)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem',
              marginBottom: '0.85rem',
            }}>{s.step}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>{s.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(201,145,42,0.05)', border: '1px solid rgba(201,145,42,0.15)',
        borderRadius: '16px', padding: '2rem', textAlign: 'center', maxWidth: '600px',
        margin: '0 auto',
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Prefer to try first?
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Practice with a free $1,000 trial account. No payment required.
        </div>
        <Link href="/free-trial" className="btn-secondary no-underline px-8 py-2 rounded-lg" style={{
          display: 'inline-block', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
        }}>
          Start Free Trial
        </Link>
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
              Your {selectedPlan?.name} challenge payment is pending verification. Our team will review it within 24 hours.
              You will receive a confirmation email once approved.
            </p>
            <Link href="/dashboard" className="btn-primary no-underline px-8 py-2 rounded-lg" style={{ display: 'inline-block' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
