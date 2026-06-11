'use client'

import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const standalone = (window.navigator as any).standalone
    const dismissed = localStorage.getItem('fb-install-banner-dismissed')
    if (iOS && !standalone && !dismissed) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="install-banner">
      <div className="install-banner-icon">FB</div>
      <div className="install-banner-text">
        <div className="install-banner-title">Install FundedBirr</div>
        <div className="install-banner-sub">
          Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
        </div>
      </div>
      <button
        className="install-banner-close"
        onClick={() => {
          localStorage.setItem('fb-install-banner-dismissed', 'true')
          setShow(false)
        }}
      >
        ✕
      </button>
    </div>
  )
}
