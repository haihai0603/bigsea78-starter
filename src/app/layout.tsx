import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/shared/components/blocks/HeaderServer';
import { Footer } from '@/shared/components/blocks/footer';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'BigSea78',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Digital Products Store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
