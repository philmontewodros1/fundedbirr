'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { INSTRUMENTS, INSTRUMENT_LIST, getContractSize } from '@/lib/constants'

interface Trade {
  id: string
  direction: 'buy' | 'sell'
  lot_size: number
  entry_price: number
  symbol: string
  exit_price?: number
  profit_loss: number
  sl?: number
  tp?: number
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string
}

interface Challenge {
  id: string
  virtual_balance: number
  current_balance: number
  current_equity: number
  daily_start_equity: number
  status: string
  account_size: string
  trading_days_count: number
  phase: number
}

const SPREAD: Record<string, number> = {
  XAUUSD: 0.30,
  XAGUSD: 0.50,
  EURUSD: 0.0002,
  GBPUSD: 0.0003,
  USDJPY: 0.03,
  AUDUSD: 0.0002,
  USDCAD: 0.0003,
  NZDUSD: 0.0002,
  EURJPY: 0.03,
  GBPJPY: 0.04,
  BTCUSD: 50,
  SPX500: 2,
  US30: 3,
  NAS100: 2,
}

function calcUnrealizedPnl(trade: Trade, price: number) {
  const cs = getContractSize(trade.symbol || 'XAUUSD')
  if (trade.direction === 'buy') return (price - trade.entry_price) * trade.lot_size * cs
  return (trade.entry_price - price) * trade.lot_size * cs
}

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 10000) / 100 : 0
}

