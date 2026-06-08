'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';

export default function KycPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<KycStatus>('not_submitted');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kyc/upload')
      .then(r => { if (r.status === 401) { router.push('/auth/login'); return null; } return r.json(); })
      .then(data => {
        if (!data) return;
        if (data.status === 'pending' && !data.documentUrl) {
          setStatus('not_submitted');
        } else {
          setStatus(data.status);
          setDocumentUrl(data.documentUrl);
          setSubmittedAt(data.submittedAt);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError('');
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(selectedFile.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, WebP, PDF.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    const form = new FormData();
    form.append('file', selectedFile);

    try {
      const res = await fetch('/api/kyc/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
      } else {
        setStatus('pending');
        setSubmittedAt(new Date().toISOString());
        setDocumentUrl(null);
        setSelectedFile(null);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <section style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</section>;
  }

  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Identity Verification (KYC)
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Upload a valid Ethiopian ID ( Kebele, Passport, Driving License) to verify your identity.
        KYC is required after passing Phase 1 to proceed.
      </p>

      <StatusCard status={status} submittedAt={submittedAt} documentUrl={documentUrl} />

      {status !== 'verified' && (
        <div style={{
          background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '1.5rem', marginTop: '1.5rem',
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
            {status === 'rejected' ? 'Re-upload Your Document' : 'Upload Your ID'}
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${selectedFile ? 'var(--green-light)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '12px', padding: '2.5rem 1.5rem', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              {selectedFile ? '📄' : '📎'}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              {selectedFile ? selectedFile.name : 'Click to select your ID document'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
              JPG, PNG, WebP, PDF &middot; Max 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary"
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '10px',
              border: 'none', fontSize: '1rem', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: !selectedFile || uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Submit for Review'}
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.75rem', textAlign: 'center' }}>
            Your document will be reviewed within 24 hours. You will be notified once verified.
          </p>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          ← Back to Dashboard
        </a>
      </div>
    </section>
  );
}

function StatusCard({ status, submittedAt, documentUrl }: { status: KycStatus; submittedAt: string | null; documentUrl: string | null }) {
  const config: Record<KycStatus, { icon: string; title: string; desc: string; color: string }> = {
    not_submitted: {
      icon: '📋',
      title: 'Not Submitted',
      desc: 'Please upload your ID document above.',
      color: 'var(--text-muted)',
    },
    pending: {
      icon: '⏳',
      title: 'Under Review',
      desc: `Submitted${submittedAt ? ' on ' + new Date(submittedAt).toLocaleDateString() : ''}. We will notify you once verified.`,
      color: 'var(--accent)',
    },
    verified: {
      icon: '✅',
      title: 'Verified',
      desc: 'Your identity has been verified. You can proceed with your challenge.',
      color: 'var(--green-light)',
    },
    rejected: {
      icon: '❌',
      title: 'Rejected',
      desc: 'Your document could not be verified. Please upload a clearer document.',
      color: '#ff6b6b',
    },
  };

  const c = config[status];
  return (
    <div style={{
      background: 'var(--dark-2)', border: `1px solid ${c.color}22`,
      borderRadius: '14px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{ fontSize: '2rem' }}>{c.icon}</div>
      <div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 0.25rem', color: c.color }}>
          {c.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>{c.desc}</p>
        {documentUrl && (
          <a href={documentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.5rem', display: 'inline-block' }}>
            View submitted document ↗
          </a>
        )}
      </div>
    </div>
  );
}
