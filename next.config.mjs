import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile tldraw packages for proper bundling
  transpilePackages: [
    'tldraw',
    '@tldraw/editor',
    '@tldraw/tlschema',
    '@tldraw/utils',
    '@tldraw/state',
    '@tldraw/state-react',
    '@tldraw/store',
    '@tldraw/validate',
  ],
  
  webpack: (config, { isServer }) => {
    // Fix for tldraw multiple instance warning (only for webpack, not turbopack)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@tldraw/utils': require.resolve('@tldraw/utils'),
        '@tldraw/state': require.resolve('@tldraw/state'),
        '@tldraw/state-react': require.resolve('@tldraw/state-react'),
        '@tldraw/store': require.resolve('@tldraw/store'),
        '@tldraw/validate': require.resolve('@tldraw/validate'),
        '@tldraw/tlschema': require.resolve('@tldraw/tlschema'),
        '@tldraw/editor': require.resolve('@tldraw/editor'),
      };
    }
    return config;
  },
};

export default nextConfig;
