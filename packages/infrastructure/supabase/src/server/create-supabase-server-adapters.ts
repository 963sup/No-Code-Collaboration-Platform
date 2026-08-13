import type {
  ActivityEventReader,
  IdentityProvider,
  PageReader,
  PageWriter,
  RepositoryAuthoritySourceReader,
  RepositoryReader,
  RepositoryRouteReader
} from '@no-code-collaboration-platform/application';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

import { SupabaseRepositoryAuthoritySourceReader } from '../access/supabase-repository-authority-source-reader';
import { SupabaseActivityEventReader } from '../activity/supabase-activity-event-reader';
import type { Database } from '../generated/database.types';
import { SupabaseIdentityProvider } from '../identity/supabase-identity-provider';
import { SupabaseRepositoryReader } from '../repositories/supabase-repository-reader';
import { SupabaseRepositoryRouteReader } from '../repositories/supabase-repository-route-reader';
import { SupabasePageRepository } from '../resources/supabase-page-repository';

export interface SupabaseServerAdapterOptions {
  readonly cookies: CookieMethodsServer;
  readonly publishableKey: string;
  readonly url: string;
}

export interface SupabaseServerAdapters {
  readonly activityEventReader: ActivityEventReader;
  readonly identityProvider: IdentityProvider;
  readonly pageReader: PageReader;
  readonly pageWriter: PageWriter;
  readonly repositoryAuthoritySourceReader: RepositoryAuthoritySourceReader;
  readonly repositoryReader: RepositoryReader;
  readonly repositoryRouteReader: RepositoryRouteReader;
}

export function createSupabaseServerAdapters(
  options: SupabaseServerAdapterOptions
): SupabaseServerAdapters {
  const client = createServerClient<Database>(options.url, options.publishableKey, {
    cookies: options.cookies
  });
  const pageRepository = new SupabasePageRepository(client);

  return {
    activityEventReader: new SupabaseActivityEventReader(client),
    identityProvider: new SupabaseIdentityProvider(client, {
      fetch: globalThis.fetch,
      projectUrl: options.url,
      publishableKey: options.publishableKey
    }),
    pageReader: pageRepository,
    pageWriter: pageRepository,
    repositoryAuthoritySourceReader: new SupabaseRepositoryAuthoritySourceReader(client),
    repositoryReader: new SupabaseRepositoryReader(client),
    repositoryRouteReader: new SupabaseRepositoryRouteReader(client)
  };
}
