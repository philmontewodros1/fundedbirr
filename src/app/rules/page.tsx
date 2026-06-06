'use client';

import { useState } from 'react';

const RULE_CATEGORIES = [
  {
    title: 'Challenge Structure',
    rules: [
      {
        name: 'Two-Phase Evaluation',
        desc: 'Every challenge has two phases. Pass Phase 1 (Evaluation) to unlock Phase 2 (Verification). Pass both to reach Funded status. No time limit on either phase.',
      },
      {
        name: 'Phase 1 — Evaluation',
        target: '10%',
        items: ['Profit Target: 10% of starting balance', 'Daily Loss Limit: 5% of starting balance', 'Maximum Drawdown: 10% of starting balance', 'Minimum Trading Days: 5', 'Consistency Rule: No single day > 50% of total profits', 'Time Limit: None'],
      },
      {
        name: 'Phase 2 — Verification',
        target: '5%',
        items: ['Profit Target: 5% of starting balance', 'Daily Loss Limit: 5% of starting balance', 'Maximum Drawdown: 10% of starting balance', 'Minimum Trading Days: 3', 'Consistency Rule: No single day > 50% of total profits', 'Time Limit: None'],
      },
      {
        name: 'Funded Account',
        items: ['Profit Split: 80% to you, 20% to FundedBirr', 'Same drawdown rules apply', 'Payouts every 14 days via Telebirr or CBE Birr', 'Challenge fee refunded on first payout', 'Scaling: +50% account size after 3 months of consistent profitability'],
      },
    ],
  },
  {
    title: 'Risk Parameters',
    rules: [
      {
        name: 'Daily Loss Limit (5%)',
        desc: 'Your account cannot lose more than 5% of the starting balance in a single trading day. If your equity drops below this threshold at any point during the day, the phase is failed. This resets each trading day at market open.',
      },
      {
        name: 'Maximum Drawdown (10%)',
        desc: 'Your account cannot fall below 90% of the starting balance at any point during the entire phase. This is a static drawdown (calculated from starting balance, not a trailing high). Breach this limit and the phase ends immediately.',
      },
      {
        name: 'Consistency Rule (50%)',
        desc: 'No single trading day can account for more than 50% of your total profits in a phase. If your best day represents more than half your total gain, you have not demonstrated consistent profitability. Trade steadily over multiple sessions.',
      },
      {
        name: 'Profit Target',
        desc: 'Phase 1 requires 10% growth. Phase 2 requires 5% growth. Targets are calculated from the starting balance of each phase. There is no time limit — take as many trading days as you need.',
      },
    ],
  },
  {
    title: 'Trading Rules',
    rules: [
      {
        name: 'Allowed Instruments',
        desc: 'XAUUSD (Gold) is the primary instrument. Major forex pairs and indices are also available. Trading is on MT5 with real market spreads and execution.',
      },
      {
        name: 'Trading Styles',
        desc: 'Scalping, day trading, swing trading, and position trading are all permitted. No restrictions on holding times as long as positions are managed within risk limits.',
      },
      {
        name: 'Automated Trading',
        desc: 'Expert Advisors (EAs) and trading bots are permitted. The same risk rules apply — your EA must respect daily loss and maximum drawdown limits.',
      },
      {
        name: 'News Trading',
        desc: 'Trading during news events is permitted. However, increased volatility during news can rapidly hit your daily loss limit. Trade news at your own risk.',
      },
      {
        name: 'Weekend / Overnight',
        desc: 'Positions can be held overnight and over weekends. Be aware that gaps can affect your drawdown calculations. All positions must be managed within the drawdown limits.',
      },
      {
        name: 'Lot Size',
        desc: 'No fixed lot size limits. Position sizing must respect the daily loss and maximum drawdown parameters. Excessively risky position sizing that violates rules will result in phase failure.',
      },
      {
        name: 'Copy Trading',
        desc: 'Copy trading and signal services are not permitted. All trades must be your own analysis and execution.',
      },
    ],
  },
  {
    title: 'Payouts & Scaling',
    rules: [
      {
        name: 'Profit Split',
        desc: 'Funded traders keep 80% of all profits generated. FundedBirr retains 20%. Profit split is calculated per payout cycle.',
      },
      {
        name: 'Payout Schedule',
        desc: 'Payouts are processed every 14 days. Request via the dashboard. Payments sent via Telebirr, CBE Birr, or Awash Bank within 48 hours of approval.',
      },
      {
        name: 'Fee Refund',
        desc: 'Your challenge fee is refunded with your first successful payout. The evaluation is effectively free if you pass and become profitable.',
      },
      {
        name: 'Scaling Plan',
        desc: 'After 3 consecutive months of profitable trading with at least 2 payouts, your account size increases by 50%. Continue scaling every review period.',
      },
    ],
  },
  {
    title: 'Violations & Resets',
    rules: [
      {
        name: 'Phase Failure',
        desc: 'Breaching any rule (daily loss, max drawdown, consistency) ends the current phase immediately. The challenge is not terminated — you restart the failed phase.',
      },
      {
        name: 'Discounted Reset',
        desc: 'Failed a phase? Reset at 50% of the original challenge fee. No waiting period. You can reset immediately and try again.',
      },
      {
        name: 'Account Audit',
        desc: 'FundedBirr reserves the right to audit all trading activity. Any evidence of rule manipulation, arbitrage abuse, or prohibited strategies may result in permanent disqualification.',
      },
    ],
  },
];

export default function RulesPage() {
  const [openCat, setOpenCat] = useState<number | null>(0);

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="section-label" style={{ textAlign: 'center' }}>Guidelines</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: '0.75rem',
      }}>
        Trading Rules
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '550px', margin: '0 auto 3rem' }}>
        A two-phase evaluation designed to identify consistent, disciplined traders. 
        Clear rules, no hidden gotchas.
      </p>

      {RULE_CATEGORIES.map((cat, ci) => (
        <div key={cat.title} style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setOpenCat(openCat === ci ? null : ci)}
            style={{
              width: '100%', padding: '1rem 1.5rem', cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem',
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', color: 'var(--text)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              textAlign: 'left',
            }}
          >
            {cat.title}
            <span style={{
              color: 'var(--gold)',
              transform: openCat === ci ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>▼</span>
          </button>

          {openCat === ci && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {cat.rules.map((rule) => (
                <div key={rule.name} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '10px', padding: '1.25rem 1.5rem',
                }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: '0.9rem',
                    marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                    {rule.name}
                    {'target' in rule && (
                      <span style={{
                        background: 'rgba(201,145,42,0.15)', color: 'var(--gold-light)',
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
                        borderRadius: '100px',
                      }}>
                        Target: {rule.target}
                      </span>
                    )}
                  </div>
                  {'desc' in rule && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                      {rule.desc}
                    </div>
                  )}
                  {'items' in rule && (
                    <ul style={{
                      margin: '0.5rem 0 0', padding: '0',
                      listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    }}>
                      {(rule.items as string[]).map((item) => (
                        <li key={item} style={{
                          color: 'var(--text-muted)', fontSize: '0.82rem',
                          padding: '0.25rem 0', paddingLeft: '1.2rem',
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute', left: 0, color: 'var(--green-light)',
                          }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{
        marginTop: '3rem', background: 'rgba(201,145,42,0.05)',
        border: '1px solid rgba(201,145,42,0.2)', borderRadius: '12px',
        padding: '1.25rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Rule violations result in phase failure. Reset available at 50% discount.{' '}
          FundedBirr reserves the right to audit all trading activity.
        </div>
      </div>
    </section>
  );
}
