import * as Sentry from '@sentry/nextjs';

const environment =
  process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
const enabled = environment === 'production' || environment === 'preview';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: enabled && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment,
  dataCollection: {
    userInfo: false,
    httpBodies: []
  },
  tracesSampleRate: environment === 'production' ? 0.1 : environment === 'preview' ? 1 : 0
});
