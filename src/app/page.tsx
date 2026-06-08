import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import StatsBar from '@/components/StatsBar';

const ACCOUNTS = [
  { name: 'BF 10K', size: '$10,000 virtual', price: '3,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
  { name: 'BF 25K', size: '$25,000 virtual', price: '7,000 ETB', target: '10%', daily: '5%', max: '10%', popular: true },
  { name: 'BF 50K', size: '$50,000 virtual', price: '12,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
  { name: 'BF 100K', size: '$100,000 virtual', price: '20,000 ETB', target: '10%', daily: '5%', max: '10%', popular: false },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section style={{ padding: '0 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <StatsBar />
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-label">Process</div>
        <div className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Three steps to funded
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
          background: 'rgba(201,145,42,0.12)', border: '1px solid rgba(201,145,42,0.12)',
          borderRadius: '14px', overflow: 'hidden', marginTop: '3rem',
        }}>
          {[
            { num: '01', icon: '🎯', title: 'Buy a challenge', text: 'Choose your account size. Pay in ETB via Telebirr. Instant access to your FundedBirr trading terminal.' },
            { num: '02', icon: '📈', title: 'Pass evaluation', text: 'Hit your profit target while respecting drawdown rules. Minimum 3 trading days.' },
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
      </section>

      {/* ACCOUNTS */}
      <section className="section" id="accounts" style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-label">Account sizes</div>
        <div className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
          Pick your level
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '3rem' }}>
          {ACCOUNTS.map((a) => (
            <div key={a.name} className="hover-card" style={{
              background: 'var(--dark-2)',
              border: a.popular ? '1px solid rgba(201,145,42,0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center',
              position: 'relative', cursor: 'pointer',
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
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--dark-3)', border: '1px solid rgba(201,145,42,0.2)',
          borderRadius: '20px', padding: '4rem 3rem', textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem', lineHeight: 1.1,
          }}>
            Ready to become a<br />
            <span style={{ color: 'var(--gold-light)' }}>verified FundedBirr trader?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Start your funded trader journey today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn-primary no-underline px-8 py-3 rounded-lg">
              Start Challenge →
            </Link>
            <a href="https://t.me/+D6Fhx_vQz4o1Y2U0" target="_blank" rel="noopener noreferrer" className="btn-secondary no-underline px-8 py-3 rounded-lg">
              Join Telegram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
