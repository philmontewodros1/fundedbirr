'use client';

import { useState, useMemo } from 'react';

const CATEGORIES = [
  {
    name: 'Getting Started',
    questions: [
      { q: 'What is FundedBirr?', a: 'FundedBirr is a prop trading evaluation platform based in Ethiopia. We let talented traders trade a virtual account with real-sized capital. When you pass the evaluation and become funded, you earn real ETB payouts — a percentage of the profits you generate. Unlike a job or investment, you trade our capital and keep most of the profit.' },
      { q: 'How does the challenge work?', a: 'Every challenge has two phases. Phase 1 requires 10% growth with no single day exceeding 50% of total profits. Pass that to enter Phase 2 (5% target). Pass both to reach Funded status with 80% profit share. There is no time limit on either phase.' },
      { q: 'Do I need trading experience?', a: 'Basic trading knowledge is strongly recommended. We offer a free trial account so you can practice risk management and test your strategy before paying a challenge fee.' },
      { q: 'Is KYC required?', a: 'Yes. You must provide a valid Ethiopian ID before receiving payouts. This is a regulatory requirement and protects both parties.' },
      { q: 'Who can join FundedBirr?', a: 'Any Ethiopian resident aged 18+ with a valid ID can join. You need a Telebirr or CBE Birr account for payments.' },
      { q: 'Is FundedBirr a real investment?', a: 'No. FundedBirr is a trading evaluation platform. You trade on simulated accounts with real market conditions. Payouts are performance rewards for passing the evaluation and trading profitably — not investment returns.' },
    ],
  },
  {
    name: 'Payments & Fees',
    questions: [
      { q: 'How much does a challenge cost?', a: 'BF 10K — 3,000 ETB, BF 25K — 7,000 ETB, BF 50K — 12,000 ETB, BF 100K — 20,000 ETB. One-time fee, no subscriptions or hidden charges.' },
      { q: 'How do I pay?', a: 'We accept Telebirr, CBE Birr, and Awash Bank transfers. After choosing a plan, submit proof of payment on the payment page. Our team reviews and activates your challenge within 24 hours.' },
      { q: 'Is my challenge fee refundable?', a: 'Yes. Your challenge fee is refunded with your first successful payout as a funded trader. The evaluation is effectively free if you pass.' },
      { q: 'How do I get paid as a funded trader?', a: 'Funded traders receive 80% of all profits generated. Payouts are processed every 14 days via Telebirr, CBE Birr, or Awash Bank. Request payout from your dashboard — it processes within 48 hours.' },
      { q: 'Is there a minimum payout amount?', a: 'The minimum payout is 1,000 ETB. There is no maximum — withdraw whatever portion of your profits you want each cycle.' },
      { q: 'What is the profit split?', a: 'You keep 80% of all profits. FundedBirr retains 20%. The profit share is calculated per payout cycle. Example: if you generate 10,000 ETB in profits over 14 days, you receive 8,000 ETB.' },
    ],
  },
  {
    name: 'Rules & Risk',
    questions: [
      { q: 'What is the daily loss limit?', a: '5% of the starting balance. If your equity drops below 95% of the starting balance at any point during a single trading day, the phase is failed. The limit resets each trading day at market open.' },
      { q: 'What is the maximum drawdown?', a: '10% of the starting balance (static drawdown). Your account can never fall below 90% of the initial balance during the entire phase. This is not trailing — it is calculated from the starting balance only.' },
      { q: 'What is the consistency rule?', a: 'No single trading day can account for more than 50% of your total profits in a phase. If your best day is more than half the total gain, you have not demonstrated consistent profitability. Trade steadily across multiple days.' },
      { q: 'What happens if I violate a rule?', a: 'The current phase ends immediately. Your challenge is not terminated — you restart the failed phase at a 50% discounted reset fee.' },
      { q: 'Can I reset a failed challenge?', a: 'Yes. Reset at 50% of the original challenge fee. No waiting period. Apply from your dashboard and submit payment.' },
      { q: 'Is there a time limit?', a: 'No time limit on either phase. Take as many trading days as you need. This removes the pressure of deadlines and lets you trade naturally.' },
    ],
  },
  {
    name: 'Trading',
    questions: [
      { q: 'What instruments can I trade?', a: 'XAUUSD (Gold) is our primary market. Major forex pairs (EURUSD, GBPUSD, USDJPY, etc.) and indices are also available. Trading is on MT5 with real market spreads and execution.' },
      { q: 'What trading styles are allowed?', a: 'Day trading, swing trading, scalping, and position trading are all permitted. There are no restrictions on holding times as long as you respect risk limits.' },
      { q: 'Are Expert Advisors (EAs) and bots allowed?', a: 'Yes, automated trading is permitted. Your EA must respect the same daily loss limit, maximum drawdown, and consistency rules as manual trading.' },
      { q: 'Are there lot size restrictions?', a: 'No fixed lot size limits. However, position sizing must be consistent with the daily loss and maximum drawdown parameters. Excessively risky sizing that violates limits ends the phase.' },
      { q: 'Can I trade during news?', a: 'Yes, news trading is permitted. Be aware that volatility during news can rapidly hit your daily loss limit. Trade at your own risk.' },
      { q: 'Can I hold positions overnight or over weekends?', a: 'Yes. Positions can be held overnight and through weekends. Be aware that gap risk can affect drawdown calculations.' },
      { q: 'Is copy trading allowed?', a: 'No. All trades must be your own analysis and manual execution. Copy trading and signal services are prohibited.' },
    ],
  },
  {
    name: 'Account & Dashboard',
    questions: [
      { q: 'How do I create an account?', a: 'Click "Start Now" on the homepage, enter your full name, email, and password. After registering, you can purchase a challenge from the pricing page.' },
      { q: 'How do I track my progress?', a: 'The dashboard shows your active challenge, current P&L, daily loss tracker, max drawdown, profit target progress, and trading history. All in real-time.' },
      { q: 'Can I have multiple challenges?', a: 'Yes. You can purchase and manage multiple challenges simultaneously. Each challenge has its own dashboard view.' },
      { q: 'How do I view my trading history?', a: 'Go to Dashboard → Trade History. All your closed trades are displayed with entry/exit prices, P&L, dates.' },
    ],
  },
  {
    name: 'Scaling & Upgrades',
    questions: [
      { q: 'What is the scaling plan?', a: 'After 3 consecutive months of profitable trading as a funded trader with at least 2 payouts, your account size increases by 50%. This continues every review period.' },
      { q: 'Can I upgrade my plan?', a: 'Yes. You can upgrade to a larger account size. The difference in challenge fee applies. Contact support for upgrade requests.' },
      { q: 'Can I downgrade my plan?', a: 'No. You cannot downgrade an active challenge. Choose your plan carefully when purchasing.' },
    ],
  },
  {
    name: 'Technical Issues',
    questions: [
      { q: 'Why is my chart not loading?', a: 'Ensure your internet connection is stable. If TradingView charts do not load, try refreshing the page. If the issue persists, contact support.' },
      { q: 'Why is my trade not executing?', a: 'Check your internet connection. Ensure you have sufficient balance for margin requirements. Live market conditions include real spreads and slippage.' },
      { q: 'I forgot my password. What do I do?', a: 'Click "Forgot Password" on the login page. Enter your email and follow the reset link sent to your inbox.' },
      { q: 'How do I contact support?', a: 'Send a message on Telegram via the Telegram icon at the bottom-right of the screen. Or email support@fundedbirr.com.' },
    ],
  },
  {
    name: 'Affiliates & Referrals',
    questions: [
      { q: 'Is there an affiliate program?', a: 'Yes. Earn 10% commission on every challenge fee paid by traders you refer. Commissions are paid via Telebirr or CBE Birr.' },
      { q: 'How do I refer someone?', a: 'Your unique referral code appears in your dashboard. Share it with other traders. When they register with your code, you earn 10% of their challenge fee.' },
      { q: 'When do affiliate commissions pay out?', a: 'Commissions are paid after the referred trader\'s challenge is activated. Payouts process within 7 days of challenge activation.' },
    ],
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<{ cat: number; q: number } | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const lower = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) => item.q.toLowerCase().includes(lower) || item.a.toLowerCase().includes(lower)
      ),
    })).filter((cat) => cat.questions.length > 0);
  }, [search]);

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

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.85rem 1.25rem',
            background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      {filtered.map((cat, ci) => (
        <div key={cat.name} style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem',
            color: 'var(--gold)', marginBottom: '0.75rem',
          }}>
            {cat.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cat.questions.map((item, qi) => {
              const key = { cat: ci, q: qi };
              const isOpen = openIdx?.cat === ci && openIdx?.q === qi;
              return (
                <div key={item.q} style={{
                  background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : key)}
                    style={{
                      width: '100%', padding: '1.15rem 1.5rem', cursor: 'pointer',
                      fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.9rem',
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
                      padding: '0 1.5rem 1.15rem',
                      color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7,
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
          No results found for &quot;{search}&quot;
        </div>
      )}
    </section>
  );
}
