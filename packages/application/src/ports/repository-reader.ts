import type { RepositorySummary } from '@no-code-collaboration-platform/domain';

export interface RepositoryReader {
  listAccessibleRepositories(): Promise<readonly RepositorySummary[]>;
}
