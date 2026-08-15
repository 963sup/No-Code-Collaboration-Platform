import type { RepositoryDraft, RepositorySummary } from '@no-code-collaboration-platform/domain';

export type RepositoryPersistenceResult =
  | { readonly ok: true; readonly repository: RepositorySummary }
  | { readonly ok: false; readonly reason: 'forbidden' | 'slug-taken' };

export interface RepositoryWriter {
  createRepository(draft: RepositoryDraft): Promise<RepositoryPersistenceResult>;
}
