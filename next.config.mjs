/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output ships a minimal Node server we can run under pm2.
  output: 'standalone',
  // Image domains we serve avatars/banners/post media from.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.streamia.co' },
    ],
  },
  // We rename the build dir so it doesn't clash with Vite's `dist/`.
  distDir: '.next',
  // Strict mode is fine; we already use it.
  reactStrictMode: true,
}

export default nextConfig
