import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {}, // Add this line
  },
  // Your existing Next.js config
};

// PWA disabled for development - causing Turbopack conflicts
export default nextConfig;
