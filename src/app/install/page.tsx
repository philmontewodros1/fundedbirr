'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function InstallPage() {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
  }, [])

  const S = {
    page: { background: '#0D0F0A', minHeight: '100vh', color: '#F5F2E8', fontFamily: 'DM Sans, sans-serif', padding: '3rem 2rem' },
    inner: { maxWidth: '680px', margin: '0 auto' },
    back: { color: '#E8B84B', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' },
    title: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' },
    sub: { color: '#9A9880', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 },
    card: { background: '#151810', border: '1px solid #1E2218', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.25rem' },
    num: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#C9912A', color: '#0D0F0A', width: 28, height: 28, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginRight: '0.75rem', flexShrink: 0 },
    heading: { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#F5F2E8', display: 'flex', alignItems: 'center' },
    body: { fontSize: '0.85rem', color: '#9A9880', lineHeight: 1.7, marginTop: '1rem', paddingLeft: '2.4rem' },
    note: { marginTop: '2rem', background: 'rgba(40,168,106,0.08)', border: '1px solid rgba(40,168,106,0.2)', borderRadius: '12px', padding: '1.25rem' },
  }

  const Step = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
    <div style={S.card}>
      <div style={S.heading}>
        <span style={S.num}>{num}</span> {title}
      </div>
      <div style={S.body}>{children}</div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <Link href="/" style={S.back}>← Back to Home</Link>
        <h1 style={S.title}>Install FundedBirr</h1>
        <p style={S.sub}>Add FundedBirr to your home screen for the best experience — full screen, no browser bar, quick access.</p>

        {isIOS ? (
          <>
            <Step num={1} title="Open in Safari">
              <p>Make sure you&apos;re viewing this page in <strong>Safari</strong> (not Chrome or another browser).</p>
            </Step>
            <Step num={2} title="Tap the Share button">
              <p>Look at the bottom center of Safari — tap the <strong>Share icon</strong> (a square with an arrow pointing up).</p>
            </Step>
            <Step num={3} title="Add to Home Screen">
              <p>Scroll down in the share sheet and tap <strong>&quot;Add to Home Screen&quot;</strong> (with a + icon).</p>
            </Step>
            <Step num={4} title="Tap Add">
              <p>Tap <strong>Add</strong> in the top right corner. FundedBirr will appear on your home screen with its icon.</p>
            </Step>
          </>
        ) : (
          <>
            <Step num={1} title="Open in Chrome">
              <p>Open fundedbirr.com in <strong>Google Chrome</strong> on your Android phone.</p>
            </Step>
            <Step num={2} title="Tap the menu">
              <p>Tap the <strong>three dots</strong> menu icon in the top right corner.</p>
            </Step>
            <Step num={3} title="Add to Home Screen">
              <p>Tap <strong>&quot;Add to Home Screen&quot;</strong> or <strong>&quot;Install App&quot;</strong> from the menu.</p>
            </Step>
            <Step num={4} title="Tap Install">
              <p>Tap <strong>Install</strong> — FundedBirr will appear on your home screen like a real app.</p>
            </Step>
          </>
        )}

        <div style={S.note}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#28A86A', marginBottom: '0.5rem' }}>
            ✓ Installed successfully?
          </div>
          <p style={{ fontSize: '0.85rem', color: '#9A9880', margin: 0, lineHeight: 1.6 }}>
            You should now see the FundedBirr icon on your home screen. Tap it to open the app in full screen — no address bar, no tabs, just pure trading.
          </p>
        </div>
      </div>
    </div>
  )
}
