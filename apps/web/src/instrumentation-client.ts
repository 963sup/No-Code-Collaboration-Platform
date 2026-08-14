import * as Sentry from '@sentry/nextjs';

const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development';
const enabled = environment === 'production' || environment === 'preview';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: enabled && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
    httpHeaders: false,
    urlQueryParams: false
  },
  tracesSampleRate: environment === 'production' ? 0.1 : environment === 'preview' ? 1 : 0
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
