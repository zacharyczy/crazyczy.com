import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
