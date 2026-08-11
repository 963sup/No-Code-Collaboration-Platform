import type { RepositoryAuthoritySources } from '@no-code-collaboration-platform/domain';

export interface RepositoryAuthoritySourceQuery {
  readonly actorId: string;
  readonly organizationId: string;
  readonly repositoryId: string;
}

export interface RepositoryAuthoritySourceReader {
  readRepositoryAuthoritySources(
    query: RepositoryAuthoritySourceQuery
  ): Promise<RepositoryAuthoritySources>;
}
