import type {
  RepositoryDraft,
  RepositoryOwner,
  RepositorySummary
} from '@no-code-collaboration-platform/domain';

export interface RepositoryCreationOwner {
  readonly name: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
}

export interface RepositoryCreationOwnerReader {
  listCreatableRepositoryOwners(actorId: string): Promise<readonly RepositoryCreationOwner[]>;
}

export type RepositoryPersistenceResult =
  | { readonly ok: true; readonly repository: RepositorySummary }
  | { readonly ok: false; readonly reason: 'forbidden' | 'slug-taken' };

export interface RepositoryWriter {
  createRepository(draft: RepositoryDraft): Promise<RepositoryPersistenceResult>;
}
