'use client'

import Link from 'next/link'

export default function MT5GuidePage() {
  const S = {
    page: { background: '#0D0F0A', minHeight: '100vh', color: '#F5F2E8', fontFamily: 'DM Sans, sans-serif', padding: '3rem 2rem' },
    inner: { maxWidth: '720px', margin: '0 auto' },
    backLink: { color: '#E8B84B', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' },
    title: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem', lineHeight: 1.1 },
    sub: { color: '#9A9880', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 },
    step: { background: '#151810', border: '1px solid #1E2218', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.25rem' },
    stepNum: { display: 'inline-block', background: '#C9912A', color: '#0D0F0A', width: 28, height: 28, borderRadius: '50%', textAlign: 'center' as const, lineHeight: '28px', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginRight: '0.75rem' },
    stepTitle: { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#F5F2E8' },
    stepBody: { fontSize: '0.85rem', color: '#9A9880', lineHeight: 1.7, marginTop: '1rem' },
    btn: { display: 'inline-block', background: '#1E2218', color: '#F5F2E8', border: '1px solid #272C1F', borderRadius: '8px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', textDecoration: 'none', margin: '0.25rem', fontFamily: 'DM Sans, sans-serif' },
    warn: { background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '12px', padding: '1.25rem', marginTop: '2rem' },
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <Link href="/dashboard" style={S.backLink}>← Back to Dashboard</Link>
        <h1 style={S.title}>How to Start Trading on MT5</h1>
        <p style={S.sub}>Follow these steps to connect your Exness MT5 demo account to FundedBirr.</p>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>1</span>
            <span style={S.stepTitle}>Download MetaTrader 5</span>
          </div>
          <div style={S.stepBody}>
            <p>Get MT5 on your preferred device:</p>
            <div style={{ marginTop: '0.5rem' }}>
              <a href="https://metatrader5.com/download" target="_blank" rel="noopener noreferrer" style={S.btn}>Windows</a>
              <a href="https://metatrader5.com/download" target="_blank" rel="noopener noreferrer" style={S.btn}>Android</a>
              <a href="https://metatrader5.com/download" target="_blank" rel="noopener noreferrer" style={S.btn}>iPhone</a>
              <a href="https://web.exness.com" target="_blank" rel="noopener noreferrer" style={S.btn}>Web Browser</a>
            </div>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>2</span>
            <span style={S.stepTitle}>Login to your account</span>
          </div>
          <div style={S.stepBody}>
            <p>Open MT5 → <strong>File</strong> → <strong>Login to Trade Account</strong></p>
            <p>Enter your account details (found on your dashboard):</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li><strong>Server:</strong> Your assigned MT5 server (e.g., Exness-MT5Trial9)</li>
              <li><strong>Login:</strong> Your MT5 login number</li>
              <li><strong>Password:</strong> Your MT5 investor password</li>
            </ul>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>3</span>
            <span style={S.stepTitle}>Find XAUUSD (Gold)</span>
          </div>
          <div style={S.stepBody}>
            <p>In the Market Watch window (View → Market Watch), search for <strong>XAUUSD</strong>.</p>
            <p>Right-click on XAUUSD → select <strong>Chart Window</strong> to open the gold price chart.</p>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>4</span>
            <span style={S.stepTitle}>Place a trade</span>
          </div>
          <div style={S.stepBody}>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li>Press <strong>F9</strong> or click <strong>New Order</strong></li>
              <li>Symbol: <strong>XAUUSD</strong></li>
              <li>Volume: <strong>0.01</strong> (start small)</li>
              <li>Set Stop Loss and Take Profit levels</li>
              <li>Click <strong>Buy</strong> or <strong>Sell</strong></li>
            </ul>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>5</span>
            <span style={S.stepTitle}>Monitor your rules</span>
          </div>
          <div style={S.stepBody}>
            <p>FundedBirr tracks these rules on your challenge:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li><strong>Daily loss limit:</strong> 5% of starting balance</li>
              <li><strong>Max loss limit:</strong> 10% of starting balance</li>
              <li><strong>Profit target:</strong> 10% of starting balance</li>
              <li><strong>Minimum trading days:</strong> 5</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Check your <Link href="/dashboard" style={{ color: '#E8B84B' }}>dashboard</Link> for your rule tracking status.</p>
          </div>
        </div>

        <div style={S.warn}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Important</div>
          <p style={{ fontSize: '0.85rem', color: '#9A9880', lineHeight: 1.7, margin: 0 }}>
            Your FundedBirr dashboard is updated manually by admin. Check it daily.
            If you see &quot;Balance pending update&quot; it means admin hasn&apos;t synced yet.
            Contact support if your balance hasn&apos;t updated in over 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
