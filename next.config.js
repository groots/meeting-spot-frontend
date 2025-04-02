/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable Lightning CSS
    optimizeCss: false
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://findameetingspot.com/api/:path*'
          : 'http://localhost:3001/api/:path*',
      },
    ]
  }
}

module.exports = nextConfig 