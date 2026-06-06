import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — FundedBirr',
  description:
    'Two-phase evaluation for funded traders in Ethiopia. Buy a challenge, pass Phase 1 (10%) and Phase 2 (5%), earn 80% profit split. No time limit.',
  openGraph: {
    title: 'How It Works — FundedBirr',
    description:
      'Two-phase evaluation for funded traders in Ethiopia. Buy a challenge, pass Phase 1 (10%) and Phase 2 (5%), earn 80% profit split. No time limit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
