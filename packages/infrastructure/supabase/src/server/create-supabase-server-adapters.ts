import type {
  ActivityEventReader,
  CollaborationSearchReader,
  DiscussionReader,
  DiscussionWriter,
  ExploreReader,
  IdentityProvider,
  IssueReader,
  IssueWriter,
  NotificationReader,
  NotificationWriter,
  OrganizationWriter,
  PageReader,
  PageWriter,
  ProjectReader,
  RepositoryAccessReader,
  RepositoryCreationAccessReader,
  RepositoryReader,
  RepositoryRouteReader,
  RepositoryWriter
} from '@no-code-collaboration-platform/application';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

import { SupabaseRepositoryAccessReader } from '../access/supabase-repository-access-reader';
import { SupabaseRepositoryCreationAccessReader } from '../access/supabase-repository-creation-access-reader';
import { SupabaseActivityEventReader } from '../activity/supabase-activity-event-reader';
import type { Database } from '../generated/database.types';
import { SupabaseIdentityProvider } from '../identity/supabase-identity-provider';
import { SupabaseOrganizationCreation } from '../organizations/supabase-organization-creation';
import { SupabaseCollaborationProjections } from '../projections/supabase-collaboration-projections';
import { SupabaseOwnerRepositoryRouteReader } from '../repositories/supabase-owner-repository-route-reader';
import { SupabaseRepositoryWriter } from '../repositories/supabase-repository-creation';
import { SupabaseRepositoryReader } from '../repositories/supabase-repository-reader';
import { SupabasePageRepository } from '../resources/supabase-page-repository';
import { SupabaseIssueReader } from '../resources/supabase-issue-reader';
import { SupabaseDiscussionRepository } from '../resources/supabase-discussion-repository';

export interface SupabaseServerAdapterOptions {
  readonly cookies: CookieMethodsServer;
  readonly publishableKey: string;
  readonly url: string;
}

export interface SupabaseServerAdapters {
  readonly activityEventReader: ActivityEventReader;
  readonly collaborationSearchReader: CollaborationSearchReader;
  readonly discussionReader: DiscussionReader;
  readonly discussionWriter: DiscussionWriter;
  readonly exploreReader: ExploreReader;
  readonly identityProvider: IdentityProvider;
  readonly issueReader: IssueReader;
  readonly issueWriter: IssueWriter;
  readonly notificationReader: NotificationReader;
  readonly notificationWriter: NotificationWriter;
  readonly organizationWriter: OrganizationWriter;
  readonly pageReader: PageReader;
  readonly pageWriter: PageWriter;
  readonly projectReader: ProjectReader;
  readonly repositoryAccessReader: RepositoryAccessReader;
  readonly repositoryCreationAccessReader: RepositoryCreationAccessReader;
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
  const issueRepository = new SupabaseIssueReader(client);
  const discussionRepository = new SupabaseDiscussionRepository(client);
  const collaborationProjections = new SupabaseCollaborationProjections(client);
  const repositoryWriter = new SupabaseRepositoryWriter(client);

  return {
    activityEventReader: new SupabaseActivityEventReader(client),
    collaborationSearchReader: collaborationProjections,
    discussionReader: discussionRepository,
    discussionWriter: discussionRepository,
    exploreReader: collaborationProjections,
    identityProvider: new SupabaseIdentityProvider(client, {
      fetch: globalThis.fetch,
      projectUrl: options.url,
      publishableKey: options.publishableKey
    }),
    issueReader: issueRepository,
    issueWriter: issueRepository,
    notificationReader: collaborationProjections,
    notificationWriter: collaborationProjections,
    organizationWriter: new SupabaseOrganizationCreation(client),
    pageReader: pageRepository,
    pageWriter: pageRepository,
    projectReader: collaborationProjections,
    repositoryAccessReader: new SupabaseRepositoryAccessReader(client),
    repositoryCreationAccessReader: new SupabaseRepositoryCreationAccessReader(client),
    repositoryReader: new SupabaseRepositoryReader(client),
    repositoryRouteReader: new SupabaseOwnerRepositoryRouteReader(client),
    repositoryWriter
  };
}
