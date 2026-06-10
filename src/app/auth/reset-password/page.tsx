'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (type === 'recovery' && accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ error }) => {
        if (!error) setReady(true)
        else setError('Failed to verify reset link. Try requesting a new one.')
      })
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true)
      })
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') setReady(true)
      })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section style={{ padding: '5rem 2rem', maxWidth: '460px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '2.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.4rem', color: 'var(--green-light)' }}>Password Updated!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Redirecting to login...</p>
        </div>
      </section>
    );
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
            {ready ? 'Set New Password' : error ? 'Link Expired' : 'Verifying...'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {ready ? 'Enter your new password below' : error ? error : 'Please wait while we verify your reset link...'}
          </p>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            {error && (
              <div style={{ color: '#ff6b6b', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
            {!error && (
              <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--gold-light)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            )}
          </div>
        )}

        {!ready && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>
            Didn&apos;t work?{' '}
            <Link href="/auth/forgot-password" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>Request a new link</Link>
          </p>
        )}
      </div>
    </section>
  );
}
