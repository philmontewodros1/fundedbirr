// src/app/api/gold-price/route.ts
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
    // Primary source
    const res = await fetch('https://api.metals.live/v1/spot/gold', {
      next: { revalidate: 0 }
    })
    if (res.ok) {
      const data = await res.json()
      // metals.live returns [{ gold: price }]
      const price = Array.isArray(data) ? data[0]?.gold : data?.gold
      if (price) {
        cachedPrice = { price: Number(price), timestamp: new Date().toISOString() }
        lastFetch = now
        return NextResponse.json(cachedPrice)
      }
    }
  } catch (_) {}

  try {
    // Fallback source
    const res2 = await fetch(
      'https://api.frankfurter.app/latest?from=XAU&to=USD',
      { next: { revalidate: 0 } }
    )
    if (res2.ok) {
      const data2 = await res2.json()
      const price = data2?.rates?.USD
      if (price) {
        cachedPrice = { price: Number(price), timestamp: new Date().toISOString() }
        lastFetch = now
        return NextResponse.json(cachedPrice)
      }
    }
  } catch (_) {}

  // If both fail, return last known price or error
  if (cachedPrice) return NextResponse.json(cachedPrice)
  return NextResponse.json({ error: 'Price unavailable' }, { status: 503 })
}
