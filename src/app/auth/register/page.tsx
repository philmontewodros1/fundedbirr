'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const isTrial = searchParams.get('trial') === 'true';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ref) {
      localStorage.setItem('fb_ref', ref);
    }
  }, [ref]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body: Record<string, any> = { email, password, fullName, phone };
      if (ref) body.referredBy = ref;
      if (isTrial) body.isTrial = true;

      const savedRef = localStorage.getItem('fb_ref');
      if (savedRef && !ref) body.referredBy = savedRef;

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError('Account created but sign-in failed. Please log in.');
        return;
      }

      localStorage.removeItem('fb_ref');

      if (data.isTrial) {
        router.push('/dashboard/trade');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: '5rem 2rem', maxWidth: '460px', margin: '0 auto' }}>
      {ref && (
        <div style={{
          background: 'rgba(201,145,42,0.1)', border: '1px solid rgba(201,145,42,0.25)',
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
          textAlign: 'center', fontSize: '0.85rem', color: 'var(--accent)',
        }}>
          🎉 You were invited by a FundedBirr trader!
        </div>
      )}

      {isTrial && (
        <div style={{
          background: 'rgba(29,122,74,0.1)', border: '1px solid rgba(29,122,74,0.25)',
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
          textAlign: 'center', fontSize: '0.85rem', color: 'var(--green-light)',
        }}>
          🆓 Free Trial — no payment required
        </div>
      )}

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
            {isTrial ? 'Create Free Trial Account' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isTrial ? 'Start trading with $1,000 virtual' : ref ? `Referred by ${ref}` : 'Start your funded trader journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name</label>
            <input
              type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Abebe Kebede" required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phone Number</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+251 9XX XXX XXX" required
              style={{
                width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
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
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters" required minLength={8}
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
          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Creating Account...' : isTrial ? 'Start Free Trial' : 'Create Account'}
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>
          Already registered?{' '}
          <Link href="/auth/login" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
