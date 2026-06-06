'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSent(true);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '460px', margin: '0 auto' }}>
      <div style={{
        background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 800,
            color: 'var(--gold-light)', letterSpacing: '-0.03em', textDecoration: 'none',
          }}>
            Funded<span style={{ color: 'var(--green-light)' }}>Birr</span>
          </Link>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.25rem' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ color: 'var(--green-light)', fontWeight: 600 }}>Check your inbox!</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              If an account exists for {email}, you'll receive a password reset link shortly.
            </p>
            <Link href="/auth/login" style={{ color: 'var(--gold-light)', textDecoration: 'none', fontSize: '0.85rem', display: 'block', marginTop: '1.5rem' }}>
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }}
              />
            </div>
            {error && (
              <div style={{ color: '#ff6b6b', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
            }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>
          Remember your password?{' '}
          <Link href="/auth/login" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}
