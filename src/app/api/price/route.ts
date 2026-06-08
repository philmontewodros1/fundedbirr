import { NextResponse } from 'next/server'

const YAHOO_SYMBOLS: Record<string, string> = {
  XAUUSD: 'XAUUSD=X',
  XAGUSD: 'XAGUSD=X',
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'USDJPY=X',
  AUDUSD: 'AUDUSD=X',
  USDCAD: 'USDCAD=X',
  NZDUSD: 'NZDUSD=X',
  EURJPY: 'EURJPY=X',
  GBPJPY: 'GBPJPY=X',
  BTCUSD: 'BTC-USD',
  SPX500: '^GSPC',
  US30: '^DJI',
  NAS100: '^IXIC',
}

let cache: Record<string, { price: number; ts: number }> = {}
const CACHE_MS = 5000

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbol = url.searchParams.get('symbol') || 'XAUUSD'
  const now = Date.now()

  if (cache[symbol] && now - cache[symbol].ts < CACHE_MS) {
    return NextResponse.json({ price: cache[symbol].price, symbol })
  }

  // XAUUSD: try gold-api.com first (most reliable)
  if (symbol === 'XAUUSD') {
    try {
      const res = await fetch('https://api.gold-api.com/price/XAU', {
        next: { revalidate: 0 },
        headers: { 'User-Agent': 'FundedBirr/1.0' }
      })
      if (res.ok) {
        const data = await res.json()
        const price = Number(data?.price)
        if (price) {
          cache[symbol] = { price, ts: now }
          return NextResponse.json({ price, symbol })
        }
      }
    } catch (_) {}

    try {
      const res = await fetch('https://api.metals.live/v1/spot/gold', {
        next: { revalidate: 0 }
      })
      if (res.ok) {
        const data = await res.json()
        const price = Array.isArray(data) ? Number(data[0]?.gold) : Number(data?.gold)
        if (price) {
          cache[symbol] = { price, ts: now }
          return NextResponse.json({ price, symbol })
        }
      }
    } catch (_) {}
  }

  // Yahoo Finance fallback for all instruments
  const yahooSymbol = YAHOO_SYMBOLS[symbol]
  if (yahooSymbol) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=5m`,
        { next: { revalidate: 0 }, headers: { 'User-Agent': 'FundedBirr/1.0' } }
      )
      if (res.ok) {
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        const quote = data?.chart?.result?.[0]?.indicators?.quote?.[0]
        const regularPrice = meta?.regularMarketPrice
        const closePrice = quote?.close?.filter((v: number | null) => v !== null)
        const lastPrice = closePrice?.[closePrice.length - 1]
        const price = Number(regularPrice || lastPrice || 0)
        if (price && price > 0) {
          cache[symbol] = { price, ts: now }
          return NextResponse.json({ price, symbol })
        }
      }
    } catch (_) {}
  }

  const cached = cache[symbol]
  if (cached) {
    return NextResponse.json({ price: cached.price, symbol, cached: true })
  }

  return NextResponse.json({ error: 'Price unavailable', symbol }, { status: 503 })
}