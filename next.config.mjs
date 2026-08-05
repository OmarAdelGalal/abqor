/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/proxy-api/:path*',
        destination: 'https://mrstudy.net/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
