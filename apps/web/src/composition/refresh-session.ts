import { GetCurrentIdentity } from '@no-code-collaboration-platform/application';
import { createSupabaseServerAdapters } from '@no-code-collaboration-platform/supabase';
import { type NextRequest, NextResponse } from 'next/server';

import { classifyRouteAccess, resolvePostAuthDestination } from '@/auth/auth-navigation';

import { getSupabasePublicConfig } from './supabase-config';

function applyCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export async function refreshSession(request: NextRequest) {
  const responseMutators: Array<(response: NextResponse) => void> = [];

  function createResponse() {
    const response = NextResponse.next({ request });
    responseMutators.forEach((mutate) => mutate(response));
    return applyCacheHeaders(response);
  }

  function createRedirectResponse(url: URL) {
    const response = NextResponse.redirect(url);
    responseMutators.forEach((mutate) => mutate(response));
    return applyCacheHeaders(response);
  }

  let response = createResponse();
  const { publishableKey, url } = getSupabasePublicConfig();
  const { identityProvider } = createSupabaseServerAdapters({
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        responseMutators.push((target) => {
          cookiesToSet.forEach(({ name, options, value }) => {
            target.cookies.set(name, value, options);
          });
          Object.entries(responseHeaders).forEach(([name, value]) => {
            target.headers.set(name, value);
          });
        });
        response = createResponse();
      }
    },
    publishableKey,
    url
  });

  const identity = await new GetCurrentIdentity(identityProvider).execute();
  const routeAccess = classifyRouteAccess(request.nextUrl.pathname);

  if (!identity && routeAccess === 'authenticated') {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    signInUrl.search = '';
    signInUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return createRedirectResponse(signInUrl);
  }

  if (identity && routeAccess === 'anonymous-only') {
    const destination = resolvePostAuthDestination(request.nextUrl.searchParams.get('next'));
    return createRedirectResponse(new URL(destination, request.url));
  }

  return response;
}
