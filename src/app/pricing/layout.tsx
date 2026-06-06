import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenge Plans & Pricing — FundedBirr',
  description: 'BF 10K for 3,000 ETB to BF 100K for 20,000 ETB. Pay via Telebirr. Profit target 10%, daily loss 5%, max loss 10%.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
