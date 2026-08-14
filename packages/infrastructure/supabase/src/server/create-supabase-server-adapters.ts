import type {
  ActivityEventReader,
  IdentityProvider,
  IssueReader,
  OrganizationWriter,
  PageReader,
  PageWriter,
  RepositoryAccessReader,
  RepositoryCreationOwnerReader,
  RepositoryReader,
  RepositoryRouteReader,
  RepositoryWriter
} from '@no-code-collaboration-platform/application';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

import { SupabaseRepositoryAccessReader } from '../access/supabase-repository-access-reader';
import { SupabaseActivityEventReader } from '../activity/supabase-activity-event-reader';
import type { Database } from '../generated/database.types';
import { SupabaseIdentityProvider } from '../identity/supabase-identity-provider';
import { SupabaseOrganizationCreation } from '../organizations/supabase-organization-creation';
import { SupabaseOwnerRepositoryRouteReader } from '../repositories/supabase-owner-repository-route-reader';
import { SupabaseRepositoryCreation } from '../repositories/supabase-repository-creation';
import { SupabaseRepositoryReader } from '../repositories/supabase-repository-reader';
import { SupabasePageRepository } from '../resources/supabase-page-repository';
import { SupabaseIssueReader } from '../resources/supabase-issue-reader';

export interface SupabaseServerAdapterOptions {
  readonly cookies: CookieMethodsServer;
  readonly publishableKey: string;
  readonly url: string;
}

export interface SupabaseServerAdapters {
  readonly activityEventReader: ActivityEventReader;
  readonly identityProvider: IdentityProvider;
  readonly issueReader: IssueReader;
  readonly organizationWriter: OrganizationWriter;
  readonly pageReader: PageReader;
  readonly pageWriter: PageWriter;
  readonly repositoryAccessReader: RepositoryAccessReader;
  readonly repositoryCreationOwnerReader: RepositoryCreationOwnerReader;
  readonly repositoryReader: RepositoryReader;
  readonly repositoryRouteReader: RepositoryRouteReader;
  readonly repositoryWriter: RepositoryWriter;
}

export function createSupabaseServerAdapters(
  options: SupabaseServerAdapterOptions
): SupabaseServerAdapters {
  const client = createServerClient<Database>(options.url, options.publishableKey, {
    cookies: options.cookies
  });
  const pageRepository = new SupabasePageRepository(client);
  const repositoryCreation = new SupabaseRepositoryCreation(client);

  return {
    activityEventReader: new SupabaseActivityEventReader(client),
    identityProvider: new SupabaseIdentityProvider(client, {
      fetch: globalThis.fetch,
      projectUrl: options.url,
      publishableKey: options.publishableKey
    }),
    issueReader: new SupabaseIssueReader(client),
    organizationWriter: new SupabaseOrganizationCreation(client),
    pageReader: pageRepository,
    pageWriter: pageRepository,
    repositoryAccessReader: new SupabaseRepositoryAccessReader(client),
    repositoryCreationOwnerReader: repositoryCreation,
    repositoryReader: new SupabaseRepositoryReader(client),
    repositoryRouteReader: new SupabaseOwnerRepositoryRouteReader(client),
    repositoryWriter: repositoryCreation
  };
}
