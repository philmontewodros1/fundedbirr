import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenge Rules — FundedBirr',
  description: 'FundedBirr trading challenge rules: profit targets, drawdown limits, and evaluation phases.',
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
