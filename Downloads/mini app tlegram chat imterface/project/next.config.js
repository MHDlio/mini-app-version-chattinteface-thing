/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['telegram.org', 'web.telegram.org'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://telegram.org/',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://telegram.org/ https://web.telegram.org/;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
