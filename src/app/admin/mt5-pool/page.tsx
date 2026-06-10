'use client'
import { useEffect, useState } from 'react'

interface MT5Challenge {
  id: string
  mt5_login: string
  mt5_server: string
  virtual_balance: number
  current_balance: number
  current_equity: number
  trading_days_count: number
  mt5_last_sync: string
  status: string
  account_size: string
  users: { full_name: string; email: string }
}

export default function AdminMT5Page() {
  const [challenges, setChallenges] = useState<MT5Challenge[]>([])
  const [syncModal, setSyncModal] = useState<MT5Challenge | null>(null)
  const [balance, setBalance] = useState('')
  const [equity, setEquity] = useState('')
  const [addDay, setAddDay] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [poolAccounts, setPoolAccounts] = useState<any[]>([])
  const [addForm, setAddForm] = useState({ server: 'Exness-MT5Trial9', login: '', password: '', investor_password: '', balance_usd: '10000', challenge_size: 'bf10k' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [tab, setTab] = useState<'sync' | 'pool'>('sync')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [syncRes, poolRes] = await Promise.all([
        fetch('/api/admin/mt5-sync'),
        fetch('/api/admin/mt5-pool'),
      ])
      const syncData = await syncRes.json()
      const poolData = await poolRes.json()
      setChallenges(syncData.challenges || [])
      setPoolAccounts(poolData.accounts || [])
    } catch (e) {
      console.error('fetchData error', e)
    }
  }

  const openSync = (c: MT5Challenge) => {
    setSyncModal(c)
    setBalance(c.current_balance?.toString() || c.virtual_balance.toString())
    setEquity(c.current_equity?.toString() || c.virtual_balance.toString())
    setAddDay(false)
    setSyncResult(null)
  }

  const submitSync = async () => {
    if (!syncModal) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/mt5-sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: syncModal.id, balance: Number(balance), equity: Number(equity), add_trading_day: addDay })
      })
      const data = await res.json()
      setSyncResult(data)
      if (data.success) await fetchData()
    } catch (e: any) {
      setSyncResult({ error: e.message })
    }
    setSyncing(false)
  }

  const addToPool = async () => {
    setAddError('')
    if (!addForm.login || !addForm.password || !addForm.investor_password) {
      setAddError('Please fill in all account fields')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/mt5-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add account'); setAdding(false); return }
      await fetchData()
      setAddForm({ server: 'Exness-MT5Trial9', login: '', password: '', investor_password: '', balance_usd: '10000', challenge_size: 'bf10k' })
    } catch (e: any) {
      setAddError(e.message || 'Network error')
    }
    setAdding(false)
  }

  const rowColor = (c: MT5Challenge) => {
    const start = c.virtual_balance
    const dd = ((start - (c.current_equity || start)) / start) * 100
    const profit = (((c.current_balance || start) - start) / start) * 100
    if (dd >= 9 || c.status === 'failed') return 'rgba(232,75,75,0.06)'
    if (dd >= 7) return 'rgba(232,184,75,0.06)'
    if (profit > 0) return 'rgba(40,168,106,0.04)'
    return 'transparent'
  }

  const S = {
    page: { background: '#0D0F0A', minHeight: '100vh', color: '#F5F2E8', fontFamily: 'DM Sans, sans-serif', padding: '2rem' },
    title: { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.04em', marginBottom: '2rem' },
    backLink: { color: '#E8B84B', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' },
    tab: (active: boolean) => ({ background: active ? '#C9912A' : '#151810', color: active ? '#0D0F0A' : '#9A9880', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginRight: '8px' }),
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.82rem' },
    th: { padding: '0.75rem 1rem', textAlign: 'left' as const, color: '#9A9880', fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', borderBottom: '1px solid #1E2218', fontWeight: 500 },
    td: { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    syncBtn: { background: '#1E2218', color: '#E8B84B', border: '1px solid rgba(232,184,75,0.2)', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 },
    modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalBox: { background: '#151810', border: '1px solid #272C1F', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '90vw' },
    input: { width: '100%', background: '#0D0F0A', border: '1px solid #272C1F', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F5F2E8', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', marginBottom: '0.75rem' },
    submitBtn: { width: '100%', background: '#C9912A', color: '#0D0F0A', border: 'none', borderRadius: '8px', padding: '0.8rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' },
  }

  const lastSyncAge = (ts: string) => {
    if (!ts) return 'Never'
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  }

  return (
    <div style={S.page}>
      <a href="/admin" style={S.backLink}>← Back to Admin</a>
      <h1 style={S.title}>MT5 Management</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button style={S.tab(tab === 'sync')} onClick={() => setTab('sync')}>Active Challenges ({challenges.length})</button>
        <button style={S.tab(tab === 'pool')} onClick={() => setTab('pool')}>Account Pool ({poolAccounts.filter((a: any) => !a.is_assigned).length} available)</button>
      </div>

      {tab === 'sync' && (
        <div style={{ background: '#151810', border: '1px solid #1E2218', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Trader', 'MT5 Login', 'Challenge', 'Balance', 'Equity', 'DD%', 'Profit%', 'Days', 'Last Sync', 'Action'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {challenges.length === 0 && (
                <tr><td colSpan={10} style={{ ...S.td, textAlign: 'center', color: '#9A9880', padding: '2rem' }}>No active MT5 challenges</td></tr>
              )}
              {challenges.map(c => {
                const start = c.virtual_balance
                const bal = c.current_balance || start
                const eq = c.current_equity || start
                const dd = ((start - eq) / start * 100).toFixed(1)
                const profit = ((bal - start) / start * 100).toFixed(1)
                const ddNum = parseFloat(dd)
                return (
                  <tr key={c.id} style={{ background: rowColor(c) }}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 500 }}>{c.users?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9A9880' }}>{c.users?.email}</div>
                    </td>
                    <td style={{ ...S.td, fontFamily: 'Syne, sans-serif' }}>{c.mt5_login}</td>
                    <td style={S.td}><span style={{ fontSize: '0.75rem', background: '#1E2218', padding: '2px 8px', borderRadius: '4px' }}>BF {c.account_size?.toUpperCase()}</span></td>
                    <td style={{ ...S.td, fontFamily: 'Syne, sans-serif', color: bal >= start ? '#28A86A' : '#E84B4B' }}>${bal.toLocaleString()}</td>
                    <td style={{ ...S.td, fontFamily: 'Syne, sans-serif' }}>${eq.toLocaleString()}</td>
                    <td style={{ ...S.td, color: ddNum >= 4 ? '#E84B4B' : ddNum >= 3 ? '#E8B84B' : '#28A86A', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{dd}%</td>
                    <td style={{ ...S.td, color: parseFloat(profit) >= 0 ? '#28A86A' : '#E84B4B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{parseFloat(profit) > 0 ? '+' : ''}{profit}%</td>
                    <td style={S.td}>{c.trading_days_count || 0}/5</td>
                    <td style={{ ...S.td, fontSize: '0.75rem', color: '#9A9880' }}>{lastSyncAge(c.mt5_last_sync)}</td>
                    <td style={S.td}><button style={S.syncBtn} onClick={() => openSync(c)}>Sync</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pool' && (
        <div>
          <div style={{ background: '#151810', border: '1px solid #1E2218', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Add MT5 Account to Pool</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Server</label>
                <input style={S.input} value={addForm.server} onChange={e => setAddForm({ ...addForm, server: e.target.value })} placeholder="Exness-MT5Trial9" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Login Number</label>
                <input style={S.input} value={addForm.login} onChange={e => setAddForm({ ...addForm, login: e.target.value })} placeholder="436307332" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Trading Password</label>
                <input style={S.input} value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} type="password" placeholder="Main password" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Investor Password</label>
                <input style={S.input} value={addForm.investor_password} onChange={e => setAddForm({ ...addForm, investor_password: e.target.value })} type="password" placeholder="Investor password" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Balance (USD)</label>
                <select style={S.input} value={addForm.balance_usd} onChange={e => setAddForm({ ...addForm, balance_usd: e.target.value })}>
                  <option value="10000">$10,000 — BF 10K</option>
                  <option value="25000">$25,000 — BF 25K</option>
                  <option value="50000">$50,000 — BF 50K</option>
                  <option value="100000">$100,000 — BF 100K</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Challenge Size</label>
                <select style={S.input} value={addForm.challenge_size} onChange={e => setAddForm({ ...addForm, challenge_size: e.target.value })}>
                  <option value="bf10k">BF 10K</option>
                  <option value="bf25k">BF 25K</option>
                  <option value="bf50k">BF 50K</option>
                  <option value="bf100k">BF 100K</option>
                </select>
              </div>
            </div>
            {addError && <div style={{ color: '#E84B4B', fontSize: '0.82rem', marginTop: '0.5rem' }}>{addError}</div>}
            <button style={{ ...S.submitBtn, width: 'auto', padding: '0.7rem 2rem' }} onClick={addToPool} disabled={adding}>
              {adding ? 'Adding...' : '+ Add to Pool'}
            </button>
          </div>

          <div style={{ background: '#151810', border: '1px solid #1E2218', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={S.table}>
              <thead>
                <tr>{['Login', 'Server', 'Balance', 'Size', 'Status', 'Assigned To', 'Added'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {poolAccounts.length === 0 && (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9A9880', padding: '2rem' }}>No accounts in pool. Add some above.</td></tr>
                )}
                {poolAccounts.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ ...S.td, fontFamily: 'Syne, sans-serif' }}>{a.login}</td>
                    <td style={S.td}>{a.server}</td>
                    <td style={{ ...S.td, fontFamily: 'Syne, sans-serif' }}>${Number(a.balance_usd).toLocaleString()}</td>
                    <td style={S.td}><span style={{ fontSize: '0.72rem', background: '#1E2218', padding: '2px 8px', borderRadius: '4px' }}>{a.challenge_size?.toUpperCase()}</span></td>
                    <td style={S.td}><span style={{ color: a.is_assigned ? '#E8B84B' : '#28A86A', fontSize: '0.75rem' }}>{a.is_assigned ? 'Assigned' : 'Available'}</span></td>
                    <td style={{ ...S.td, fontSize: '0.78rem', color: '#9A9880' }}>{a.is_assigned ? (a.users?.full_name || 'Unknown') : '—'}</td>
                    <td style={{ ...S.td, fontSize: '0.75rem', color: '#9A9880' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {syncModal && (
        <div style={S.modal} onClick={() => setSyncModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>Sync MT5 Balance</h3>
            <p style={{ fontSize: '0.82rem', color: '#9A9880', marginBottom: '1.5rem' }}>
              Login: <strong style={{ color: '#F5F2E8' }}>{syncModal.mt5_login}</strong> · {syncModal.users?.full_name}
            </p>
            <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Current Balance (USD)</label>
            <input style={S.input} value={balance} onChange={e => setBalance(e.target.value)} type="number" step="0.01" />
            <label style={{ fontSize: '0.72rem', color: '#9A9880', display: 'block', marginBottom: '4px' }}>Current Equity (USD)</label>
            <input style={S.input} value={equity} onChange={e => setEquity(e.target.value)} type="number" step="0.01" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9A9880', cursor: 'pointer', marginBottom: '1rem' }}>
              <input type="checkbox" checked={addDay} onChange={e => setAddDay(e.target.checked)} />
              Trader placed trades today (count as trading day)
            </label>

            {syncResult && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: syncResult.error ? 'rgba(232,75,75,0.08)' : syncResult.new_status === 'failed' ? 'rgba(232,75,75,0.08)' : syncResult.new_status === 'passed' ? 'rgba(40,168,106,0.08)' : '#1E2218', border: `1px solid ${syncResult.error ? 'rgba(232,75,75,0.2)' : syncResult.new_status === 'failed' ? 'rgba(232,75,75,0.2)' : syncResult.new_status === 'passed' ? 'rgba(40,168,106,0.2)' : '#272C1F'}` }}>
                {syncResult.error ? (
                  <div style={{ fontSize: '0.8rem', color: '#E84B4B', fontWeight: 500 }}>{syncResult.error}</div>
                ) : (
                  <>
                    <div style={{ fontSize: '0.8rem', color: '#F5F2E8', marginBottom: '4px', fontWeight: 500 }}>
                      {syncResult.status_changed ? `Status changed to: ${syncResult.new_status?.toUpperCase()}` : 'Synced successfully'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9A9880' }}>
                      Daily DD: {syncResult.daily_dd_pct}% · Max DD: {syncResult.max_dd_pct}% · Profit: {syncResult.profit_pct}% · Days: {syncResult.trading_days}
                    </div>
                    {syncResult.fail_reason && <div style={{ fontSize: '0.75rem', color: '#E84B4B', marginTop: '4px' }}>{syncResult.fail_reason}</div>}
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={S.submitBtn} onClick={submitSync} disabled={syncing}>{syncing ? 'Syncing...' : 'Save & Run Rule Check'}</button>
              <button style={{ ...S.submitBtn, background: '#1E2218', color: '#9A9880', flex: '0 0 auto', width: 'auto', padding: '0 1rem' }} onClick={() => setSyncModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
