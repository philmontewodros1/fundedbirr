'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Accounts', href: '/pricing' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Payouts', href: '/#payouts' },
  { label: 'Academy ↗', href: 'https://fundedbirracademy.com', external: true },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'am'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('fb_lang') as 'en' | 'am' | null;
    if (saved) setLang(saved);
  }, []);

  function toggleLang() {
    const next = lang === 'en' ? 'am' : 'en';
    setLang(next);
    localStorage.setItem('fb_lang', next);
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50" style={{ background: 'rgba(13,15,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,145,42,0.15)' }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-[1.4rem] font-extrabold tracking-tight no-underline" style={{ fontFamily: "'Syne', sans-serif", color: 'var(--gold-light)' }}>
            Funded<span className="text-[var(--green-light)]">Birr</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm no-underline hover-nav"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm no-underline hover-nav"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLang}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              }}
            >
              {lang === 'en' ? 'አማ' : 'EN'}
            </button>
            <Link
              href="/auth/register"
              className="btn-primary px-5 py-2 rounded-lg text-sm no-underline"
            >
              Start Challenge →
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden" style={{ background: 'var(--dark-2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={toggleLang}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '6px',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, width: '100%', textAlign: 'center',
              }}
            >
              {lang === 'en' ? 'አማርኛ' : 'English'}
            </button>
            {NAV.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block text-sm no-underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm no-underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </Link>
              )
            )}
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="block text-center btn-primary px-5 py-2 rounded-lg text-sm no-underline"
            >
              Start Challenge →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
