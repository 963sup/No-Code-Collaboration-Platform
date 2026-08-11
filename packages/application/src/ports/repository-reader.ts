import type { RepositorySummary } from '@no-code-collaboration-platform/domain';

export interface RepositoryReader {
  findAccessibleRepositoryById(repositoryId: string): Promise<RepositorySummary | null>;
  listAccessibleRepositories(): Promise<readonly RepositorySummary[]>;
}
