import Link from 'next/link';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    size: '$5K',
    virtual: 5000,
    price: 1500,
    priceLabel: '1,500 ETB',
    target: '8%',
    daily: '4%',
    max: '8%',
    maxLot: '1.0',
    popular: false,
    color: 'rgba(255,255,255,0.06)',
  },
  {
    id: 'standard',
    name: 'Standard',
    size: '$10K',
    virtual: 10000,
    price: 3000,
    priceLabel: '3,000 ETB',
    target: '8%',
    daily: '4%',
    max: '8%',
    maxLot: '2.0',
    popular: false,
    color: 'rgba(255,255,255,0.06)',
  },
  {
    id: 'pro',
    name: 'Pro',
    size: '$25K',
    virtual: 25000,
    price: 7000,
    priceLabel: '7,000 ETB',
    target: '10%',
    daily: '5%',
    max: '10%',
    maxLot: '5.0',
    popular: true,
    color: 'rgba(201,145,42,0.35)',
  },
  {
    id: 'elite',
    name: 'Elite',
    size: '$50K',
    virtual: 50000,
    price: 12000,
    priceLabel: '12,000 ETB',
    target: '10%',
    daily: '5%',
    max: '10%',
    maxLot: '10.0',
    popular: false,
    color: 'rgba(255,255,255,0.06)',
  },
  {
    id: 'legend',
    name: 'Legend',
    size: '$100K',
    virtual: 100000,
    price: 20000,
    priceLabel: '20,000 ETB',
    target: '10%',
    daily: '5%',
    max: '10%',
    maxLot: '20.0',
    popular: false,
    color: 'rgba(255,255,255,0.06)',
  },
];

const FEATURES = [
  { icon: '⚡', text: 'Instant account activation after payment approval' },
  { icon: '🏆', text: '80% profit split — you keep the majority' },
  { icon: '🔄', text: 'Scale up after passing — no cap on growth' },
  { icon: '💳', text: 'Payouts via Telebirr, CBE Birr, Awash Bank' },
  { icon: '📊', text: 'Real-time XAUUSD trading terminal' },
  { icon: '🛡️', text: 'No time limit on challenges' },
];

export default function PricingPage() {
  return (
    <>
      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div className="section-label">Challenge accounts</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          marginBottom: '1rem',
        }}>
          Pick your challenge
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.05rem',
          maxWidth: '480px',
          margin: '0 auto 1rem',
          lineHeight: 1.6,
          fontWeight: 300,
        }}>
          Pay once in ETB. No subscriptions. No hidden fees.
          Pass the challenge, get funded, earn Birr.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '3.5rem',
        }}>
          {['Telebirr payments', 'Instant activation', '80% profit split', 'No time limit'].map((b) => (
            <div key={b} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(201,145,42,0.08)',
              border: '1px solid rgba(201,145,42,0.2)',
              color: 'var(--accent)',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '5px 12px',
              borderRadius: '100px',
            }}>
              <span style={{ color: 'var(--green-light)' }}>✓</span> {b}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 2rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="hover-card"
              style={{
                background: 'var(--dark-2)',
                border: `1px solid ${plan.color}`,
                borderRadius: '14px',
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-11px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--gold)',
                  color: 'var(--dark)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '3px 14px',
                  borderRadius: '100px',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Most popular
                </div>
              )}

              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}>
                {plan.name}
              </div>

              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '2rem',
                fontWeight: 800,
                color: plan.popular ? 'var(--gold-light)' : 'var(--text)',
                letterSpacing: '-0.04em',
                marginBottom: '0.25rem',
                lineHeight: 1,
              }}>
                {plan.size}
              </div>

              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
              }}>
                virtual capital
              </div>

              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '1.5rem',
              }}>
                {plan.priceLabel}
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                flex: 1,
              }}>
                {[
                  { label: 'Profit target', val: plan.target },
                  { label: 'Daily loss limit', val: plan.daily },
                  { label: 'Max drawdown', val: plan.max },
                  { label: 'Max lot size', val: plan.maxLot },
                ].map((r, i) => (
                  <div key={r.label} style={{
                    padding: '6px 0',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>
                      {r.label}
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/auth/register?plan=${plan.id}`}
                className="btn-primary no-underline"
                style={{
                  display: 'block',
                  padding: '0.65rem 0',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  background: plan.popular ? 'var(--gold)' : 'rgba(201,145,42,0.15)',
                  color: plan.popular ? 'var(--dark)' : 'var(--accent)',
                  border: plan.popular ? 'none' : '1px solid rgba(201,145,42,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                Start challenge →
              </Link>
            </div>
          ))}
        </div>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          textAlign: 'center',
          marginTop: '1.5rem',
        }}>
          Pay via Telebirr · CBE Birr · Awash Bank &nbsp;·&nbsp; Manual verification within 24h
        </p>
      </section>

      <section style={{ padding: '2rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--dark-2)',
          border: '1px solid rgba(201,145,42,0.12)',
          borderRadius: '16px',
          padding: '2.5rem',
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Everything included in every plan
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.75rem',
          }}>
            {FEATURES.map((f) => (
              <div key={f.text} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 2rem 5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            {
              q: 'How do I pay?',
              a: 'Send ETB via Telebirr, CBE Birr, or Awash Bank to the number shown after registration. Submit your transaction reference and our team activates your account within 24 hours.',
            },
            {
              q: 'What happens when I pass?',
              a: 'You become a funded trader and can request payouts of up to 80% of your profits. Payouts are sent directly to your Telebirr or bank account within 48 hours.',
            },
            {
              q: 'Is there a time limit?',
              a: 'No. Take as long as you need to hit your profit target. The only requirement is a minimum of 3 trading days before requesting evaluation.',
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--dark-2)',
              padding: '1.75rem',
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '0.6rem',
                color: 'var(--text)',
              }}>
                {item.q}
              </div>
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
              }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/faq"
            style={{
              color: 'var(--accent)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            View all FAQs →
          </Link>
        </div>
      </section>
    </>
  );
}
