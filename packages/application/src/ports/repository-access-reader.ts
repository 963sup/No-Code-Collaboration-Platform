import type { RepositoryAuthoritySources } from '@no-code-collaboration-platform/domain/access';

export interface RepositoryAccessQuery {
  readonly actorId: string;
  readonly repositoryId: string;
}

export interface RepositoryAccessReader {
  readRepositoryAccess(query: RepositoryAccessQuery): Promise<RepositoryAuthoritySources>;
}
