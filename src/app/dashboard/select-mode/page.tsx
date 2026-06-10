'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SelectModePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'web' | 'mt5' | null>(null)
  const [mt5Server, setMt5Server] = useState('Exness-MT5Trial9')
  const [mt5Login, setMt5Login] = useState('')
  const [mt5Password, setMt5Password] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [userId, setUserId] = useState('')
  const [challenge, setChallenge] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => {
        if (d?.user?.id) {
          setUserId(d.user.id)
          fetch(`/api/dashboard?user_id=${d.user.id}`)
            .then(r => r.json())
            .then(data => {
              if (data?.challenge) {
                setChallenge(data.challenge)
                setChallengeId(data.challenge.id)
                if (data.challenge.trading_mode) {
                  router.push('/dashboard')
                }
              }
            })
        }
      })
  }, [])

  const submit = async () => {
    if (!mode) return setError('Please select a trading mode')
    if (mode === 'mt5' && (!mt5Login || !mt5Password)) {
      return setError('Enter your MT5 login and investor password')
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/challenge/select-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          user_id: userId,
          mode,
          mt5_server: mt5Server,
          mt5_login: mt5Login,
          mt5_investor_password: mt5Password,
          mt5_broker: 'Exness',
        })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      router.push(mode === 'web' ? '/dashboard/trade' : '/dashboard')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const S = {
    page: { minHeight: '100vh', background: '#0D0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'DM Sans, sans-serif' } as any,
    box: { width: '100%', maxWidth: '640px' } as any,
    label: { fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#E8B84B', fontWeight: 500, marginBottom: '0.5rem' },
    title: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#F5F2E8', marginBottom: '0.75rem', lineHeight: 1.1 },
    sub: { color: '#9A9880', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 },
    card: (selected: boolean, color: string) => ({
      background: selected ? `rgba(${color},0.08)` : '#151810',
      border: `2px solid ${selected ? `rgba(${color},0.6)` : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '16px', padding: '1.75rem', cursor: 'pointer',
      transition: 'all 0.2s', marginBottom: '1rem',
    }),
    badge: (color: string) => ({
      display: 'inline-block', fontSize: '0.65rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase' as const,
      letterSpacing: '0.08em', marginBottom: '0.75rem',
      background: `rgba(${color},0.12)`, color: `rgb(${color})`,
      border: `1px solid rgba(${color},0.25)`,
    }),
    cardTitle: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.4rem', color: '#F5F2E8' },
    cardDesc: { fontSize: '0.875rem', color: '#9A9880', lineHeight: 1.6 },
    pros: { marginTop: '1rem', display: 'flex', flexWrap: 'wrap' as const, gap: '6px' },
    pro: { fontSize: '0.72rem', background: '#1E2218', color: '#9A9880', padding: '3px 10px', borderRadius: '100px' },
    input: { width: '100%', background: '#151810', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#F5F2E8', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', outline: 'none', marginBottom: '0.75rem' },
    btn: { width: '100%', background: '#C9912A', color: '#0D0F0A', border: 'none', borderRadius: '10px', padding: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 },
    err: { color: '#E84B4B', fontSize: '0.82rem', marginTop: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(232,75,75,0.08)', borderRadius: '6px', border: '1px solid rgba(232,75,75,0.15)' },
  }

  return (
    <div style={S.page}>
      <div style={S.box}>
        <div style={S.label}>Step 1 of 1</div>
        <h1 style={S.title}>Choose your<br />trading mode</h1>
        <p style={S.sub}>
          Your challenge is active. Choose how you want to trade.
          {challenge && <span style={{ color: '#E8B84B' }}> Challenge: BF {challenge.account_size?.toUpperCase()} · ${Number(challenge.virtual_balance).toLocaleString()} virtual</span>}
        </p>

        <div style={S.card(mode === 'web', '201,145,42')} onClick={() => setMode('web')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={S.badge('201,145,42')}>Recommended</div>
              <div style={S.cardTitle}>FundedBirr Web Terminal</div>
              <div style={S.cardDesc}>
                Trade directly on fundedbirr.com. No downloads, no setup.
                Live XAUUSD gold prices, candlestick charts, BUY/SELL buttons,
                and automatic rule enforcement built in.
              </div>
              <div style={S.pros}>
                {['No download needed', 'Auto rule tracking', 'Live on any device', 'Instant start'].map(p => (
                  <span key={p} style={S.pro}>✓ {p}</span>
                ))}
              </div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${mode === 'web' ? '#C9912A' : '#333'}`, background: mode === 'web' ? '#C9912A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '1rem' }}>
              {mode === 'web' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0D0F0A' }} />}
            </div>
          </div>
        </div>

        <div style={S.card(mode === 'mt5', '75,158,255')} onClick={() => setMode('mt5')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={S.badge('75,158,255')}>Advanced</div>
              <div style={S.cardTitle}>MetaTrader 5 (MT5)</div>
              <div style={S.cardDesc}>
                Trade on your own Exness MT5 demo account.
                Use the professional MT5 platform with advanced charting,
                Expert Advisors, and more instruments. FundedBirr tracks
                your performance via read-only investor access.
              </div>
              <div style={S.pros}>
                {['Professional platform', 'Advanced charts', 'EA support', 'More instruments'].map(p => (
                  <span key={p} style={S.pro}>✓ {p}</span>
                ))}
              </div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${mode === 'mt5' ? '#4B9EFF' : '#333'}`, background: mode === 'mt5' ? '#4B9EFF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '1rem' }}>
              {mode === 'mt5' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0D0F0A' }} />}
            </div>
          </div>

          {mode === 'mt5' && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(75,158,255,0.15)', paddingTop: '1.5rem' }} onClick={e => e.stopPropagation()}>
              <p style={{ fontSize: '0.82rem', color: '#9A9880', marginBottom: '1rem' }}>
                Enter your Exness MT5 demo account details below.
                You can get these from your Exness Personal Area.
                We only use the <strong style={{ color: '#F5F2E8' }}>investor (read-only) password</strong>.
              </p>
              <label style={{ fontSize: '0.75rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>MT5 Server</label>
              <input style={S.input} value={mt5Server} onChange={e => setMt5Server(e.target.value)} placeholder="e.g. Exness-MT5Trial9" />
              <label style={{ fontSize: '0.75rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>MT5 Login Number</label>
              <input style={S.input} value={mt5Login} onChange={e => setMt5Login(e.target.value)} placeholder="e.g. 436307332" type="number" />
              <label style={{ fontSize: '0.75rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Investor Password (read-only)</label>
              <input style={S.input} value={mt5Password} onChange={e => setMt5Password(e.target.value)} placeholder="Your investor password" type="password" />
              <div style={{ fontSize: '0.72rem', color: '#9A9880', background: '#1E2218', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                How to find investor password: Exness Personal Area → your account → Change Password → Investor Password tab
              </div>
            </div>
          )}
        </div>

        {error && <div style={S.err}>{error}</div>}

        <button style={S.btn} onClick={submit} disabled={loading || !mode}>
          {loading ? 'Activating...' : mode === 'web' ? 'Start Trading on Web Terminal →' : mode === 'mt5' ? 'Connect MT5 & Start →' : 'Select a trading mode above'}
        </button>

        <p style={{ fontSize: '0.75rem', color: '#9A9880', textAlign: 'center', marginTop: '1rem' }}>
          This cannot be changed after selection. Choose carefully.
        </p>
      </div>
    </div>
  )
}
