'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'am';

const T = {
  en: {
    hero: 'Get Funded.\nTrade Gold.\nEarn in Birr.',
    sub: "Join Ethiopia's most trusted prop trading evaluation platform. Pass our challenge, earn ETB payouts via Telebirr and CBE — no tricks, no scams.",
    start: 'Start Challenge →',
    trial: 'Free Trial Account',
  },
  am: {
    hero: 'ፈንድ ያግኙ።\nወርቅ ይነግዱ።\nበብር ያግኙ።',
    sub: 'የኢትዮጵያ በጣም የታመነ የትሬዲንግ ፕላትፎርም። ቻሌንጅ ያልፉ፣ በቴሌብር ወይም CBE ያግኙ።',
    start: 'ቻሌንጅ ጀምር →',
    trial: 'ነጻ ሙከራ',
  },
};

export default function HeroSection({ stats }: { stats: any }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('fb_lang') as Lang | null;
    if (saved) setLang(saved);
  }, []);

  const t = T[lang];

  return (
    <section style={{ padding: '5rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(201,145,42,0.1)', border: '1px solid rgba(201,145,42,0.25)',
        color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 500,
        padding: '0.35rem 0.85rem', borderRadius: '100px', marginBottom: '2rem',
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-light)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
        {lang === 'en' ? "Ethiopia's First Funded Trader Platform" : 'የኢትዮጵያ የመጀመሪያ የፈንድ ትሬዲንግ ፕላትፎርም'}
      </div>

      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.8rem, 6vw, 5rem)',
        fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em',
        marginBottom: '1.5rem', maxWidth: '800px', whiteSpace: 'pre-line',
      }}>
        {t.hero}
      </h1>

      <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '520px', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
        {t.sub}
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <Link href="/auth/register" className="btn-primary no-underline px-8 py-3 rounded-lg text-base">
          {t.start}
        </Link>
        <Link href="/free-trial" className="btn-secondary no-underline px-8 py-3 rounded-lg text-base">
          {t.trial}
        </Link>
      </div>

      <div style={{
        display: 'flex', gap: 0,
        border: '1px solid rgba(201,145,42,0.15)', borderRadius: '12px',
        overflow: 'hidden', background: 'var(--dark-2)',
      }}>
        {[
          { num: stats.total_traders > 0 ? `${stats.total_traders.toLocaleString()}+` : lang === 'en' ? 'Growing' : 'በማደግ ላይ', label: lang === 'en' ? 'Active traders' : 'ንቁ ተጠቃሚዎች' },
          { num: stats.total_paid_etb > 0 ? `ETB ${(stats.total_paid_etb / 1000).toFixed(1)}K` : 'ETB 0', label: lang === 'en' ? 'Total paid out' : 'ጠቅላላ ክፍያ' },
          { num: stats.total_challenges_passed > 0 ? `${Math.round((stats.total_challenges_passed / Math.max(stats.active_challenges + stats.total_challenges_passed, 1)) * 100)}%` : lang === 'en' ? 'New' : 'አዲስ', label: lang === 'en' ? 'Pass rate' : 'ማለፊያ ደረጃ' },
          { num: '48h', label: lang === 'en' ? 'Payout processing' : 'የክፍያ ጊዜ' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '1.5rem 1.25rem',
            borderRight: i < 3 ? '1px solid rgba(201,145,42,0.1)' : 'none',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800,
              color: 'var(--accent)', display: 'block', letterSpacing: '-0.03em',
            }}>{s.num}</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
