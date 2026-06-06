import Link from 'next/link';

const PHASES = [
  {
    step: '01',
    title: 'Purchase a Challenge',
    icon: '🎯',
    items: [
      'Choose your account size: BF 10K, 25K, 50K, or 100K',
      'Pay the one-time fee via Telebirr or CBE Birr',
      'Challenge activated within 24 hours of payment verification',
    ],
  },
  {
    step: '02',
    title: 'Pass Phase 1 — Evaluation',
    icon: '📈',
    items: [
      'Grow the account by 10% (profit target)',
      'Respect the 5% daily loss limit',
      'Stay above the 10% maximum drawdown',
      'No single day can account for >50% of total profits',
      'Minimum 5 trading days — no time limit',
    ],
  },
  {
    step: '03',
    title: 'Pass Phase 2 — Verification',
    icon: '✅',
    items: [
      'Grow the account by 5% (profit target)',
      'Same risk rules: 5% daily loss, 10% max drawdown',
      'Same consistency rule: no day >50% of total profits',
      'Minimum 3 trading days — no time limit',
      'Prove that Phase 1 success was consistent, not luck',
    ],
  },
  {
    step: '04',
    title: 'Become Funded',
    icon: '💰',
    items: [
      'Trade the full virtual account with real market conditions',
      'Profit split: 80% to you, 20% to FundedBirr',
      'Payouts every 14 days via Telebirr or CBE Birr',
      'Challenge fee refunded with your first payout',
      'Scaling: account grows 50% after 3 profitable months',
    ],
  },
];

const WHY = [
  {
    title: 'Two phases, not one',
    desc: 'A single-phase challenge rewards luck. Two phases reward discipline. Pass the evaluation, then prove it was not a fluke in verification. Industry standard.',
  },
  {
    title: 'No time limit',
    desc: 'Trade at your own pace. No deadlines, no rush. Take 2 weeks or 6 months — the only thing that matters is respecting the risk parameters.',
  },
  {
    title: 'Consistency over gambling',
    desc: 'Our 50% consistency rule prevents one-big-trade passes. You must demonstrate steady, repeatable profitability across multiple trading sessions.',
  },
  {
    title: 'Fee refund',
    desc: 'Your challenge fee is refunded with your first successful payout. If you are good enough to pass, the evaluation is free.',
  },
];

export default function HowItWorksPage() {
  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Process</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '1rem',
      }}>
        How it works
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '550px', margin: '0 auto 4rem' }}>
        From challenge purchase to funded trader. A transparent, two-phase evaluation
        that identifies disciplined traders.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px',
        background: 'rgba(201,145,42,0.12)', border: '1px solid rgba(201,145,42,0.12)',
        borderRadius: '14px', overflow: 'hidden', marginBottom: '4rem',
      }}>
        {PHASES.map((s) => (
          <div key={s.step} style={{ background: 'var(--dark-2)', padding: '2.25rem 1.75rem' }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: '3.5rem', fontWeight: 800,
              color: 'rgba(201,145,42,0.12)', lineHeight: 1, marginBottom: '1.25rem',
              letterSpacing: '-0.06em',
            }}>{s.step}</div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(201,145,42,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem', fontSize: '1.2rem',
            }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{s.title}</div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: '0.4rem',
            }}>
              {s.items.map((item) => (
                <li key={item} style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
                  paddingLeft: '1.1rem', position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--green-light)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem',
        textAlign: 'center', marginBottom: '2rem',
      }}>
        Why two phases?
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '4rem',
      }}>
        {WHY.map((w) => (
          <div key={w.title} style={{
            background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '1.5rem',
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{w.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{w.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/pricing" className="btn-primary no-underline px-8 py-3 rounded-lg text-base" style={{ display: 'inline-block' }}>
          See Challenges →
        </Link>
      </div>
    </section>
  );
}
