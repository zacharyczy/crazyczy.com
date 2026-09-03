import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crazyczy.com'),
  title: {
    default: 'CZY — Build things. Write the signal.',
    template: '%s · CZY',
  },
  description: 'CZY 的个人技术博客，记录代码、产品与持续创造。',
  alternates: {
    canonical: '/zh/',
    languages: { 'zh-CN': '/zh/', en: '/en/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'CZY',
    title: 'CZY — Build things. Write the signal.',
    description: '一个关于代码、产品与持续创造的个人空间。',
    url: 'https://crazyczy.com/zh/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CZY — Build things. Write the signal.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CZY — Build things. Write the signal.',
    description: '一个关于代码、产品与持续创造的个人空间。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  );
}
