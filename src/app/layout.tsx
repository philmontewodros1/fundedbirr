import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'FundedBirr — Ethiopia\'s Funded Trader Platform',
  description: 'Pass our gold trading challenge and earn ETB payouts via Telebirr. Ethiopia\'s first prop trading evaluation platform.',
  openGraph: {
    title: 'FundedBirr — Ethiopia\'s Funded Trader Platform',
    description: 'Pass our gold trading challenge and earn ETB payouts via Telebirr. Ethiopia\'s first prop trading evaluation platform.',
    siteName: 'FundedBirr',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
