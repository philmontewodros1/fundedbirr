import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '2rem',
      fontSize: '0.8rem',
      color: 'var(--text-muted)',
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <Link href="/" style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: '1.1rem',
        fontWeight: 800,
        color: 'var(--gold-light)',
        letterSpacing: '-0.03em',
        textDecoration: 'none',
      }}>
        Funded<span style={{ color: 'var(--green-light)' }}>Birr</span>
      </Link>

      <div style={{ maxWidth: '480px', textAlign: 'center', lineHeight: 1.6 }}>
        FundedBirr is a simulated prop trading evaluation platform. All trading is performed on demo accounts with virtual capital. ETB payouts are performance rewards, not returns on investment. FundedBirr is not a broker, investment firm, or financial advisor. Trading involves risk. Past performance does not guarantee future results.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/faq" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>FAQ</Link>
          <Link href="/rules" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Rules</Link>
          <a href="https://t.me/+D6Fhx_vQz4o1Y2U0" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Telegram</a>
          <a href="https://fundedbirracademy.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Academy ↗</a>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(154,152,128,0.6)' }}>
          © {new Date().getFullYear()} FundedBirr. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
