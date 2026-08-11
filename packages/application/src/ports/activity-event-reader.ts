import type { ActivityEventSummary } from '@no-code-collaboration-platform/domain';

export interface ActivityEventReader {
  listAccessibleRepositoryActivity(
    repositoryId: string,
    limit: number
  ): Promise<readonly ActivityEventSummary[]>;
}
