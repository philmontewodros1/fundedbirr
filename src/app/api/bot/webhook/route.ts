import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const PLANS = [
  { name: 'Starter', virtual: '$5K', price: '1,500 ETB', target: '8%', daily: '4%', max: '8%' },
  { name: 'Standard', virtual: '$10K', price: '3,000 ETB', target: '8%', daily: '4%', max: '8%' },
  { name: 'Pro', virtual: '$25K', price: '7,000 ETB', target: '10%', daily: '5%', max: '10%' },
  { name: 'Elite', virtual: '$50K', price: '12,000 ETB', target: '10%', daily: '5%', max: '10%' },
  { name: 'Legend', virtual: '$100K', price: '20,000 ETB', target: '10%', daily: '5%', max: '10%' },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const msg = update.message;
    if (!msg?.text) return NextResponse.json({ ok: true });

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === '/start') {
      await sendMessage(chatId, `🇪🇹 Welcome to FundedBirr!

Ethiopia's first funded trader platform.

💰 Pass our challenge → Earn ETB payouts via Telebirr & CBE

Use these commands:
/challenges — View account sizes & prices
/rules — Challenge rules
/faq — Frequently asked questions
/analyze — AI gold analysis
/affiliate — Your referral link
/contact — Talk to support

👉 Start your challenge: https://www.fundedbirr.com/pricing`);
    } else if (text === '/challenges') {
      let response = '📊 FundedBirr Account Sizes:\n\n';
      PLANS.forEach(p => {
        response += `• ${p.name} — ${p.virtual} virtual | ${p.price}\n  🎯 ${p.target} target · 📉 Daily ${p.daily} · Max ${p.max}\n\n`;
      });
      response += '✅ Phase 1: Hit profit target\n✅ Phase 2: Confirm consistency\n✅ Funded: Earn ETB payouts\n\n👉 Buy now: https://www.fundedbirr.com/pricing';
      await sendMessage(chatId, response);
    } else if (text === '/rules') {
      await sendMessage(chatId, `📋 FundedBirr Trading Rules:

Phase 1:
• 8-10% profit target (depends on account)
• 4-5% daily loss limit
• 8-10% max loss limit
• Min 3 trading days
• No time limit

Phase 2:
• 5% profit target
• Same drawdown rules
• Min 3 trading days
• Consistency rule: no single day >50% of profit

Funded Stage:
• Payout every 30 days
• Scaling after 10% monthly profit
• KYC required before first payout`);
    } else if (text === '/faq') {
      await sendMessage(chatId, `❓ FundedBirr FAQ:

Q: Is this real money?
A: No. Simulated demo accounts. ETB payouts are performance rewards.

Q: How do I get paid?
A: Telebirr, CBE Birr, Awash Bank. Payouts within 48 hours.

Q: What if I fail?
A: Restart at discounted reset fee.

Q: What can I trade?
A: XAUUSD (Gold), forex pairs, indices on MT5.

👉 Full FAQ: https://www.fundedbirr.com/faq`);
    } else if (text === '/affiliate') {
      await sendMessage(chatId, `🤝 FundedBirr Affiliate Program

Earn 10% commission on every challenge sale you refer!

1. Share your referral link
2. Friends buy challenges
3. You earn 10% in ETB

Payments via Telebirr. No limit on earnings.

👉 Dashboard: https://www.fundedbirr.com/dashboard`);
    } else if (text === '/contact') {
      await sendMessage(chatId, `📞 Contact FundedBirr

📱 Telegram: @FundedBirrSupport
📧 Email: support@fundedbirr.com
🌐 Web: https://www.fundedbirr.com

📍 Addis Ababa, Ethiopia`);
    } else if (text === '/analyze') {
      await sendMessage(chatId, '🤖 Analyzing XAUUSD...');
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [{
              role: 'user',
              content: 'Give a brief XAUUSD gold trading bias for today. Include: trend direction, key levels, session to watch. Keep it under 200 words. Format for Telegram.',
            }],
          }),
        });
        const data = await res.json();
        await sendMessage(chatId, data.choices?.[0]?.message?.content || '⚠️ No analysis available.');
      } catch {
        await sendMessage(chatId, '⚠️ Analysis temporarily unavailable. Try again later.');
      }
    } else if (!text.startsWith('/')) {
      await sendMessage(chatId, `I didn't understand that. Try /start to see available commands.`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Bot webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
