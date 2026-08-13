import type { ActivityEventReader } from '../ports/activity-event-reader';

export interface ListRepositoryActivityInput {
  readonly limit?: number;
  readonly repositoryId: string;
}

export class ListRepositoryActivity {
  public constructor(private readonly activityEventReader: ActivityEventReader) {}

  public execute(input: ListRepositoryActivityInput) {
    const limit = Math.max(1, Math.min(input.limit ?? 20, 50));
    return this.activityEventReader.listAccessibleRepositoryActivity(input.repositoryId, limit);
  }
}
