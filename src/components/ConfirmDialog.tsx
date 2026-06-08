'use client';

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    }} onClick={onCancel}>
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '1.75rem', maxWidth: '420px', width: '90%',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '0.55rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: '#ccc', fontSize: '0.85rem', cursor: 'pointer',
          }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} style={{
            padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none',
            background: danger ? '#dc2626' : '#28A86A', color: '#fff', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
