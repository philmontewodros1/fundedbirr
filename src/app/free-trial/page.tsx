import Link from 'next/link';

export const metadata = {
  title: 'Free Trial — FundedBirr',
  description: 'Practice with a $1,000 virtual account. No payment required. Try FundedBirr free.',
};

export default function FreeTrialPage() {
  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="section-label" style={{ display: 'inline-block' }}>Free trial</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800, letterSpacing: '-0.04em', marginTop: '1rem', marginBottom: '0.75rem',
        }}>
          Try FundedBirr Free
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto' }}>
          Practice with a $1,000 virtual account. No payment required.
        </p>
      </div>

      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.15)',
        borderRadius: '16px', padding: '2.5rem', marginBottom: '2rem',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem' }}>
          What you get:
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { ok: true, text: 'Access to FundedBirr trading terminal' },
            { ok: true, text: 'Live XAUUSD gold prices' },
            { ok: true, text: 'Real drawdown tracking' },
            { ok: true, text: 'No time limit — trade at your own pace' },
            { ok: false, text: 'No ETB payouts (upgrade to a challenge for real payouts)' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                fontSize: '1.1rem', color: item.ok ? 'var(--green-light)' : 'var(--text-muted)',
              }}>
                {item.ok ? '✓' : '✗'}
              </span>
              <span style={{ color: item.ok ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/auth/register?trial=true"
        className="btn-primary no-underline px-8 py-3 rounded-lg text-base"
        style={{ display: 'block', textAlign: 'center' }}
      >
        Start Free Trial →
      </Link>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: '1.5rem' }}>
        No credit card required. Sign up and start trading immediately.
      </p>
    </section>
  );
}
