import { createServerClient, type Database } from '@no-code-collaboration-platform/supabase';
import { type NextRequest, NextResponse } from 'next/server';

import { getSupabasePublicConfig } from './config';

function isAppRoute(pathname: string) {
  return pathname === '/app' || pathname.startsWith('/app/');
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicConfig();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  if (!isAuthenticated && isAppRoute(request.nextUrl.pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    signInUrl.search = '';
    signInUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && request.nextUrl.pathname === '/sign-in') {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = '/app';
    appUrl.search = '';
    return NextResponse.redirect(appUrl);
  }

  return response;
}
