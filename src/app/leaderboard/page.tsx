const LEADERS = [
  { rank: 1, name: 'AddisSniper', profit: '+18.4%', account: '$25K Pro', status: 'Funded' },
  { rank: 2, name: 'GoldKing251', profit: '+14.2%', account: '$50K Elite', status: 'Funded' },
  { rank: 3, name: 'EthioXAU', profit: '+11.7%', account: '$10K Standard', status: 'Funded' },
  { rank: 4, name: 'BoleTrader', profit: '+9.8%', account: '$25K Pro', status: 'Phase 2' },
  { rank: 5, name: 'LalibeltFX', profit: '+8.3%', account: '$5K Starter', status: 'Phase 2' },
  { rank: 6, name: 'AxumFX', profit: '+7.1%', account: '$10K Standard', status: 'Phase 1' },
  { rank: 7, name: 'ShebaTrade', profit: '+6.5%', account: '$25K Pro', status: 'Phase 1' },
  { rank: 8, name: 'NileCapital', profit: '+5.8%', account: '$5K Starter', status: 'Phase 1' },
];

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32',
};

export default function LeaderboardPage() {
  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Live leaderboard</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '0.75rem',
      }}>
        Ethiopia&apos;s top traders
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Rankings update daily based on verified trading performance.
      </p>

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(201,145,42,0.15)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '3rem 1fr 1fr 1fr 1fr',
          padding: '1rem 1.5rem', fontSize: '0.72rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)',
          borderBottom: '1px solid rgba(201,145,42,0.1)', fontWeight: 500,
        }}>
          <div>Rank</div><div>Trader</div><div>Profit</div><div>Account</div><div>Status</div>
        </div>
          {LEADERS.map((t) => (
          <div key={t.rank} className="hover-row" style={{
            display: 'grid', gridTemplateColumns: '3rem 1fr 1fr 1fr 1fr',
            padding: '1rem 1.5rem', alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            fontSize: '0.875rem',
          }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem',
              color: RANK_COLORS[t.rank] || 'var(--text-muted)',
            }}>
              {String(t.rank).padStart(2, '0')}
            </div>
            <div>{t.name}</div>
            <div style={{ color: 'var(--green-light)', fontWeight: 500, fontFamily: "'Syne', sans-serif" }}>{t.profit}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.account}</div>
            <div>
              {t.status === 'Funded' ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)',
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px',
                  border: '1px solid rgba(29,122,74,0.25)',
                }}>
                  ✓ Funded
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'rgba(201,145,42,0.1)', color: 'var(--accent)',
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px',
                  border: '1px solid rgba(201,145,42,0.2)',
                }}>
                  {t.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
        Connect your MT5 account to appear on the leaderboard.
      </p>
    </section>
  );
}
