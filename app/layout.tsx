import { headers } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crazyczy.com'),
  title: {
    default: 'Zachary Cheng · crazyczy.com',
    template: '%s · crazyczy.com',
  },
  description:
    'An English-first personal site by Zachary Cheng: writing, projects, and games, with Chinese support.',
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/zh/', en: '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'crazyczy.com',
    title: 'I am Zachary Cheng',
    description:
      'Writing, projects, and games in English, with Chinese support.',
    url: 'https://crazyczy.com/',
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'I am Zachary Cheng · crazyczy.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I am Zachary Cheng',
    description:
      'Writing, projects, and games in English, with Chinese support.',
    images: ['/og.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language =
    (await headers()).get('x-site-language') === 'zh' ? 'zh-CN' : 'en';
  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('crazyczy-theme');var d=s==='dark';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
