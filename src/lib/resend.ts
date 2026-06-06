import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
const from = process.env.EMAIL_FROM || 'noreply@fundedbirr.com';

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Welcome to FundedBirr 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#C9912A;">Welcome, ${name}!</h1>
          <p>You've taken the first step toward becoming a funded trader in Ethiopia.</p>
          <p style="background:#1a1a1a;color:#fff;padding:12px;border-radius:8px;">
            <strong>Next step:</strong> Buy a challenge at 
            <a href="https://fundedbirr.com/pricing" style="color:#C9912A;">fundedbirr.com/pricing</a>
          </p>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Welcome email error:', err);
  }
}

export async function sendChallengeEmail(email: string, name: string, accountSize: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Your Challenge is Active! 📊',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#1D7A4A;">Challenge Activated</h1>
          <p>Great news ${name} — your <strong>${accountSize.toUpperCase()}</strong> challenge is live!</p>
          <ul>
            <li>Log into your dashboard: <a href="https://fundedbirr.com/dashboard" style="color:#C9912A;">fundedbirr.com/dashboard</a></li>
            <li>Connect MT5 and start trading</li>
            <li>Hit the profit target to advance to Phase 2</li>
          </ul>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Challenge email error:', err);
  }
}

export async function sendChallengeFailedEmail(email: string, name: string, accountSize: string, reason: string, appUrl: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Challenge Failed — Don\'t Give Up 💪',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#E84B4B;">Challenge Failed</h1>
          <p>Hi ${name},</p>
          <p>Your <strong>${accountSize.toUpperCase()}</strong> challenge has been closed due to:</p>
          <p style="background:#1a1a1a;color:#ff6b6b;padding:12px;border-radius:8px;font-size:14px;">${reason}</p>
          <p>Don't be discouraged — many successful traders failed their first evaluation.</p>
          <p>
            <a href="${appUrl}/pricing" style="display:inline-block;background:#C9912A;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Try Again</a>
          </p>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
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
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#C9912A;">Reset Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to choose a new one.</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;background:#C9912A;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          </p>
          <p>If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="word-break:break-all;font-size:12px;color:#666;">${resetLink}</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
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
      subject: '🎉 You Passed! Welcome to Funded Status',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#1D7A4A;">Challenge Passed! 🏆</h1>
          <p>Congratulations ${name}!</p>
          <p>You have passed both phases of the <strong>${accountSize.toUpperCase()}</strong> challenge.</p>
          <p>You are now a <strong>FundedBirr funded trader</strong>. You keep 80% of all profits generated.</p>
          <ul>
            <li>Request your first payout from the dashboard</li>
            <li>Your challenge fee will be refunded with the first payout</li>
            <li>Continue trading — scaling starts after 3 months</li>
          </ul>
          <p>
            <a href="${appUrl}/dashboard" style="display:inline-block;background:#1D7A4A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Dashboard</a>
          </p>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
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
      subject: 'Payout Approved! 💰',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color:#1D7A4A;">Payout Approved</h1>
          <p>Congratulations ${name}!</p>
          <p>Your payout of <strong>${amount.toLocaleString()} ETB</strong> via <strong>${method}</strong> has been approved.</p>
          <p>Funds will be sent to your account within 48 hours.</p>
          <p style="color:#666;font-size:12px;">FundedBirr — Simulated evaluation, real rewards.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Payout email error:', err);
  }
}
