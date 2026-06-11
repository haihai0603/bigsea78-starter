import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/shared/components/blocks/HeaderServer';
import { Footer } from '@/shared/components/blocks/footer';
import { site } from '@/site/config';

export const metadata: Metadata = {
  metadataBase: new URL('https://bigsea78.top'),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ['数字商品', '软件', '课程', '电子书', '在线购买', '正品'],
  authors: [{ name: 'BigSea78' }],
  creator: 'BigSea78',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://bigsea78.top',
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: site.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://bigsea78.top',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="dns-prefetch" href="https://bigsea78.top" />
        <link rel="preconnect" href="https://bigsea78.top" />
      </head>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
