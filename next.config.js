/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14+ doesn't support api bodyParser in next.config.js
  // Use middleware.js or configure in route.js instead
  transpilePackages: ['recharts'],
}

module.exports = nextConfig
