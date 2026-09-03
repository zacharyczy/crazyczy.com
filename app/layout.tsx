import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crazyczy.com'),
  title: {
    default: 'Zachary Cheng 程致远 · crazyczy.com',
    template: '%s · crazyczy.com',
  },
  description: 'Zachary Cheng 程致远的个人技术博客、项目、游戏与数字空间。',
  alternates: {
    canonical: '/zh/',
    languages: { 'zh-CN': '/zh/', en: '/en/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'crazyczy.com',
    title: 'I am Zachary Cheng 我是程致远',
    description: '个人技术博客、项目、游戏与数字空间。',
    url: 'https://crazyczy.com/zh/',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'I am Zachary Cheng 我是程致远 · crazyczy.com' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I am Zachary Cheng 我是程致远',
    description: '个人技术博客、项目、游戏与数字空间。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var s=localStorage.getItem('crazyczy-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
