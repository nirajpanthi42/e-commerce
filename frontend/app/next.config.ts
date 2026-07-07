import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,


  // Environment variables (optional - Next.js handles .env files automatically)
  
  // Turbopack configuration (empty to silence the error)
  turbopack: {
    // Add any Turbopack-specific rules here if needed
    // For example, if you need to handle SVG files:
    // rules: {
    //   '*.svg': {
    //     loaders: ['@svgr/webpack'],
    //     as: '*.js',
    //   },
    // },
  },

  // If you need webpack for specific functionality, keep it here
  webpack: (config, { isServer }) => {
    // Only needed if you have specific webpack requirements
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;