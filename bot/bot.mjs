import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const PLANS = [
  { name: 'Starter', virtual: '$5K', price: '1,500 ETB', target: '8%', daily: '4%', max: '8%' },
  { name: 'Standard', virtual: '$10K', price: '3,000 ETB', target: '8%', daily: '4%', max: '8%' },
  { name: 'Pro', virtual: '$25K', price: '7,000 ETB', target: '10%', daily: '5%', max: '10%' },
  { name: 'Elite', virtual: '$50K', price: '12,000 ETB', target: '10%', daily: '5%', max: '10%' },
  { name: 'Legend', virtual: '$100K', price: '20,000 ETB', target: '10%', daily: '5%', max: '10%' },
];

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🇪🇹 Welcome to FundedBirr!

Ethiopia's first funded trader platform.

💰 Pass our challenge → Earn ETB payouts via Telebirr & CBE

Use these commands:
/challenges — View account sizes & prices
/rules — Challenge rules
/faq — Frequently asked questions
/analyze — AI gold analysis
/affiliate — Your referral link
/contact — Talk to support

👉 Start your challenge: https://fundedbirr.com/pricing
  `);
});

bot.onText(/\/analyze/, async (msg) => {
  bot.sendMessage(msg.chat.id, '🤖 Analyzing XAUUSD...');

  try {
    const analysis = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{
        role: 'user',
        content: 'Give a brief XAUUSD gold trading bias for today. Include: trend direction, key levels, session to watch. Keep it under 200 words. Format for Telegram.'
      }]
    });

    bot.sendMessage(msg.chat.id, analysis.choices[0].message.content);
  } catch {
    bot.sendMessage(msg.chat.id, '⚠️ Analysis temporarily unavailable. Try again later.');
  }
});

bot.onText(/\/challenges/, (msg) => {
  let text = '📊 FundedBirr Account Sizes:\n\n';
  PLANS.forEach(p => {
    text += `• ${p.name} — ${p.virtual} virtual | ${p.price}\n  🎯 ${p.target} target · 📉 Daily ${p.daily} · Max ${p.max}\n\n`;
  });
  text += '✅ Phase 1: Hit profit target\n✅ Phase 2: Confirm consistency\n✅ Funded: Earn ETB payouts\n\n👉 Buy now: https://fundedbirr.com/pricing';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/rules/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📋 FundedBirr Trading Rules:

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
• KYC required before first payout
  `);
});

bot.onText(/\/faq/, (msg) => {
  bot.sendMessage(msg.chat.id, `
❓ FundedBirr FAQ:

Q: Is this real money?
A: No. Simulated demo accounts. ETB payouts are performance rewards.

Q: How do I get paid?
A: Telebirr, CBE Birr, Awash Bank. Payouts within 48 hours.

Q: What if I fail?
A: Restart at discounted reset fee.

Q: What can I trade?
A: XAUUSD (Gold), forex pairs, indices on MT5.

👉 Full FAQ: https://fundedbirr.com/faq
  `);
});

bot.onText(/\/affiliate/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🤝 FundedBirr Affiliate Program

Earn 10% commission on every challenge sale you refer!

1. Share your referral link
2. Friends buy challenges
3. You earn 10% in ETB

Payments via Telebirr. No limit on earnings.

👉 Dashboard: https://fundedbirr.com/dashboard
  `);
});

bot.onText(/\/contact/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📞 Contact FundedBirr

📱 Telegram: @FundedBirrSupport
📧 Email: support@fundedbirr.com
🌐 Web: https://fundedbirr.com

📍 Addis Ababa, Ethiopia
  `);
});

bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, `I didn't understand that. Try /start to see available commands.`);
  }
});

console.log('🤖 FundedBirr bot started');
