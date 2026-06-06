export default function TermsPage() {
  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
        letterSpacing: '-0.04em', marginBottom: '2rem',
      }}>
        Terms & Conditions
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>1. Platform Nature</strong><br />
          FundedBirr is a simulated prop trading evaluation platform. Users trade virtual capital in simulated market conditions. ETB payouts are rewards based on virtual trading performance. FundedBirr is NOT an investment firm, brokerage, or deposit-taking institution.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>2. Eligibility</strong><br />
          You must be 18+ years old and a resident of Ethiopia or any jurisdiction where participation is legal. You are responsible for compliance with local laws.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>3. Challenge Fees</strong><br />
          Challenge fees are non-refundable. Fees cover platform costs, evaluation, and verification. Failed phases may be reset at 50% discount.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>4. Trading Rules</strong><br />
          All trades must comply with the stated rules: daily loss limits, max drawdown, no EAs, minimum trading days. Violations result in phase failure.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>5. Payouts</strong><br />
          Payouts are processed within 48 hours via Telebirr, CBE Birr, Awash Bank, or Chapa. Minimum withdrawal: 500 ETB. Profit split: 80% trader / 20% platform.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>6. Risk Disclaimer</strong><br />
          Trading involves risk. Past performance does not guarantee future results. You may lose your entire challenge fee. Never trade with money you cannot afford to lose.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>7. Account Suspension</strong><br />
          FundedBirr reserves the right to suspend or terminate accounts for rule violations, fraud, or abuse. No refunds will be issued for terminated accounts.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>8. Privacy</strong><br />
          We collect minimal personal data (name, phone, email) for account verification. Data is never sold to third parties.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>9. Changes</strong><br />
          Terms may be updated at any time. Continued use constitutes acceptance of updated terms.
        </p>

        <p>
          <strong style={{ color: 'var(--text)' }}>10. Contact</strong><br />
          Questions? Contact us at support@fundedbirr.com or via Telegram.
        </p>
      </div>
    </section>
  );
}
