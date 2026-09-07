import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crazyczy.com'),
  title: {
    default: 'Zachary Cheng 程致远 · crazyczy.com',
    template: '%s · crazyczy.com',
  },
  description:
    'Writing, projects, games, and a personal digital space by Zachary Cheng.',
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/zh/', en: '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: 'crazyczy.com',
    title: 'I am Zachary Cheng 我是程致远',
    description: 'Writing, projects, games, and a personal digital space.',
    url: 'https://crazyczy.com/',
    images: [
      {
        url: '/og.png',
        width: 1731,
        height: 909,
        alt: 'I am Zachary Cheng 我是程致远 · crazyczy.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I am Zachary Cheng 我是程致远',
    description: 'Writing, projects, games, and a personal digital space.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
