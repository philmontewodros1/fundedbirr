import { NextResponse } from 'next/server'
import { sendWelcomeEmail, sendChallengeEmail, sendChallengeFailedEmail, sendChallengePassedEmail, sendPayoutApprovedEmail } from '@/lib/resend'

export async function GET() {
  const testEmail = 'philmontewodrosbelay@gmail.com'
  const results: Record<string, string> = {}

  try {
    await sendWelcomeEmail(testEmail, 'Test User')
    results.welcome = 'sent'
  } catch (e: any) { results.welcome = e.message }

  try {
    await sendChallengeEmail(testEmail, 'Test User', 'BF25K')
    results.challenge = 'sent'
  } catch (e: any) { results.challenge = e.message }

  try {
    await sendChallengeFailedEmail(testEmail, 'Test User', 'BF25K', 'Maximum drawdown limit (10%) reached', 'https://fundedbirr.com', 8, 4.2, 12.5)
    results.failed = 'sent'
  } catch (e: any) { results.failed = e.message }

  try {
    await sendChallengePassedEmail(testEmail, 'Test User', 'BF25K', 'https://fundedbirr.com')
    results.passed = 'sent'
  } catch (e: any) { results.passed = e.message }

  try {
    await sendPayoutApprovedEmail(testEmail, 'Test User', 5600, 'Telebirr')
    results.payout = 'sent'
  } catch (e: any) { results.payout = e.message }

  return NextResponse.json({ results, resendKey: !!process.env.RESEND_API_KEY })
}
