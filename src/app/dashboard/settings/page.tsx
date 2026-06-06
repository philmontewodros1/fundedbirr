'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'profile' | 'password' | 'email'>('profile');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '');
        setNewEmail(user.email || '');
      }
    });

    fetch('/api/dashboard').then(r => r.json()).then(d => {
      if (d.profile) setName(d.profile.full_name || '');
    });
  }, []);

  async function updateName() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const admin = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error } = await supabase.from('users').update({ full_name: name }).eq('id', (await supabase.auth.getUser()).data.user?.id || '');
      if (error) throw error;
      setMessage('Name updated');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    setError('');
    setMessage('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated');
      setPassword('');
      setConfirm('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateEmail() {
    setError('');
    setMessage('');
    if (newEmail === email) return setError('New email is the same as current');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setMessage('Confirmation email sent to both addresses');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        ← Dashboard
      </Link>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Account Settings
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['profile', 'password', 'email'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize',
            background: tab === t ? 'var(--gold)' : 'var(--dark-2)',
            color: tab === t ? 'var(--dark)' : 'var(--text-muted)',
          }}>
            {t === 'profile' ? 'Profile' : t === 'password' ? 'Password' : 'Email'}
          </button>
        ))}
      </div>

      {message && (
        <div style={{ background: 'rgba(29,122,74,0.15)', color: 'var(--green-light)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.5rem' }}>
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email</label>
              <input type="email" value={email} disabled
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                  color: 'var(--text-muted)', fontSize: '0.9rem', outline: 'none', cursor: 'not-allowed',
                }} />
            </div>
            <button onClick={updateName} disabled={loading} className="btn-primary" style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
            }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={e => { e.preventDefault(); updatePassword(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              marginTop: '0.5rem',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {tab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Current Email</label>
              <input type="email" value={email} disabled
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                  color: 'var(--text-muted)', fontSize: '0.9rem', outline: 'none', cursor: 'not-allowed',
                }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>New Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
                style={{
                  width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              A confirmation email will be sent to both your current and new email addresses.
            </p>
            <button onClick={updateEmail} disabled={loading} className="btn-primary" style={{
              padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Sending...' : 'Change Email'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
