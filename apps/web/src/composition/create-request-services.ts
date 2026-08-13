import type { RepositoryAccessReader } from '@no-code-collaboration-platform/application';
import { createSupabaseServerAdapters } from '@no-code-collaboration-platform/supabase';
import { cookies } from 'next/headers';

import { getSupabasePublicConfig } from './supabase-config';

export async function createRequestServices() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabasePublicConfig();

  const adapters = createSupabaseServerAdapters({
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, _responseHeaders) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes the session before rendering.
        }
      }
    },
    publishableKey,
    url
  });

  return {
    ...adapters,
    repositoryAccessReader:
      adapters.repositoryAuthoritySourceReader as unknown as RepositoryAccessReader
  };
}
