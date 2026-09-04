import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'commons.wikimedia.org', pathname: '/wiki/Special:Redirect/file/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/wikipedia/commons/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.crazyczy.com' },
        ],
        destination: 'https://crazyczy.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
