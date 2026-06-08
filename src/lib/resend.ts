import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const from = process.env.EMAIL_FROM || 'noreply@fundedbirr.com';

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #0D0F0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .wrapper { max-width: 560px; margin: 0 auto; background: #0D0F0A; }
  .header { background: #151810; padding: 32px 40px; text-align: center; border-bottom: 2px solid #C9912A; }
  .header h1 { font-size: 24px; margin: 0; color: #F0C060; font-weight: 800; letter-spacing: -0.5px; }
  .header span { color: #28A86A; }
  .body { padding: 32px 40px; }
  .body p { color: #C8C5B8; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .body strong { color: #F5F2E8; }
  .stat-box { background: #151810; border: 1px solid #1E2218; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
  .stat-box .label { color: #9A9880; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .stat-box .value { color: #F5F2E8; font-size: 22px; font-weight: 800; }
  .stat-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .btn { display: inline-block; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; }
  .btn-gold { background: #C9912A; color: #0D0F0A; }
  .btn-green { background: #28A86A; color: #0D0F0A; }
  .btn-outline { background: transparent; border: 1px solid #C9912A; color: #C9912A; }
  .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #1E2218; }
  .footer p { color: #5A5A4A; font-size: 12px; margin: 4px 0; }
  .reason { background: #1E0A0A; border: 1px solid #8B1A1A; border-radius: 10px; padding: 16px 20px; color: #ff6b6b; font-size: 14px; margin: 16px 0; }
  .badge { display: inline-block; background: #1E2218; color: #F0C060; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
`;

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `Welcome to FundedBirr, ${name}!`,
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#9A9880;font-size:13px;margin:4px 0 0;">Ethiopia's Prop Trading Platform</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Welcome aboard, ${name}!</p>
            <p>You've joined FundedBirr — Ethiopia's first prop trading evaluation platform. Here's how to get started:</p>
            <div class="stat-box">
              <div style="margin-bottom:16px;">
                <div style="font-size:28px;margin-bottom:8px;">1️⃣</div>
                <p style="margin:0;"><strong>Choose your challenge</strong> — Pick from 5K to 100K account sizes that match your trading style.</p>
              </div>
              <div style="margin-bottom:16px;">
                <div style="font-size:28px;margin-bottom:8px;">2️⃣</div>
                <p style="margin:0;"><strong>Pass the evaluation</strong> — Choose 1-Step (10% target) or 2-Step (8% → 5% targets) while respecting drawdown limits.</p>
              </div>
              <div>
                <div style="font-size:28px;margin-bottom:8px;">3️⃣</div>
                <p style="margin:0;"><strong>Get funded</strong> — Keep 80% of every profit. Request payouts every 14 days.</p>
              </div>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://fundedbirr.com/pricing" class="btn btn-gold">Browse Challenges</a>
            </div>
            <p style="color:#9A9880;font-size:13px;">Have questions? Join our Telegram community — we're here to help.</p>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Welcome email error:', err);
  }
}

export async function sendChallengeEmail(email: string, name: string, accountSize: string, model?: string) {
  if (!process.env.RESEND_API_KEY) return;
  const isSingleStep = model === '1step';
  const profitTarget = isSingleStep ? '10%' : '8% (Phase 1) / 5% (Phase 2)';
  const dailyLoss = isSingleStep ? '3%' : '5%';
  const maxLoss = isSingleStep ? '6%' : '10%';
  const minDays = '3';
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `Your ${accountSize.toUpperCase()} Challenge Is Live!`,
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#28A86A;font-size:13px;margin:4px 0 0;">Challenge Activated ✓</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Your challenge is live, ${name}!</p>
            <p>Your <strong>${accountSize.toUpperCase()}</strong> evaluation has been activated. You're now in <strong>${isSingleStep ? 'Single Phase' : 'Phase 1'}</strong>.</p>
            <div class="stat-box">
              <div class="stat-row">
                <div><div class="label">Account Size</div><div class="value">${accountSize.toUpperCase()}</div></div>
                <div><div class="label">Phase</div><div class="value">${isSingleStep ? '1 / 1' : '1 / 2'}</div></div>
              </div>
              <div class="stat-row">
                <div><div class="label">Profit Target</div><div class="value">${profitTarget}</div></div>
                <div><div class="label">Min Trading Days</div><div class="value">${minDays}</div></div>
              </div>
              <div class="stat-row" style="margin-bottom:0;">
                <div><div class="label">Daily Max Loss</div><div class="value">${dailyLoss}</div></div>
                <div><div class="label">Max Total Loss</div><div class="value">${maxLoss}</div></div>
              </div>
            </div>
            <p><strong>Your trading objectives:</strong></p>
            ${isSingleStep
              ? `<p>📈 Grow your account by <strong>10%</strong> without breaching the daily (${dailyLoss}) or max (${maxLoss}) drawdown limits. Trade at least <strong>${minDays} days</strong> and keep each day under 50% of total profit. Hit the target and get funded directly!</p>`
              : `<p>📈 Grow your account by <strong>8%</strong> without breaching the daily (${dailyLoss}) or max (${maxLoss}) drawdown limits. Trade at least <strong>${minDays} days</strong> and keep each day under 50% of total profit.</p>
            <p style="margin-bottom:24px;">Pass Phase 1 and you'll advance to Phase 2 (5% target, minimum ${minDays} days). Complete both to become funded!</p>`}
            <div style="text-align:center;margin:24px 0;">
              <a href="https://fundedbirr.com/dashboard/trade" class="btn btn-gold">Start Trading</a>
            </div>
            <p style="color:#9A9880;font-size:13px;">Track your progress anytime from your <a href="https://fundedbirr.com/dashboard" style="color:#C9912A;">dashboard</a>.</p>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Challenge email error:', err);
  }
}

export async function sendChallengeFailedEmail(email: string, name: string, accountSize: string, reason: string, appUrl: string, tradingDays?: number, dailyDDPct?: number, maxDDPct?: number) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `Your ${accountSize.toUpperCase()} Challenge Has Ended`,
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#ff6b6b;font-size:13px;margin:4px 0 0;">Challenge Closed</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Hi ${name},</p>
            <p>Your <strong>${accountSize.toUpperCase()}</strong> challenge has been closed. Here's what happened:</p>
            <div class="reason">${reason}</div>
            ${tradingDays ? `
            <div class="stat-box">
              <div class="stat-row">
                <div><div class="label">Account</div><div class="value">${accountSize.toUpperCase()}</div></div>
                <div><div class="label">Trading Days</div><div class="value">${tradingDays}</div></div>
              </div>
              ${dailyDDPct !== undefined ? `<div class="stat-row">
                <div><div class="label">Daily Drawdown</div><div class="value" style="color:#ff6b6b;">${dailyDDPct}%</div></div>
                <div><div class="label">Max Drawdown</div><div class="value" style="color:#ff6b6b;">${maxDDPct}%</div></div>
              </div>` : ''}
            </div>` : ''}
            <div class="stat-box">
              <p style="text-align:center;color:#C8C5B8;margin:0 0 8px;font-size:14px;">This doesn't define you as a trader.</p>
              <p style="text-align:center;color:#9A9880;margin:0;font-size:13px;">Most successful traders failed multiple evaluations before passing. What matters is what you learn from it.</p>
            </div>
            <p><strong>Review and retry:</strong></p>
            <p>Your trade history is available on your dashboard. Review what went wrong and come back stronger.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}/pricing" class="btn btn-gold" style="margin-bottom:8px;">Start a New Challenge</a>
              <br/>
              <a href="${appUrl}/dashboard/trade" class="btn btn-outline" style="margin-top:8px;">Review Trade History</a>
            </div>
            <p style="color:#9A9880;font-size:13px;">Get a fresh perspective — every challenge is a new opportunity.</p>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Challenge failed email error:', err);
  }
}

export async function sendResetPasswordEmail(email: string, name: string, resetLink: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Reset your FundedBirr password',
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#9A9880;font-size:13px;margin:4px 0 0;">Password Reset</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Reset your password</p>
            <p>Hi ${name},</p>
            <p>We received a request to reset your FundedBirr password. Click the button below to choose a new one.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetLink}" class="btn btn-gold">Reset Password</a>
            </div>
            <p style="color:#9A9880;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break:break-all;font-size:12px;color:#5A5A4A;">${resetLink}</p>
            <p style="color:#9A9880;font-size:13px;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Reset password email error:', err);
    throw err;
  }
}

export async function sendChallengePassedEmail(email: string, name: string, accountSize: string, appUrl: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `🎉 Congratulations — You're Now a FundedBirr Trader!`,
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#28A86A;font-size:13px;margin:4px 0 0;">Challenge Passed ✓</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Congratulations, ${name}! 🏆</p>
            <p>You've successfully passed both phases of the <strong>${accountSize.toUpperCase()}</strong> challenge. You are now a <strong>FundedBirr funded trader</strong>.</p>
            <div class="stat-box">
              <p style="text-align:center;margin:0 0 4px;"><span style="font-size:36px;">🏆</span></p>
              <p style="text-align:center;color:#28A86A;font-size:20px;font-weight:700;margin:0;">You Are Funded</p>
              <p style="text-align:center;color:#9A9880;font-size:13px;margin:8px 0 0;">80% profit split — payouts every 14 days</p>
            </div>
            <p><strong>What happens next:</strong></p>
            <p>1️⃣ Continue trading — the account stays active for funded traders<br/>
            2️⃣ Request your first payout from the dashboard anytime<br/>
            3️⃣ Your challenge fee will be refunded with your first payout<br/>
            4️⃣ After 3 consistent months, you qualify for a 50% scaling increase</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}/dashboard" class="btn btn-green">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Challenge passed email error:', err);
  }
}

export async function sendPayoutApprovedEmail(email: string, name: string, amount: number, method: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `Payout of ${amount.toLocaleString()} ETB Approved!`,
      html: `
      <!DOCTYPE html>
      <html><head><style>${baseStyles}</style></head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Funded<span>Birr</span></h1>
            <p style="color:#28A86A;font-size:13px;margin:4px 0 0;">Payout Approved ✓</p>
          </div>
          <div class="body">
            <p style="font-size:18px;color:#F5F2E8;font-weight:600;">Payout approved, ${name}! 💰</p>
            <p>Your payout has been approved and is being processed.</p>
            <div class="stat-box">
              <div class="stat-row" style="margin-bottom:0;">
                <div><div class="label">Amount</div><div class="value" style="color:#28A86A;">${amount.toLocaleString()} ETB</div></div>
                <div><div class="label">Method</div><div class="value">${method}</div></div>
              </div>
            </div>
            <p>Funds will be sent to your account within <strong>48 hours</strong>. You'll receive a notification once the transfer is complete.</p>
            <p style="color:#9A9880;font-size:13px;">Keep trading — your next payout is just 14 days away.</p>
          </div>
          <div class="footer">
            <p>FundedBirr — Simulated evaluation, real rewards.</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </body></html>`,
    });
  } catch (err) {
    console.error('Payout email error:', err);
  }
}
