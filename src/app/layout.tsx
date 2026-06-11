import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import InstallBanner from '@/components/InstallBanner';

export const metadata: Metadata = {
  title: 'FundedBirr — Ethiopia\'s Funded Trader Platform',
  description: 'Pass our gold trading challenge and earn ETB payouts via Telebirr. Ethiopia\'s first prop trading evaluation platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FundedBirr',
  },
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FundedBirr" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#C9912A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <InstallBanner />
      </body>
    </html>
  );
}
