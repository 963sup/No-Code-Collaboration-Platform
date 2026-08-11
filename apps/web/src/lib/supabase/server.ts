import { createServerClient, type Database } from '@no-code-collaboration-platform/supabase';
import { cookies } from 'next/headers';

import { getSupabasePublicConfig } from './config';

export async function createWebServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. proxy.ts performs the refresh when needed.
        }
      }
    }
  });
}
