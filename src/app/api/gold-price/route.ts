import { NextResponse } from 'next/server'

let cachedPrice: { price: number; timestamp: string } | null = null
let lastFetch = 0
const CACHE_MS = 3000

export async function GET() {
  const now = Date.now()

  if (cachedPrice && now - lastFetch < CACHE_MS) {
    return NextResponse.json(cachedPrice)
  }

  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'FundedBirr/1.0' }
    })
    if (res.ok) {
      const data = await res.json()
      const price = data?.price
      if (price) {
        cachedPrice = { price: Number(price), timestamp: data.updatedAt || new Date().toISOString() }
        lastFetch = now
        return NextResponse.json(cachedPrice)
      }
    }
  } catch (_) {}

  try {
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      next: { revalidate: 0 }
    })
    if (res.ok) {
      const data = await res.json()
      const price = Array.isArray(data) ? data[0]?.gold : data?.gold
      if (price) {
        cachedPrice = { price: Number(price), timestamp: new Date().toISOString() }
        lastFetch = now
        return NextResponse.json(cachedPrice)
      }
    }
  } catch (_) {}

  if (cachedPrice) return NextResponse.json(cachedPrice)
  return NextResponse.json({ error: 'Price unavailable' }, { status: 503 })
}
