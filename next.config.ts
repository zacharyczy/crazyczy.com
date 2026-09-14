import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/wiki/Special:Redirect/file/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      { source: '/zh/:path+', destination: '/:path+/zh', permanent: true },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.crazyczy.com' }],
        destination: 'https://crazyczy.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
