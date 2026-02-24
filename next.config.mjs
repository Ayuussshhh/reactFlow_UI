/** @type {import('next').NextConfig} */
const nextConfig = {
  // On-demand entries configuration for better dev server performance
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Experimental features for optimization
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Webpack configuration for development/production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = process.env.NODE_ENV === 'production' ? false : 'eval-source-map';
    }
    return config;
  },
};

export default nextConfig;
