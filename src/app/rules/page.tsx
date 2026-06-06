import Link from 'next/link';

const PHASES = [
  {
    name: 'Phase 1 — Evaluation',
    target: '8–10%',
    rules: ['Reach profit target', 'Respect daily loss limit (4–5%)', 'Respect max drawdown (8–10%)', 'No minimum trading days'],
  },
  {
    name: 'Phase 2 — Verification',
    target: '5%',
    rules: ['Reach profit target', 'Respect daily loss limit (4–5%)', 'Respect max drawdown (8–10%)', 'Minimum 3 trading days'],
  },
  {
    name: 'Funded Status',
    target: 'Unlimited',
    rules: ['Trade full virtual account', '80% profit split to you', 'Payouts every 14 days via Telebirr/CBE', 'Scaling plan available'],
  },
];

const ALL_RULES = [
  { label: 'Profit Target', desc: 'Phase 1: 8–10% account growth. Phase 2: 5% growth.' },
  { label: 'Daily Loss Limit', desc: '4–5% of account balance. Exceeding = phase failure.' },
  { label: 'Max Drawdown', desc: '8–10% of total account balance. Hard limit.' },
  { label: 'Minimum Trading Days', desc: '3 trading days required in Phase 2. No maximum.' },
  { label: 'No Time Limit', desc: 'Take as long as you need per phase.' },
  { label: 'No EAs / Bots', desc: 'All trades must be manually executed.' },
  { label: 'Any Strategy', desc: 'Scalping, swing, positional — all allowed.' },
  { label: 'XAUUSD Focus', desc: 'Gold is the primary instrument.' },
  { label: 'Consistent Trading', desc: 'No gambling-style behavior. One big trade and go flat is not allowed.' },
  { label: 'Real Market Conditions', desc: 'Live spreads, slippage, execution on MT5.' },
];

export default function RulesPage() {
  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Guidelines</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '0.75rem',
      }}>
        Trading Rules
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Clear rules for fair evaluation. No hidden gotchas.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '4rem' }}>
        {PHASES.map((p) => (
          <div key={p.name} style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Target: {p.target}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {p.rules.map((r) => (
                <li key={r} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.35rem 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  ✓ {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem' }}>
        Detailed Rules
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ALL_RULES.map((r) => (
          <div key={r.label} style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{r.label}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', background: 'rgba(201,145,42,0.05)', border: '1px solid rgba(201,145,42,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Rule violations result in phase failure. Reset available at 50% discount. FundedBirr reserves the right to audit all trading activity.
        </div>
      </div>
    </section>
  );
}
