import type { ActivityEventSummary } from '@no-code-collaboration-platform/domain/activity';

export interface ActivityEventReader {
  listAccessibleRepositoryActivity(
    repositoryId: string,
    limit: number
  ): Promise<readonly ActivityEventSummary[]>;
}
