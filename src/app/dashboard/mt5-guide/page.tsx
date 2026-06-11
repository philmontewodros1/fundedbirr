'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function MT5GuidePage() {
  const [secret, setSecret] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.activeChallenge) {
          setSecret(d.activeChallenge.mt5_report_secret || '')
          setLogin(d.activeChallenge.mt5_login || '')
          setPassword(d.activeChallenge.mt5_password || d.activeChallenge.mt5_investor_password || '')
        }
      })
      .catch(() => {})
  }, [])

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
    code: { background: '#0D0F0A', border: '1px solid #1E2218', borderRadius: '8px', padding: '0.75rem', fontFamily: 'DM Mono, monospace' as any, fontSize: '0.8rem', color: '#E8B84B', letterSpacing: '0.02em', userSelect: 'all' as any, marginTop: '0.5rem' },
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
              <li><strong>Server:</strong> Your assigned MT5 server</li>
              <li><strong>Login:</strong> Your MT5 login number</li>
              <li><strong>Password:</strong> Your MT5 trading password</li>
            </ul>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>3</span>
            <span style={S.stepTitle}>Set up Auto Balance Reporter</span>
          </div>
          <div style={S.stepBody}>
            <p>Install the FundedBirr EA to automatically report your balance and equity every 5 minutes.</p>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', lineHeight: 2 }}>
              <li>
                <a href="/api/mt5/ea-download" style={{ color: '#4B9EFF' }} download>Download the FundedBirr_Reporter.mq5</a>
              </li>
              <li>Place the file in your MT5 <strong>MQL5/Experts</strong> folder</li>
              <li>Restart MT5 or right-click Experts → Refresh</li>
              <li>Drag <strong>FundedBirr_Reporter</strong> onto any chart</li>
              <li>In the dialog, enter your <strong>Report Secret</strong> (see below) and click OK</li>
              <li>Also whitelist the URL: Tools → Options → Expert Advisors → <strong>Allow WebRequest for https://www.fundedbirr.com</strong></li>
            </ol>
            {secret && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#9A9880', marginBottom: '0.3rem' }}>Your Report Secret (copy this):</div>
                <div style={S.code}>{secret}</div>
              </div>
            )}
            {login && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#9A9880', marginBottom: '0.3rem' }}>Your MT5 Login:</div>
                <div style={S.code}>{login}</div>
              </div>
            )}
            {password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#9A9880', marginBottom: '0.3rem' }}>Your MT5 Password:</div>
                <div style={S.code}>{password}</div>
              </div>
            )}
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>4</span>
            <span style={S.stepTitle}>Find XAUUSD (Gold)</span>
          </div>
          <div style={S.stepBody}>
            <p>In the Market Watch window (View → Market Watch), search for <strong>XAUUSD</strong>.</p>
            <p>Right-click on XAUUSD → select <strong>Chart Window</strong> to open the gold price chart.</p>
          </div>
        </div>

        <div style={S.step}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={S.stepNum}>5</span>
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
            <span style={S.stepNum}>6</span>
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
            <p style={{ marginTop: '0.75rem' }}>Check your <Link href="/dashboard" style={{ color: '#E8B84B' }}>dashboard</Link> for real-time rule tracking — the Reporter EA updates your balance every 5 minutes automatically.</p>
          </div>
        </div>

        <div style={S.warn}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Important</div>
          <p style={{ fontSize: '0.85rem', color: '#9A9880', lineHeight: 1.7, margin: 0 }}>
            The Reporter EA sends your balance and equity to FundedBirr every 5 minutes.
            Your dashboard updates automatically — no manual admin sync needed.
            Make sure to whitelist the URL in MT5 settings (Tools → Options → Expert Advisors → Allow WebRequest).
          </p>
        </div>
      </div>
    </div>
  )
}
