/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  distDir: '.next',
  generateEtags: false,
  poweredByHeader: false,
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
  experimental: {},
  async rewrites() {
    // Use environment variable for API URL in production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/v1/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cache-Control' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cache-Control' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 