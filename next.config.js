/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Use standalone for SPA behavior with dynamic routes
  output: 'standalone'
}

module.exports = nextConfig