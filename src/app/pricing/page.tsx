import Link from 'next/link';

const PLANS = [
  { name: 'Starter', size: '$5K', price: '1,500 ETB', target: '8%', daily: '4%', max: '8%', popular: false },
  { name: 'Standard', size: '$10K', price: '3,000 ETB', target: '8%', daily: '4%', max: '8%', popular: false },
  { name: 'Pro', size: '$25K', price: '7,000 ETB', target: '10%', daily: '5%', max: '10%', popular: true },
  { name: 'Elite', size: '$50K', price: '12,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
  { name: 'Legend', size: '$100K', price: '20,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
];

export default function PricingPage() {
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
            <Link
              href="/register"
              className="btn-primary no-underline mt-4 inline-block w-full py-2 rounded-lg text-sm"
              style={{ display: 'block', marginTop: '1rem' }}
            >
              Buy Now
            </Link>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: '3rem' }}>
        Payment via Telebirr, CBE Birr, Awash Bank, or Chapa. Instant account activation on MT5.
      </p>
    </section>
  );
}
