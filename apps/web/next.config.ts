import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  transpilePackages: [
    '@no-code-collaboration-platform/application',
    '@no-code-collaboration-platform/domain',
    '@no-code-collaboration-platform/supabase',
    '@no-code-collaboration-platform/ui'
  ]
};

export default nextConfig;
