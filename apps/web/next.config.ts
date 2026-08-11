import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: [
    '@no-code-collaboration-platform/application',
    '@no-code-collaboration-platform/domain',
    '@no-code-collaboration-platform/supabase',
    '@no-code-collaboration-platform/ui'
  ]
};

export default nextConfig;
