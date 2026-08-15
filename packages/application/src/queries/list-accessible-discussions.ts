import {
  isDiscussionCategory,
  isDiscussionStatus
} from '@no-code-collaboration-platform/domain/resource';

import type { DiscussionReader } from '../ports/discussion-repository';

export class ListAccessibleDiscussions {
  public constructor(private readonly reader: DiscussionReader) {}

  public execute(input: {
    readonly category?: string;
    readonly page?: number;
    readonly query?: string;
    readonly repositoryId: string;
    readonly status?: string;
  }) {
    return this.reader.listAccessibleDiscussions({
      category:
        input.category === 'all' || (input.category && isDiscussionCategory(input.category))
          ? input.category
          : 'all',
      page:
        Number.isSafeInteger(input.page) && input.page && input.page > 0
          ? Math.min(input.page, 10_000)
          : 1,
      pageSize: 20,
      query: input.query?.trim().slice(0, 200) ?? '',
      repositoryId: input.repositoryId,
      status:
        input.status === 'all' || (input.status && isDiscussionStatus(input.status))
          ? input.status
          : 'open'
    });
  }
}
