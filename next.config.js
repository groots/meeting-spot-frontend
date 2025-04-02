/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://meeting-spot-backend-270814322595.us-east1.run.app/api/:path*'
          : 'http://localhost:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 