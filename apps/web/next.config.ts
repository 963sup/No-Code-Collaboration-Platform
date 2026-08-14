import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
const isVercelBuild = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: sentryEnvironment
  },
  transpilePackages: [
    '@no-code-collaboration-platform/application',
    '@no-code-collaboration-platform/domain',
    '@no-code-collaboration-platform/supabase',
    '@no-code-collaboration-platform/ui'
  ]
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: isVercelBuild ? process.env.SENTRY_AUTH_TOKEN : undefined,
  silent: !isVercelBuild,
  telemetry: false,
  useRunAfterProductionCompileHook: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  }
});
