import type {
  IdentityProvider,
  RepositoryReader
} from '@no-code-collaboration-platform/application';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

import type { Database } from '../generated/database.types';
import { SupabaseIdentityProvider } from '../identity/supabase-identity-provider';
import { SupabaseRepositoryReader } from '../repositories/supabase-repository-reader';

export interface SupabaseServerAdapterOptions {
  readonly cookies: CookieMethodsServer;
  readonly publishableKey: string;
  readonly url: string;
}

export interface SupabaseServerAdapters {
  readonly identityProvider: IdentityProvider;
  readonly repositoryReader: RepositoryReader;
}

export function createSupabaseServerAdapters(
  options: SupabaseServerAdapterOptions
): SupabaseServerAdapters {
  const client = createServerClient<Database>(options.url, options.publishableKey, {
    cookies: options.cookies
  });

  return {
    identityProvider: new SupabaseIdentityProvider(client),
    repositoryReader: new SupabaseRepositoryReader(client)
  };
}