export default function TradePage() {
  const chartRef = useRef<HTMLDivElement>(null)
  const tvWidgetRef = useRef<any>(null)

  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD')
  const [price, setPrice] = useState<number>(0)
  const [bid, setBid] = useState<number>(0)
  const [ask, setAsk] = useState<number>(0)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [openTrades, setOpenTrades] = useState<Trade[]>([])
  const [history, setHistory] = useState<Trade[]>([])
  const [tab, setTab] = useState<'positions' | 'history'>('positions')
  const [lotSize, setLotSize] = useState<number>(0.10)
  const [slInput, setSlInput] = useState<string>('')
  const [tpInput, setTpInput] = useState<string>('')
  const [overlay, setOverlay] = useState<null | 'failed' | 'passed' | 'phase2'>(null)
  const [failReason, setFailReason] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const phase = challenge?.phase || 1
  const profitTarget = phase === 1 ? 10 : 5
  const minDays = phase === 1 ? 5 : 3
  const instr = INSTRUMENTS[selectedSymbol]
  const spread = SPREAD[selectedSymbol] || 0.30
  const tvSymbol = selectedSymbol === 'BTCUSD' ? 'BINANCE:BTCUSDT' : selectedSymbol === 'XAUUSD' ? 'OANDA:XAUUSD' : `OANDA:${selectedSymbol}`

  const [tvChartId] = useState(() => 'tv_chart_' + Math.random().toString(36).slice(2, 8))
  const [tvReady, setTvReady] = useState(false)

  const [lastChallengeId, setLastChallengeId] = useState<string>('')

  useEffect(() => {
    import('@supabase/ssr').then(({ createBrowserClient }) => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.id) setUserId(user.id)
      })
    })
  }, [])

  const fetchChallenge = useCallback(async () => {
    if (!userId) return
    const res = await fetch(`/api/dashboard`)
    const data = await res.json()
    if (data?.activeChallenge) {
      setChallenge(data.activeChallenge)
      setLastChallengeId(data.activeChallenge.id)
    } else if (data?.lastChallenge) {
      setLastChallengeId(data.lastChallenge.id)
    }
  }, [userId])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  const fetchPositions = useCallback(async () => {
    if (!userId || !challenge?.id) return
    const res = await fetch(
      `/api/trade/positions?user_id=${userId}&challenge_id=${challenge.id}`
    )
    const data = await res.json()
    if (data?.trades) setOpenTrades(data.trades)
  }, [userId, challenge?.id])

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    const cid = challenge?.id || lastChallengeId
    if (!cid) return
    const res = await fetch(
      `/api/trade/history?user_id=${userId}&challenge_id=${cid}`
    )
    const data = await res.json()
    if (data?.trades) setHistory(data.trades)
  }, [userId, challenge?.id, lastChallengeId])

  useEffect(() => {
    fetchPositions()
    fetchHistory()
  }, [fetchPositions, fetchHistory])

  // load TradingView script once, signal when ready
  useEffect(() => {
    if (typeof (window as any).TradingView !== 'undefined') {
      setTvReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => setTvReady(true)
    document.head.appendChild(script)
  }, [])

  // recreate widget on symbol change (setSymbol is unreliable)
  useEffect(() => {
    if (!chartRef.current || !tvReady) return

    if (tvWidgetRef.current) {
      try { tvWidgetRef.current.remove() } catch (_) {}
      tvWidgetRef.current = null
    }

    const id = tvChartId
    chartRef.current.id = id
    const el = document.getElementById(id)
    if (el) el.innerHTML = ''

    const widget = new (window as any).TradingView.widget({
      container_id: id,
      width: '100%',
      height: 380,
      symbol: tvSymbol,
      interval: '60',
      timezone: 'Africa/Addis_Ababa',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#151810',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      details: true,
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'Stochastic@tv-basicstudies',
        'BB@tv-basicstudies',
      ],
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      support_host: 'https://www.tradingview.com',
    })
    widget.onChartReady(() => {
      tvWidgetRef.current = widget
    })

    return () => {
      if (tvWidgetRef.current) {
        try { tvWidgetRef.current.remove() } catch (_) {}
        tvWidgetRef.current = null
      }
    }
  }, [selectedSymbol, tvSymbol, tvReady])

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/price?symbol=${selectedSymbol}`)
        const data = await res.json()
        if (!data.price) return
        const p = Number(data.price)
        setPrice(p)
        setBid(Math.round((p - spread / 2) * 100) / 100)
        setAsk(Math.round((p + spread / 2) * 100) / 100)

        setOpenTrades((prev) => {
          const toClose = prev.filter((t) => {
            if (t.symbol !== selectedSymbol) return false
            if (t.direction === 'buy') {
              return (t.sl && p <= t.sl) || (t.tp && p >= t.tp)
            } else {
              return (t.sl && p >= t.sl) || (t.tp && p <= t.tp)
            }
          })
          if (toClose.length > 0) {
            setTimeout(() => {
              toClose.forEach((t) => closeTrade(t.id, p))
            }, 0)
          }
          return prev
        })
      } catch (_) {}
    }

    poll()
    const iv = setInterval(poll, 5000)
    return () => clearInterval(iv)
  }, [selectedSymbol])

  const liveEquity = challenge
    ? (challenge.current_balance || challenge.virtual_balance) +
      openTrades.reduce((sum, t) => sum + calcUnrealizedPnl(t, price), 0)
    : 0

  const startBal = challenge?.virtual_balance || 1
  const dailyStart = challenge?.daily_start_equity || startBal
  const dailyDDPct = Math.max(0, pct(dailyStart - liveEquity, startBal))
  const maxDDPct = Math.max(0, pct(startBal - liveEquity, startBal))
  const profitPct = pct(
    (challenge?.current_balance || startBal) - startBal,
    startBal
  )
  const tradingDays = challenge?.trading_days_count || 0

  const openTrade = async (direction: 'buy' | 'sell') => {
    if (!challenge || !userId) return setError('No active challenge')
    if (!price) return setError('Price not available')
    setLoading(true)
    setError('')
    try {
      const entryPrice = direction === 'buy' ? ask : bid
      const res = await fetch('/api/trade/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challenge.id,
          direction,
          lot_size: lotSize,
          entry_price: entryPrice,
          sl: slInput ? Number(slInput) : null,
          tp: tpInput ? Number(tpInput) : null,
          user_id: userId,
          symbol: selectedSymbol
        })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Failed to open trade')
      setOpenTrades((prev) => [data.trade, ...prev])
    } finally {
      setLoading(false)
    }
  }

  const closeTrade = async (tradeId: string, closePrice?: number) => {
    if (!userId) return
    const exitPrice = closePrice || price
    try {
      const res = await fetch('/api/trade/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_id: tradeId, exit_price: exitPrice, user_id: userId })
      })
      const data = await res.json()
      if (!res.ok) return

      setOpenTrades((prev) => prev.filter((t) => t.id !== tradeId))
      await fetchHistory()
      await fetchChallenge()

      if (data.challenge_status === 'failed') {
        setFailReason(data.fail_reason || 'Drawdown limit reached')
        setOverlay('failed')
      } else if (data.challenge_status === 'phase2') {
        setOverlay('phase2')
      } else if (data.challenge_status === 'passed') {
        setOverlay('passed')
      }
    } catch (_) {}
  }

  const ddColor = (pct: number) =>
    pct >= 4 ? '#E84B4B' : pct >= 3 ? '#E8B84B' : '#28A86A'

  return (
    <div style={{ background: '#0D0F0A', minHeight: '100vh', color: '#F5F2E8', fontFamily: 'DM Sans, sans-serif' }}>

      {/* TOP BAR */}
      <div style={{ background: '#151810', borderBottom: '1px solid #1E2218', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: '#9A9880', fontSize: '0.85rem', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#F0C060', fontSize: '1.1rem' }}>
            Funded<span style={{ color: '#28A86A' }}>Birr</span>
          </span>
          <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)}
            style={{ background: '#1E2218', border: '1px solid #2A2E20', color: '#F0C060', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer' }}>
            {INSTRUMENT_LIST.map((s) => (
              <option key={s} value={s} style={{ background: '#1E2218', color: '#F5F2E8' }}>{INSTRUMENTS[s].label}</option>
            ))}
          </select>
          {challenge && (
            <span style={{
              background: phase === 1 ? '#2A2010' : '#102A1A',
              color: phase === 1 ? '#E8B84B' : '#28A86A',
              padding: '0.2rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
            }}>
              Phase {phase}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.85rem' }}>
          <span>Live: <strong style={{ fontFamily: 'Syne, sans-serif', color: '#F0C060' }}>${price.toFixed(price < 10 ? 4 : 2)}</strong></span>
          {challenge && (
            <>
              <span>Balance: <strong style={{ color: '#28A86A' }}>${(challenge.current_balance || challenge.virtual_balance).toLocaleString()}</strong></span>
              <span>Equity: <strong style={{ color: liveEquity >= (challenge.current_balance || challenge.virtual_balance) ? '#28A86A' : '#E84B4B' }}>${liveEquity.toFixed(2)}</strong></span>
              <span style={{ background: '#1E2218', padding: '0.2rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                BF {challenge.account_size?.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, height: 'calc(100vh - 52px)' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div ref={chartRef} style={{ width: '100%', flex: '0 0 380px', background: '#151810' }} />

          <div style={{ background: '#151810', borderTop: '1px solid #1E2218', padding: '0 1.5rem', display: 'flex', gap: '1rem' }}>
            {(['positions', 'history'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', color: tab === t ? '#F0C060' : '#9A9880', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 0', borderBottom: tab === t ? '2px solid #F0C060' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
                {t === 'positions' ? `Open Positions (${openTrades.length})` : 'Trade History'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: '#0D0F0A' }}>
            {tab === 'positions' ? (
              openTrades.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9A9880', fontSize: '0.875rem' }}>No open positions</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#151810', color: '#9A9880' }}>
                      {['Symbol', 'Dir', 'Lots', 'Entry', 'Current', 'P&L', 'SL', 'TP', ''].map((h) => (
                        <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {openTrades.map((t) => {
                      const unrealized = calcUnrealizedPnl(t, price)
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #1E2218' }}>
                          <td style={{ padding: '0.6rem 1rem', color: '#9A9880' }}>{t.symbol || 'XAUUSD'}</td>
                          <td style={{ padding: '0.6rem 1rem', color: t.direction === 'buy' ? '#28A86A' : '#E84B4B', fontWeight: 700, textTransform: 'uppercase' }}>{t.direction}</td>
                          <td style={{ padding: '0.6rem 1rem' }}>{t.lot_size.toFixed(2)}</td>
                          <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif' }}>{t.entry_price.toFixed(t.entry_price < 10 ? 4 : 2)}</td>
                          <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif', color: '#E8B84B' }}>{price.toFixed(price < 10 ? 4 : 2)}</td>
                          <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: unrealized >= 0 ? '#28A86A' : '#E84B4B' }}>
                            {unrealized >= 0 ? '+' : ''}${unrealized.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.6rem 1rem', color: '#9A9880' }}>{t.sl || '—'}</td>
                          <td style={{ padding: '0.6rem 1rem', color: '#9A9880' }}>{t.tp || '—'}</td>
                          <td style={{ padding: '0.6rem 1rem' }}>
                            <button onClick={() => closeTrade(t.id)} style={{ background: '#2A1A1A', color: '#E84B4B', border: '1px solid #3A2020', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>✕ Close</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            ) : (
              history.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9A9880', fontSize: '0.875rem' }}>No trade history</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#151810', color: '#9A9880' }}>
                      {['Symbol', 'Date', 'Dir', 'Lots', 'Entry', 'Exit', 'P&L'].map((h) => (
                        <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #1E2218' }}>
                        <td style={{ padding: '0.6rem 1rem', color: '#9A9880', fontSize: '0.75rem' }}>{t.symbol || 'XAUUSD'}</td>
                        <td style={{ padding: '0.6rem 1rem', color: '#9A9880', fontSize: '0.75rem' }}>{t.closed_at ? new Date(t.closed_at).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '0.6rem 1rem', color: t.direction === 'buy' ? '#28A86A' : '#E84B4B', fontWeight: 700, textTransform: 'uppercase' }}>{t.direction}</td>
                        <td style={{ padding: '0.6rem 1rem' }}>{t.lot_size.toFixed(2)}</td>
                        <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif' }}>{t.entry_price.toFixed(t.entry_price < 10 ? 4 : 2)}</td>
                        <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif' }}>{t.exit_price?.toFixed(t.exit_price < 10 ? 4 : 2) || '—'}</td>
                        <td style={{ padding: '0.6rem 1rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: t.profit_loss >= 0 ? '#28A86A' : '#E84B4B' }}>
                          {t.profit_loss >= 0 ? '+' : ''}${t.profit_loss.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ background: '#151810', borderLeft: '1px solid #1E2218', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

          <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E2218' }}>
            <div style={{ fontSize: '0.7rem', color: '#9A9880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{instr?.label || selectedSymbol}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A9880' }}>BID</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#E84B4B' }}>{bid.toFixed(price < 10 ? 4 : 2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#9A9880' }}>ASK</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#28A86A' }}>{ask.toFixed(price < 10 ? 4 : 2)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <button onClick={() => openTrade('buy')} disabled={loading || !price}
                style={{ background: '#1D7A4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                ▲ BUY
              </button>
              <button onClick={() => openTrade('sell')} disabled={loading || !price}
                style={{ background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                ▼ SELL
              </button>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#9A9880', marginBottom: '0.4rem' }}>Lot Size</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                {[0.01, 0.05, 0.10, 0.50, 1.00].map((l) => (
                  <button key={l} onClick={() => setLotSize(l)}
                    style={{ background: lotSize === l ? '#C9912A' : '#1E2218', color: lotSize === l ? '#0D0F0A' : '#9A9880', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    {l.toFixed(2)}
                  </button>
                ))}
              </div>
              <input type="number" value={lotSize.toFixed(2)} onChange={(e) => setLotSize(Number(e.target.value))} min="0.01" max="10" step="0.01"
                style={{ width: '100%', background: '#1E2218', border: '1px solid #272C1F', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#F5F2E8', fontSize: '0.85rem', fontFamily: 'Syne, sans-serif' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A9880', marginBottom: '0.3rem' }}>Stop Loss</div>
                <input type="number" placeholder="Optional" value={slInput} onChange={(e) => setSlInput(e.target.value)} step="0.01"
                  style={{ width: '100%', background: '#1E2218', border: '1px solid #272C1F', borderRadius: '6px', padding: '0.4rem 0.5rem', color: '#F5F2E8', fontSize: '0.8rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A9880', marginBottom: '0.3rem' }}>Take Profit</div>
                <input type="number" placeholder="Optional" value={tpInput} onChange={(e) => setTpInput(e.target.value)} step="0.01"
                  style={{ width: '100%', background: '#1E2218', border: '1px solid #272C1F', borderRadius: '6px', padding: '0.4rem 0.5rem', color: '#F5F2E8', fontSize: '0.8rem' }} />
              </div>
            </div>

            {error && <div style={{ color: '#E84B4B', fontSize: '0.78rem', marginTop: '0.5rem' }}>{error}</div>}
          </div>

          {/* Account stats */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #1E2218' }}>
            <div style={{ fontSize: '0.7rem', color: '#9A9880', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Phase {phase} — {' '}
              <span style={{ color: '#F0C060' }}>{profitTarget}% target</span>
            </div>

            {[
              { label: 'Daily DD', value: dailyDDPct, max: 5, suffix: '%' },
              { label: 'Max DD', value: maxDDPct, max: 10, suffix: '%' },
              { label: 'Profit', value: profitPct, max: profitTarget, suffix: '%', positive: true }
            ].map(({ label, value, max, suffix, positive }) => (
              <div key={label} style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9A9880' }}>{label}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: positive ? (value >= max ? '#28A86A' : '#E8B84B') : ddColor(value) }}>
                    {positive && value > 0 ? '+' : ''}{value.toFixed(1)}{suffix} / {max}{suffix}
                  </span>
                </div>
                <div style={{ background: '#1E2218', borderRadius: '100px', height: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: positive ? '#28A86A' : ddColor(value), borderRadius: '100px', transition: 'width 0.3s' }} />
                </div>
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '0.75rem' }}>
              <div style={{ background: '#1E2218', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#9A9880' }}>Balance</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#F5F2E8' }}>
                  ${(challenge?.current_balance || challenge?.virtual_balance || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#1E2218', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#9A9880' }}>Min Days</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: tradingDays >= minDays ? '#28A86A' : '#E8B84B' }}>
                  {tradingDays}/{minDays}
                </div>
              </div>
            </div>

            <div style={{
              background: '#1E2218', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#9A9880', marginBottom: '0.25rem' }}>Consistency Rule</div>
              <div style={{ fontSize: '0.78rem', color: '#9A9880' }}>
                No day &gt; 50% of total profits
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#9A9880', lineHeight: 1.6 }}>
              <strong style={{ color: '#E8B84B', display: 'block', marginBottom: '0.3rem' }}>Phase {phase} Rules</strong>
              🎯 Profit target: {profitTarget}%<br />
              📉 Daily drawdown: max 5%<br />
              📉 Max drawdown: max 10%<br />
              📅 Min trading days: {minDays}<br />
              📊 Consistency: ≤50% per day<br />
              💰 Spread: {spread} pts
            </div>
          </div>
        </div>
      </div>

      {/* FAILED OVERLAY */}
      {overlay === 'failed' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1E0A0A', border: '1px solid #8B1A1A', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#E84B4B', marginBottom: '0.75rem' }}>Challenge Failed</h2>
            <p style={{ color: '#9A9880', marginBottom: '2rem', fontSize: '0.9rem' }}>{failReason}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="/pricing" style={{ background: '#C9912A', color: '#0D0F0A', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Buy New Challenge</a>
              <a href="/dashboard" style={{ background: '#1E2218', color: '#F5F2E8', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</a>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1 → PHASE 2 OVERLAY */}
      {overlay === 'phase2' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0A1A0F', border: '1px solid #C9912A', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#F0C060', marginBottom: '0.75rem' }}>Phase 1 Passed!</h2>
            <p style={{ color: '#9A9880', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              You hit the 10% target in {tradingDays} trading days.
            </p>
            <p style={{ color: '#28A86A', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
              Moving to Phase 2 — Verification
            </p>
            <p style={{ color: '#9A9880', marginBottom: '2rem', fontSize: '0.82rem' }}>
              Your balance has reset. Now grow 5% while respecting the same risk rules.
              Minimum 3 trading days.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="/dashboard/trade" style={{ background: '#C9912A', color: '#0D0F0A', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Continue Trading</a>
              <a href="/dashboard" style={{ background: '#1E2218', color: '#F5F2E8', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</a>
            </div>
          </div>
        </div>
      )}

      {/* FUNDED OVERLAY */}
      {overlay === 'passed' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0A1A0F', border: '1px solid #28A86A', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#F0C060', marginBottom: '0.75rem' }}>You Are Funded!</h2>
            <p style={{ color: '#9A9880', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Both phases complete. You are now a FundedBirr trader.
            </p>
            <p style={{ color: '#28A86A', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              80% profit split — payouts every 14 days
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="/dashboard" style={{ background: '#28A86A', color: '#0D0F0A', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Go to Dashboard</a>
              <a href="/dashboard/trade" style={{ background: '#1E2218', color: '#F5F2E8', padding: '0.75rem 1.5rem', borderRadius: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Continue Trading</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}