'use client';

import { useState } from 'react';

const FAQS = [
  { q: 'Is FundedBirr a real investment?', a: 'No. FundedBirr is a trading evaluation platform. You trade on simulated/demo accounts. ETB payouts are performance rewards, not investment returns.' },
  { q: 'How do I get paid?', a: 'Once you pass both phases and reach the funded stage, you can request ETB payouts via Telebirr, CBE Birr, or Awash Bank. Payouts process within 48 hours.' },
  { q: 'What happens if I fail the challenge?', a: 'Your challenge ends. You can restart at a discounted reset fee. All rules and limits reset.' },
  { q: 'Do I need trading experience?', a: 'Basic trading knowledge is required. We recommend completing free trial accounts first.' },
  { q: 'Is KYC required?', a: 'Yes. A valid Ethiopian ID is required before receiving payouts.' },
  { q: 'What can I trade?', a: 'XAUUSD (Gold), major forex pairs, and indices on MT5.' },
  { q: 'How long do I have to complete the challenge?', a: 'No time limit. Minimum 3 trading days per phase.' },
  { q: 'What is the affiliate commission?', a: 'Earn 10% of every challenge fee paid by traders you refer.' },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Support</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '1rem',
      }}>
        Frequently Asked Questions
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', margin: '0 auto 3rem' }}>
        Everything you need to know about FundedBirr.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQS.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  width: '100%', padding: '1.25rem 1.5rem', cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.95rem',
                  background: 'transparent', border: 'none', color: 'var(--text)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  textAlign: 'left',
                }}
              >
                {item.q}
                <span style={{
                  color: 'var(--gold)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}>▼</span>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1.5rem 1.25rem',
                  color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7,
                }}>
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
