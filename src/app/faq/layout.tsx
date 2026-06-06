import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — FundedBirr',
  description: 'Frequently asked questions about FundedBirr challenges, payouts, and rules.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
