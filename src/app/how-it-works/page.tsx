import Link from 'next/link';

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
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 4rem' }}>
        From challenge sign-up to funded trader — here&apos;s your journey.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
        background: 'rgba(201,145,42,0.12)', border: '1px solid rgba(201,145,42,0.12)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        {[
          { num: '01', icon: '🎯', title: 'Buy a challenge', text: 'Choose your account size. Pay in ETB via Telebirr or CBE. Instant account activation on MT5.' },
          { num: '02', icon: '📈', title: 'Pass evaluation', text: 'Hit your profit target in Phase 1 & Phase 2 while respecting drawdown rules. Minimum 3 trading days.' },
          { num: '03', icon: '💰', title: 'Earn ETB payouts', text: 'Receive your earnings directly to Telebirr or CBE. Scale up with consistent performance.' },
        ].map((s) => (
          <div key={s.num} style={{ background: 'var(--dark-2)', padding: '2.25rem 1.75rem' }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: '3.5rem', fontWeight: 800,
              color: 'rgba(201,145,42,0.12)', lineHeight: 1, marginBottom: '1.25rem',
              letterSpacing: '-0.06em',
            }}>{s.num}</div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(201,145,42,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem', fontSize: '1.2rem',
            }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>{s.title}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.text}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/pricing" className="btn-primary no-underline px-8 py-3 rounded-lg text-base">
          See Challenges →
        </Link>
      </div>
    </section>
  );
}
