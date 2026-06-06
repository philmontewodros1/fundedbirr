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
