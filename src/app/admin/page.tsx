import Link from 'next/link';

const ADMIN_LINKS = [
  { label: 'Traders', href: '/admin/traders', desc: 'All registered users, KYC status, active challenges' },
  { label: 'Payouts', href: '/admin/payouts', desc: 'Approve/reject payout requests, mark as paid' },
  { label: 'KYC', href: '/admin/kyc', desc: 'View uploaded ID documents, approve/reject' },
  { label: 'Challenges', href: '/admin/challenges', desc: 'All active challenges, manually pass/fail' },
];

export default function AdminPage() {
  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Admin Panel
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>FundedBirr administration dashboard.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {ADMIN_LINKS.map((l) => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '1.5rem', transition: 'all 0.2s',
            }} className="hover-card">
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                {l.label}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
