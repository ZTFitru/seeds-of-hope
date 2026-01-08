/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for Next.js 16+ (replaces `next export`)
  output: 'export',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
